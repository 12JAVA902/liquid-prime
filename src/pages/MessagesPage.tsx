import { motion } from "framer-motion";
import { ArrowLeft, Phone, Video, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const bottomRef = useRef<HTMLDivElement>(null);

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

  // Search users
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

  if (activeChat) {
    return (
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
            <button className="depth-press w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center">
              <Phone className="w-4 h-4 text-foreground" />
            </button>
            <button onClick={() => navigate(`/call/${activeChat.user_id}`)} className="depth-press w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center">
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
