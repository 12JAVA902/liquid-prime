import { logSecurityEvent } from "@/utils/audit";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { PhoneOff, Mic, MicOff, Video, VideoOff, RefreshCw } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startRingtone } from "@/hooks/useRingtone";
import { getRtcConfig } from "@/utils/iceConfig";

export const rtcChannelName = (a: string, b: string) => `rtc-${[a, b].sort().join("--")}`;


type Status = "ringing" | "connecting" | "connected" | "ended";

const CallPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [params] = useSearchParams();
  const isCallee = params.get("incoming") === "1";
  const audioOnly = params.get("audio") === "1";
  const { user } = useAuth();

  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(!audioOnly);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [callTime, setCallTime] = useState(0);
  const [peerName, setPeerName] = useState("User");
  const [status, setStatus] = useState<Status>("ringing");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);
  const stopRingRef = useRef<(() => void) | null>(null);
  const endedRef = useRef(false);

  const send = useCallback(
    (event: string, payload: Record<string, unknown> = {}) => {
      if (event !== "ice") {
        void logSecurityEvent("realtime", `call_${event}_sent`, String(payload.to ?? "") || undefined);
      }
      channelRef.current?.send({
        type: "broadcast",
        event,
        payload: { ...payload, from: user?.id },
      });
    },
    [user?.id],
  );


  const cleanup = useCallback(() => {
    stopRingRef.current?.();
    stopRingRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  const hangUp = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    send("hangup");
    setStatus("ended");
    cleanup();
    setTimeout(() => navigate("/messages"), 600);
  }, [cleanup, navigate, send]);

  useEffect(() => {
    if (!userId || !user) return;
    let cancelled = false;

    supabase
      .from("profiles")
      .select("display_name, username")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data && !cancelled) setPeerName(data.display_name || data.username || "User");
      });

    const start = async () => {
      const pc = new RTCPeerConnection(getRtcConfig());
      pcRef.current = pc;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: audioOnly ? false : { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) send("ice", { candidate: e.candidate.toJSON() });
      };
      pc.onconnectionstatechange = () => {
        const s = pc.connectionState;
        if (s === "connected") {
          stopRingRef.current?.();
          stopRingRef.current = null;
          setStatus("connected");
        }
        // Transient network flips: re-gather against Google STUN before giving up.
        if (s === "disconnected") {
          setStatus("connecting");
          try {
            pc.restartIce();
          } catch {
            /* older browsers */
          }
          setTimeout(() => {
            if (pcRef.current === pc && pc.connectionState !== "connected") hangUp();
          }, 6000);
          return;
        }
        if (s === "failed" || s === "closed") hangUp();
      };


      const channel = supabase.channel(rtcChannelName(user.id, userId), {
        config: { broadcast: { self: false } },
      });
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "offer" }, async ({ payload }: any) => {
          if (payload.from === user.id || !pcRef.current) return;
          setStatus("connecting");
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          for (const c of pendingIce.current) await pcRef.current.addIceCandidate(c);
          pendingIce.current = [];
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          send("answer", { sdp: answer });
        })
        .on("broadcast", { event: "answer" }, async ({ payload }: any) => {
          if (payload.from === user.id || !pcRef.current) return;
          if (pcRef.current.signalingState === "have-local-offer") {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            for (const c of pendingIce.current) await pcRef.current.addIceCandidate(c);
            pendingIce.current = [];
          }
        })
        .on("broadcast", { event: "ice" }, async ({ payload }: any) => {
          if (payload.from === user.id || !pcRef.current) return;
          if (pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(payload.candidate).catch(() => {});
          } else {
            pendingIce.current.push(payload.candidate);
          }
        })
        .on("broadcast", { event: "hangup" }, () => {
          if (endedRef.current) return;
          endedRef.current = true;
          setStatus("ended");
          cleanup();
          setTimeout(() => navigate("/messages"), 600);
        })
        .subscribe(async (state) => {
          if (state !== "SUBSCRIBED" || cancelled) return;
          if (isCallee) {
            // Tell the caller we are here so they (re)send the offer.
            send("ready");
            setStatus("connecting");
          } else {
            stopRingRef.current = startRingtone();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            send("offer", { sdp: offer });
          }
        });

      if (!isCallee) {
        channel.on("broadcast", { event: "ready" }, async () => {
          if (!pcRef.current || pcRef.current.signalingState !== "stable") return;
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
          send("offer", { sdp: offer });
        });
      }
    };

    start().catch((err) => {
      console.error("Call init failed:", err);
      setStatus("ended");
    });

    const timer = setInterval(() => setCallTime((t) => t + 1), 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user?.id]);

  const toggleMute = () => {
    const next = !muted;
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  };

  const toggleVideo = () => {
    const next = !videoOn;
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
    setVideoOn(next);
  };

  const flipCamera = async () => {
    const next = facing === "user" ? "environment" : "user";
    try {
      const fresh = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next },
        audio: false,
      });
      const newTrack = fresh.getVideoTracks()[0];
      const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === "video");
      if (sender && newTrack) await sender.replaceTrack(newTrack);
      const old = streamRef.current?.getVideoTracks()[0];
      if (old && streamRef.current) {
        streamRef.current.removeTrack(old);
        old.stop();
        streamRef.current.addTrack(newTrack);
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = streamRef.current;
      setFacing(next);
    } catch {
      /* single-camera device */
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Liquid glass blobs — blue · red · green */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--brand-blue) / 0.5), transparent 70%)", filter: "blur(60px)" }}
          animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--brand-red) / 0.45), transparent 70%)", filter: "blur(60px)" }}
          animate={{ x: [0, -60, 0], y: [0, -80, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[360px] h-[360px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--brand-green) / 0.4), transparent 70%)", filter: "blur(70px)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      {status !== "connected" && <div className="absolute inset-0 bg-background/40 backdrop-blur-md" />}

      <div className="relative z-10 safe-area-top p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-sm liquid-glass-elevated rounded-3xl px-6 py-4 text-center"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 relative z-10">
            {status === "ringing" && "• Ringing"}
            {status === "connecting" && "• Connecting"}
            {status === "connected" && "• Connected"}
            {status === "ended" && "• Call ended"}
          </p>
          <p className="text-display text-foreground text-2xl relative z-10">{peerName}</p>
          <p className="text-sm text-primary mt-1 font-mono relative z-10">{formatTime(callTime)}</p>
        </motion.div>
      </div>

      <div className="relative z-10 flex-1 flex items-end justify-end p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          drag
          dragConstraints={{ left: -220, right: 0, top: -420, bottom: 0 }}
          className="w-32 h-44 rounded-3xl overflow-hidden liquid-glass-elevated border border-white/20 shadow-2xl cursor-grab active:cursor-grabbing"
        >
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror relative z-10" />
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 safe-area-bottom pb-8"
      >
        <div className="mx-auto max-w-sm liquid-glass-elevated rounded-full py-3 px-4">
          <div className="flex justify-center gap-3 relative z-10">
            <button
              onClick={toggleMute}
              aria-label="Toggle microphone"
              className={`depth-press w-14 h-14 rounded-full flex items-center justify-center ${muted ? "bg-destructive/30" : "liquid-glass-subtle"}`}
            >
              {muted ? <MicOff className="w-6 h-6 text-destructive" /> : <Mic className="w-6 h-6 text-foreground" />}
            </button>
            <button
              onClick={toggleVideo}
              aria-label="Toggle camera"
              className={`depth-press w-14 h-14 rounded-full flex items-center justify-center ${!videoOn ? "bg-destructive/30" : "liquid-glass-subtle"}`}
            >
              {videoOn ? <Video className="w-6 h-6 text-foreground" /> : <VideoOff className="w-6 h-6 text-destructive" />}
            </button>
            <button
              onClick={flipCamera}
              aria-label="Switch camera"
              className="depth-press w-14 h-14 rounded-full liquid-glass-subtle flex items-center justify-center"
            >
              <RefreshCw className="w-6 h-6 text-foreground" />
            </button>
            <button
              onClick={hangUp}
              aria-label="End call"
              className="depth-press w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/50"
            >
              <PhoneOff className="w-6 h-6 text-destructive-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CallPage;
