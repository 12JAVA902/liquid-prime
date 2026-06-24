import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Mic, MicOff, Video, VideoOff, RotateCcw, Phone, Signal, Wifi } from "lucide-react";
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
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');
  
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
      .on('broadcast' as any, { event: 'signaling' }, handleSignalingMessage)
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
  
  // Simulate connection quality changes
  useEffect(() => {
    const interval = setInterval(() => {
      const quality = Math.random();
      if (quality > 0.7) setConnectionQuality('excellent');
      else if (quality > 0.3) setConnectionQuality('good');
      else setConnectionQuality('poor');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated liquid background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            borderRadius: ['20%', '50%', '20%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/30 via-purple-500/20 to-pink-500/30 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            borderRadius: ['50%', '20%', '50%']
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 via-cyan-500/30 to-primary/20 blur-3xl"
        />
      </div>
      
      {/* Remote video (full screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 backdrop-blur-[2px]" />
      
      {/* Top info */}
      <div className="relative z-10 safe-area-top p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass-elevated rounded-3xl p-5 mx-2"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: callStatus === 'ringing' ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1, repeat: callStatus === 'ringing' ? Infinity : 0 }}
                className={`w-3 h-3 rounded-full ${
                  callStatus === 'connected' ? 'bg-green-400' :
                  callStatus === 'connecting' ? 'bg-yellow-400' :
                  callStatus === 'ringing' ? 'bg-primary animate-pulse' :
                  'bg-red-400'
                }`}
              />
              <p className="text-sm text-white/90">
                {callStatus === 'ringing' && 'Ringing...'}
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'connected' && 'Connected'}
                {callStatus === 'ended' && 'Call Ended'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-white/70">
                <Signal className="w-4 h-4" />
                <span className="text-xs">{connectionQuality === 'excellent' ? 'Strong' : connectionQuality === 'good' ? 'Good' : 'Poor'}</span>
              </div>
              <div className="flex items-center gap-1 text-white/70">
                <Wifi className="w-4 h-4" />
                <span className="text-xs">5G</span>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-white text-center mb-1">{calleeName}</p>
          <p className="text-3xl font-light text-primary text-center">{formatTime(callTime)}</p>
        </motion.div>
      </div>

      {/* Self view (small) */}
      <div className="relative z-10 flex-1 flex items-end justify-end p-4">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-32 h-44 rounded-3xl overflow-hidden liquid-glass-elevated shadow-2xl border border-white/20"
        >
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            <span className="text-xs text-white/80">You</span>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 safe-area-bottom pb-8"
      >
        <div className="liquid-glass-elevated rounded-3xl mx-4 p-6">
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute} 
              className={`depth-press w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden ${
                muted ? 'bg-destructive/20 border-2 border-destructive' : 'liquid-glass-subtle'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              {muted ? <MicOff className="w-6 h-6 text-destructive relative z-10" /> : <Mic className="w-6 h-6 text-white relative z-10" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleVideo} 
              className={`depth-press w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden ${
                !videoOn ? 'bg-destructive/20 border-2 border-destructive' : 'liquid-glass-subtle'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              {videoOn ? <Video className="w-6 h-6 text-white relative z-10" /> : <VideoOff className="w-6 h-6 text-destructive relative z-10" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="depth-press w-14 h-14 rounded-full liquid-glass-subtle flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <RotateCcw className="w-6 h-6 text-white relative z-10" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={endCall} 
              className="depth-press w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center relative overflow-hidden shadow-lg shadow-red-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <PhoneOff className="w-7 h-7 text-white relative z-10" />
            </motion.button>
          </div>
          
          {/* Effect buttons row */}
          <div className="flex justify-center gap-3 mt-4">
            {['Blur', 'Beauty', 'Filters'].map((effect) => (
              <motion.button
                key={effect}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full liquid-glass-subtle text-xs text-white/80 font-medium"
              >
                {effect}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CallPage;
