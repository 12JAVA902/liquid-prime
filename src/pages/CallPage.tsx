import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PhoneOff, Mic, MicOff, Video, VideoOff, RotateCcw, Phone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WebRTCManager, SignalingMessage } from "@/utils/webrtc";

const CallPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [calleeName, setCalleeName] = useState("User");
  const [isIncoming, setIsIncoming] = useState(false);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected' | 'ended'>('ringing');
  const [isInitiator, setIsInitiator] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;
    
    // Initialize WebRTC manager
    webrtcRef.current = new WebRTCManager();
    
    // Fetch callee name
    supabase.from("profiles").select("display_name, username").eq("user_id", userId).single()
      .then(({ data }) => {
        if (data) setCalleeName(data.display_name || data.username || "User");
      });

    // Initialize call
    initializeCall();

    // Call timer
    const timer = setInterval(() => setCallTime(t => t + 1), 1000);

    return () => {
      clearInterval(timer);
      endCall();
    };
  }, [userId]);
  
  const initializeCall = async () => {
    if (!webrtcRef.current || !userId) return;
    
    try {
      // Start local camera
      const stream = await webrtcRef.current.startLocalStream(true, true);
      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Set up signaling
      setupSignaling();
      
      // Start call process
      setIsInitiator(true);
      setCallStatus('connecting');
      
      // Create and send offer
      const offer = await webrtcRef.current.createOffer();
      await sendSignalingMessage({
        type: 'call-request',
        payload: offer,
        from: '', // Current user ID would go here
        to: userId
      });
      
    } catch (err) {
      console.error('Failed to initialize call:', err);
      setCallStatus('ended');
    }
  };
  
  const setupSignaling = () => {
    if (!webrtcRef.current || !userId) return;
    
    // Set up real-time signaling channel
    const channelName = `call-${userId}`;
    channelRef.current = supabase
      .channel(channelName)
      .on('broadcast', { event: 'signaling' }, handleSignalingMessage)
      .subscribe();
      
    webrtcRef.current.setSignalingChannel({
        send: sendSignalingMessage
      });
    
    // Set up callbacks
    webrtcRef.current.setOnRemoteStream((stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setCallStatus('connected');
    });
    
    webrtcRef.current.setOnCallEnded(() => {
      setCallStatus('ended');
      setTimeout(() => navigate(-1), 1000);
    });
  };
  
  const handleSignalingMessage = async (payload: SignalingMessage) => {
    if (!webrtcRef.current) return;
    
    switch (payload.type) {
      case 'call-request':
        // Handle incoming call (if we weren't the initiator)
        if (!isInitiator) {
          setCallStatus('connecting');
          await webrtcRef.current.createAnswer(payload.payload);
          await sendSignalingMessage({
            type: 'call-accepted',
            payload: await webrtcRef.current.createAnswer(payload.payload),
            from: '', // Current user ID
            to: payload.from
          });
        }
        break;
        
      case 'call-accepted':
        if (isInitiator) {
          await webrtcRef.current.handleAnswer(payload.payload);
        }
        break;
        
      case 'ice-candidate':
        await webrtcRef.current.handleIceCandidate(payload.payload);
        break;
        
      case 'call-ended':
        setCallStatus('ended');
        setTimeout(() => navigate(-1), 1000);
        break;
    }
  };
  
  const sendSignalingMessage = async (message: SignalingMessage) => {
    if (!userId) return;
    
    try {
      await supabase.channel(`call-${userId}`).send({
        type: 'broadcast',
        event: 'signaling',
        payload: message
      });
    } catch (error) {
      console.error('Failed to send signaling message:', error);
    }
  };

  const toggleMute = () => {
    if (webrtcRef.current) {
      webrtcRef.current.toggleAudio(!muted);
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (webrtcRef.current) {
      webrtcRef.current.toggleVideo(!videoOn);
      setVideoOn(!videoOn);
    }
  };

  const endCall = async () => {
    if (webrtcRef.current) {
      webrtcRef.current.endCall();
    }
    
    // Send call ended signal
    await sendSignalingMessage({
      type: 'call-ended',
      payload: {},
      from: '',
      to: userId || ''
    });
    
    // Clean up channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    setCallStatus('ended');
    setTimeout(() => navigate(-1), 1000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Remote video (full screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Local video (small overlay) */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      
      {/* Top info */}
      <div className="relative z-10 safe-area-top p-6 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground mb-1">
            {callStatus === 'ringing' && 'Ringing...'}
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'connected' && 'Connected'}
            {callStatus === 'ended' && 'Call Ended'}
          </p>
          <p className="text-xl text-display text-foreground">{calleeName}</p>
          <p className="text-sm text-primary mt-1">{formatTime(callTime)}</p>
        </motion.div>
      </div>

      {/* Self view (small) */}
      <div className="relative z-10 flex-1 flex items-end justify-end p-4">
        <div className="w-32 h-44 rounded-2xl overflow-hidden liquid-glass-elevated">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover mirror" 
          />
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
