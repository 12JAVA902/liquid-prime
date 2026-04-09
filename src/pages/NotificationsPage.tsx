import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, UserPlus, AtSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const notifications = [
  { type: "like", user: "alex.jpg", action: "liked your post", time: "2m", icon: Heart },
  { type: "comment", user: "maya_k", action: "commented: 'Amazing shot! 🔥'", time: "15m", icon: MessageCircle },
  { type: "follow", user: "jordan", action: "started following you", time: "1h", icon: UserPlus },
  { type: "mention", user: "sam.w", action: "mentioned you in a comment", time: "2h", icon: AtSign },
  { type: "like", user: "nova_art", action: "liked your post", time: "3h", icon: Heart },
  { type: "follow", user: "kai.dev", action: "started following you", time: "5h", icon: UserPlus },
];

const NotificationsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base">Notifications</span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {notifications.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="liquid-glass rounded-2xl p-4 flex items-center gap-3 relative z-10"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              n.type === "like" ? "bg-like/20" : n.type === "follow" ? "bg-primary/20" : "bg-secondary"
            }`}>
              <n.icon className={`w-5 h-5 ${n.type === "like" ? "text-like" : "text-primary"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{n.user}</span>{" "}{n.action}
              </p>
              <p className="text-caption text-muted-foreground">{n.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
