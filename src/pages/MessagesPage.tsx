import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Phone, Video, Send, PhoneOff, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import IncomingCallModal from "@/components/IncomingCallModal";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prime-ai-chat`;

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
  const [aiModeChats, setAiModeChats] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("ai-mode-chats") || "[]")); } catch { return new Set(); }
  });
  const aiReplyingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const toggleAiMode = (chatId: string) => {
    setAiModeChats(prev => {
      const next = new Set(prev);
      if (next.has(chatId)) { next.delete(chatId); toast.success("AI Mode off"); }
      else { next.add(chatId); toast.success("AI Mode on — I'll learn your style and reply for you"); }
      localStorage.setItem("ai-mode-chats", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const aiAutoReply = async (incoming: Message, chat: ChatUser) => {
    if (!user || aiReplyingRef.current) return;
    aiReplyingRef.current = true;
    try {
      // Learn personality from this user's last 40 sent messages across all chats
      const { data: myMsgs } = await supabase
        .from("messages")
        .select("content")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(40);
      const styleSamples = (myMsgs || []).map((m: any) => m.content).filter(Boolean).reverse().join("\n");
      const system = `You are impersonating the user in a chat. Reply as them, mirroring their tone, vocabulary, slang, emoji use, message length, and punctuation. Keep replies short (1-2 sentences) unless context demands more. Never reveal you are an AI.\n\nHere are recent messages the user sent (their style):\n${styleSamples}`;
      const recent = messages.slice(-10).map(m => ({
        role: (m.sender_id === user.id ? "assistant" : "user") as "assistant" | "user",
        content: m.content,
      }));
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: await authHeader() },
        body: JSON.stringify({ messages: [{ role: "system", content: system }, ...recent, { role: "user", content: incoming.content }] }),
      });
      if (!resp.ok) throw new Error("AI reply failed");
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let buf = "", reply = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) reply += c;
          } catch {}
        }
      }
      const text = reply.trim();
      if (text) {
        await supabase.from("messages").insert({ sender_id: user.id, receiver_id: chat.user_id, content: text });
      }
    } catch (e) { console.error(e); }
    finally { aiReplyingRef.current = false; }
  };

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
      .on('broadcast', { event: 'incoming-call' }, (payload: any) => {
        const caller = conversations.find(c => c.user_id === payload.callerId);
        if (caller) {
          setIncomingCall({ caller, signal: payload.signal });
        }
      })
      .on('broadcast', { event: 'call-ended' }, () => {
        setIsInCall(false);
        setIncomingCall(null);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversations]);
  
  const startCall = async (recipient: ChatUser) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Send offer to recipient
      await supabase.channel(`calls-${recipient.user_id}`).send({
        type: 'broadcast',
        event: 'call-offer',
        payload: {
          callerId: user.id,
          callerName: user.user_metadata?.display_name || user.email,
          offer: offer
        }
      });
      
      setIsInCall(true);
      setActiveChat(recipient);
    } catch (error) {
      console.error('Call setup error:', error);
    }
  };
  
  const acceptCall = async () => {
    if (!incomingCall) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      
      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Handle remote description
      await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
      
      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      // Send answer back
      await supabase.channel(`calls-${incomingCall.caller.user_id}`).send({
        type: 'broadcast',
        event: 'call-answer',
        payload: {
          answer: answer
        }
      });
      
      setIsInCall(true);
      setIncomingCall(null);
      setActiveChat(incomingCall.caller);
    } catch (error) {
      console.error('Call accept error:', error);
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
          // AI Mode auto-reply when message comes from the other party
          if (newMsg.sender_id === activeChat.user_id && aiModeChats.has(activeChat.user_id)) {
            aiAutoReply(newMsg, activeChat);
          }
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
            <div className="liquid-glass-elevated safe-area-top">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  <span className="text-headline text-foreground text-base">Video Call</span>
                </div>
                <button onClick={endCall} className="depth-press w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
                  <PhoneOff className="w-5 h-5 text-destructive-foreground" />
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <video id="remote-video" autoPlay playsInline className="w-full h-full object-cover bg-black" />
              <div className="absolute bottom-4 right-4 w-32 h-48 rounded-2xl overflow-hidden liquid-glass">
                <video id="local-video" autoPlay muted playsInline className="w-full h-full object-cover" />
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
                <span className="text-headline text-foreground text-sm flex-1">
                  {activeChat.display_name || activeChat.username || "User"}
                  {aiModeChats.has(activeChat.user_id) && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">AI ON</span>
                  )}
                </span>
                <button
                  onClick={() => toggleAiMode(activeChat.user_id)}
                  title="AI Mode — chats on your behalf, learns your style"
                  className={`depth-press w-8 h-8 rounded-full flex items-center justify-center ${aiModeChats.has(activeChat.user_id) ? "bg-gradient-to-br from-primary to-primary/60" : "liquid-glass-subtle"}`}
                >
                  <Sparkles className={`w-4 h-4 ${aiModeChats.has(activeChat.user_id) ? "text-primary-foreground" : "text-foreground"}`} />
                </button>
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
