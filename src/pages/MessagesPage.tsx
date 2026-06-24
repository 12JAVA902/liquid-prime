import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Phone, Video, Send, PhoneOff, Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import IncomingCallModal from "@/components/IncomingCallModal";
import { WebRTCManager, SignalingMessage } from "@/utils/webrtc";
import { toast } from "sonner";

interface ChatUser {
  user_id: string;
  display_name: string | null;
  username: string | null;
  lastMsg?: string;
  lastTime?: string;
  unread?: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatUser[]>([]);
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msg, setMsg] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [incomingCall, setIncomingCall] = useState<{ caller: ChatUser; signal: any } | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected' | 'ended'>('ringing');
  const bottomRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const channelRef = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch users to chat with
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .neq("user_id", user.id)
        .limit(20);
      if (data) setConversations(data);
    };
    fetchConversations();
  }, [user]);

  // WebRTC signaling for incoming calls
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase.channel(`calls-${user.id}`);
    
    channel
      .on('broadcast', { event: 'call-offer' }, async (payload: any) => {
        const caller = conversations.find(c => c.user_id === payload.callerId);
        if (caller) {
          setIncomingCall({ caller, signal: payload.offer });
        }
      })
      .on('broadcast', { event: 'call-answer' }, async (payload: any) => {
        if (webrtcRef.current) {
          await webrtcRef.current.handleAnswer(payload.answer);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async (payload: any) => {
        if (webrtcRef.current) {
          await webrtcRef.current.handleIceCandidate(payload.candidate);
        }
      })
      .on('broadcast', { event: 'call-ended' }, () => {
        endCall();
      })
      .on('broadcast', { event: 'call-declined' }, () => {
        setIsInCall(false);
        setIncomingCall(null);
      })
      .subscribe();
      
    channelRef.current = channel;
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversations]);
  
  const startCall = async (recipient: ChatUser) => {
    try {
      // Initialize WebRTC manager
      webrtcRef.current = new WebRTCManager();
      
      // Start local stream
      const stream = await webrtcRef.current.startLocalStream(true, true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Set up remote stream callback
      webrtcRef.current.setOnRemoteStream((remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallStatus('connected');
      });
      
      webrtcRef.current.setOnCallEnded(() => {
        endCall();
      });
      
      // Set up signaling channel
      const channel = supabase.channel(`calls-${recipient.user_id}`);
      webrtcRef.current.setSignalingChannel({
        send: async (message: SignalingMessage) => {
          await channel.send({
            type: 'broadcast',
            event: message.type,
            payload: {
              ...message.payload,
              callerId: user.id,
              callerName: user.user_metadata?.display_name || user.email
            }
          });
        }
      });
      
      // Create and send offer
      const offer = await webrtcRef.current.createOffer();
      
      await channel.send({
        type: 'broadcast',
        event: 'call-offer',
        payload: {
          callerId: user.id,
          callerName: user.user_metadata?.display_name || user.email,
          offer: offer
        }
      });
      
      setIsInCall(true);
      setCallStatus('connecting');
      setActiveChat(recipient);
      
      // Start call timer
      callTimerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
      
    } catch (error) {
      console.error('Call setup error:', error);
      toast.error('Failed to start call');
    }
  };
  
  const acceptCall = async () => {
    if (!incomingCall) return;
    
    try {
      // Initialize WebRTC manager
      webrtcRef.current = new WebRTCManager();
      
      // Start local stream
      const stream = await webrtcRef.current.startLocalStream(true, true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Set up remote stream callback
      webrtcRef.current.setOnRemoteStream((remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallStatus('connected');
      });
      
      webrtcRef.current.setOnCallEnded(() => {
        endCall();
      });
      
      // Set up signaling channel
      const channel = supabase.channel(`calls-${incomingCall.caller.user_id}`);
      webrtcRef.current.setSignalingChannel({
        send: async (message: SignalingMessage) => {
          await channel.send({
            type: 'broadcast',
            event: message.type,
            payload: message.payload
          });
        }
      });
      
      // Handle offer and create answer
      await webrtcRef.current.createAnswer(incomingCall.signal);
      const answer = await webrtcRef.current.createAnswer(incomingCall.signal);
      
      // Send answer back
      await channel.send({
        type: 'broadcast',
        event: 'call-answer',
        payload: {
          answer: answer
        }
      });
      
      setIsInCall(true);
      setCallStatus('connecting');
      setIncomingCall(null);
      setActiveChat(incomingCall.caller);
      
      // Start call timer
      callTimerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
      
    } catch (error) {
      console.error('Call accept error:', error);
      toast.error('Failed to accept call');
    }
  };
  
  const declineCall = () => {
    if (!incomingCall) return;
    
    // Send decline signal
    supabase.channel(`calls-${incomingCall.caller.user_id}`).send({
      type: 'broadcast',
      event: 'call-declined',
      payload: {
        recipientId: user?.id
      }
    });
    
    setIncomingCall(null);
  };
  
  const endCall = () => {
    // Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    // End WebRTC call
    if (webrtcRef.current) {
      webrtcRef.current.endCall();
      webrtcRef.current = null;
    }
    
    // Notify all parties that call ended
    const recipient = activeChat || incomingCall?.caller;
    if (recipient) {
      supabase.channel(`calls-${recipient.user_id}`).send({
        type: 'broadcast',
        event: 'call-ended'
      });
    }
    
    if (user) {
      supabase.channel(`calls-${user.id}`).send({
        type: 'broadcast',
        event: 'call-ended'
      });
    }
    
    setIsInCall(false);
    setIncomingCall(null);
    setCallTime(0);
    setCallStatus('ringing');
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };
  useEffect(() => {
    if (!searchUser.trim() || !user) { setSearchResults([]); return; }
    const search = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .neq("user_id", user.id)
        .or(`username.ilike.%${searchUser}%,display_name.ilike.%${searchUser}%`)
        .limit(10);
      if (data) setSearchResults(data);
    };
    search();
  }, [searchUser, user]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChat || !user) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.user_id}),and(sender_id.eq.${activeChat.user_id},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`chat-${activeChat.user_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === user.id && newMsg.receiver_id === activeChat.user_id) ||
          (newMsg.sender_id === activeChat.user_id && newMsg.receiver_id === user.id)
        ) {
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!msg.trim() || !activeChat || !user) return;
    const content = msg.trim();
    setMsg("");
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeChat.user_id,
      content,
    });
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
  
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (activeChat) {
    return (
      <>
        {/* Incoming Call Modal */}
        <AnimatePresence>
          {incomingCall && !isInCall && (
            <IncomingCallModal
              isOpen={true}
              callerName={incomingCall.caller.display_name || incomingCall.caller.username || 'Unknown'}
              onJoin={acceptCall}
              onDecline={declineCall}
            />
          )}
        </AnimatePresence>

        {/* Active Call View */}
        {isInCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[65] bg-background flex flex-col"
          >
            {/* Remote video (full screen) */}
            <div className="flex-1 relative bg-black">
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
              
              {/* Call info overlay */}
              <div className="absolute top-0 left-0 right-0 safe-area-top p-4 text-center">
                <p className="text-sm text-white/80 mb-1">
                  {callStatus === 'ringing' && 'Ringing...'}
                  {callStatus === 'connecting' && 'Connecting...'}
                  {callStatus === 'connected' && 'Connected'}
                </p>
                <p className="text-lg font-semibold text-white">{activeChat.display_name || activeChat.username || 'User'}</p>
                <p className="text-sm text-primary mt-1">{formatTime(callTime)}</p>
              </div>
              
              {/* Local video (small overlay) */}
              <div className="absolute bottom-24 right-4 w-28 h-40 rounded-2xl overflow-hidden liquid-glass-elevated shadow-2xl">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="liquid-glass-elevated safe-area-bottom pb-6">
              <div className="flex justify-center gap-4 px-4 py-4">
                <button onClick={toggleMute} className="depth-press w-12 h-12 rounded-full liquid-glass-subtle flex items-center justify-center">
                  {muted ? <MicOff className="w-5 h-5 text-destructive" /> : <Mic className="w-5 h-5 text-foreground" />}
                </button>
                <button onClick={toggleVideo} className="depth-press w-12 h-12 rounded-full liquid-glass-subtle flex items-center justify-center">
                  {videoOn ? <Camera className="w-5 h-5 text-foreground" /> : <CameraOff className="w-5 h-5 text-destructive" />}
                </button>
                <button onClick={endCall} className="depth-press w-14 h-14 rounded-full bg-destructive flex items-center justify-center">
                  <PhoneOff className="w-6 h-6 text-primary-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat View */}
        {!isInCall && (
          <div className="min-h-screen bg-background flex flex-col">
            <div className="liquid-glass-elevated safe-area-top">
              <div className="flex items-center gap-3 px-4 py-3 relative z-10">
                <button onClick={() => setActiveChat(null)} className="depth-press">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                  {(activeChat.display_name || "U")[0].toUpperCase()}
                </div>
                <span className="text-headline text-foreground text-sm flex-1">{activeChat.display_name || activeChat.username || "User"}</span>
                <button onClick={() => startCall(activeChat)} className="depth-press w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center">
                  <Phone className="w-4 h-4 text-foreground" />
                </button>
                <button onClick={() => startCall(activeChat)} className="depth-press w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center">
                  <Video className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-10">No messages yet. Say hello!</div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.sender_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "liquid-glass text-foreground relative z-10"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 safe-area-bottom">
              <div className="flex gap-2">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Message..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none"
                />
                <button onClick={sendMessage} className="depth-press w-11 h-11 rounded-2xl bg-primary flex items-center justify-center">
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  const displayList = searchUser.trim() ? searchResults : conversations;

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base flex-1">Messages</span>
        </div>
      </div>

      <div className="px-4 py-3">
        <input
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none"
        />
      </div>

      <div className="px-4 space-y-2">
        {displayList.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-10">
            {searchUser.trim() ? "No users found" : "No conversations yet. Search for users to start chatting!"}
          </div>
        )}
        {displayList.map((conv, i) => (
          <motion.button
            key={conv.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveChat(conv)}
            className="depth-press liquid-glass rounded-2xl p-4 flex items-center gap-3 w-full text-left relative z-10"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {(conv.display_name || conv.username || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground">{conv.display_name || conv.username || "User"}</span>
              <p className="text-sm text-muted-foreground truncate">@{conv.username || "user"}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;
