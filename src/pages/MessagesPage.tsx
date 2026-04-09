import { motion } from "framer-motion";
import { ArrowLeft, Phone, Video, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const conversations = [
  { name: "Alex", initial: "A", lastMsg: "Hey! What's up?", time: "2m", unread: 2 },
  { name: "Maya", initial: "M", lastMsg: "That photo was 🔥", time: "15m", unread: 0 },
  { name: "Jordan", initial: "J", lastMsg: "See you tonight!", time: "1h", unread: 1 },
  { name: "Sam", initial: "S", lastMsg: "Thanks for sharing", time: "3h", unread: 0 },
];

const MessagesPage = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  if (activeChat !== null) {
    const conv = conversations[activeChat];
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="liquid-glass-elevated safe-area-top">
          <div className="flex items-center gap-3 px-4 py-3 relative z-10">
            <button onClick={() => setActiveChat(null)} className="depth-press">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">{conv.initial}</div>
            <span className="text-headline text-foreground text-sm flex-1">{conv.name}</span>
            <button className="depth-press w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center">
              <Phone className="w-4 h-4 text-foreground" />
            </button>
            <button className="depth-press w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center">
              <Video className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 flex items-end">
          <div className="w-full space-y-3">
            <div className="flex justify-start">
              <div className="liquid-glass rounded-2xl px-4 py-2.5 text-sm text-foreground max-w-[75%] relative z-10">{conv.lastMsg}</div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 safe-area-bottom">
          <div className="flex gap-2">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message..." className="flex-1 px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none" />
            <button className="depth-press w-11 h-11 rounded-2xl bg-primary flex items-center justify-center">
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base flex-1">Messages</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {conversations.map((conv, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveChat(i)}
            className="depth-press liquid-glass rounded-2xl p-4 flex items-center gap-3 w-full text-left relative z-10"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">{conv.initial}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{conv.name}</span>
                <span className="text-caption text-muted-foreground">{conv.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{conv.lastMsg}</p>
            </div>
            {conv.unread > 0 && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">{conv.unread}</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;
