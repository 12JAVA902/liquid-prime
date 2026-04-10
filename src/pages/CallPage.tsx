import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PhoneOff, Mic, MicOff, Video, VideoOff, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CallPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [calleeName, setCalleeName] = useState("User");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Fetch callee name
    if (userId) {
      supabase.from("profiles").select("display_name, username").eq("user_id", userId).single()
        .then(({ data }) => {
          if (data) setCalleeName(data.display_name || data.username || "User");
        });
    }

    // Start local camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log("Camera access denied");
      }
    };
    startCamera();

    // Call timer
    const timer = setInterval(() => setCallTime(t => t + 1), 1000);

    return () => {
      clearInterval(timer);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [userId]);

  const toggleMute = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOn(videoTrack.enabled);
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    navigate(-1);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background video */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />

      {/* Top info */}
      <div className="relative z-10 safe-area-top p-6 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground mb-1">Video Call</p>
          <p className="text-xl text-display text-foreground">{calleeName}</p>
          <p className="text-sm text-primary mt-1">{formatTime(callTime)}</p>
        </motion.div>
      </div>

      {/* Self view (small) */}
      <div className="relative z-10 flex-1 flex items-end justify-end p-4">
        <div className="w-32 h-44 rounded-2xl overflow-hidden liquid-glass-elevated">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="relative z-10 safe-area-bottom pb-8"
      >
        <div className="flex justify-center gap-5">
          <button onClick={toggleMute} className="depth-press w-14 h-14 rounded-full liquid-glass-elevated flex items-center justify-center">
            {muted ? <MicOff className="w-6 h-6 text-destructive relative z-10" /> : <Mic className="w-6 h-6 text-foreground relative z-10" />}
          </button>
          <button onClick={toggleVideo} className="depth-press w-14 h-14 rounded-full liquid-glass-elevated flex items-center justify-center">
            {videoOn ? <Video className="w-6 h-6 text-foreground relative z-10" /> : <VideoOff className="w-6 h-6 text-destructive relative z-10" />}
          </button>
          <button className="depth-press w-14 h-14 rounded-full liquid-glass-elevated flex items-center justify-center">
            <RotateCcw className="w-6 h-6 text-foreground relative z-10" />
          </button>
          <button onClick={endCall} className="depth-press w-14 h-14 rounded-full bg-destructive flex items-center justify-center">
            <PhoneOff className="w-6 h-6 text-primary-foreground" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CallPage;
