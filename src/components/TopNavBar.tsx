import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { MessageCircle, Film, Settings, Wallet, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopNavBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setCollapsed(latest > 60 && latest > prev);
  });

  const iconBtn = "depth-press w-8 h-8 flex items-center justify-center rounded-full liquid-glass-subtle";

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 safe-area-top"
      animate={collapsed ? { y: -10, opacity: 0.9 } : { y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <motion.div
        className="liquid-glass-elevated mx-auto flex items-center justify-between"
        animate={collapsed ? {
          marginLeft: "1.5rem", marginRight: "1.5rem", marginTop: "0.5rem",
          borderRadius: "2rem", paddingLeft: "1rem", paddingRight: "1rem",
          paddingTop: "0.5rem", paddingBottom: "0.5rem",
        } : {
          marginLeft: "0rem", marginRight: "0rem", marginTop: "0rem",
          borderRadius: "0rem", paddingLeft: "1rem", paddingRight: "1rem",
          paddingTop: "0.625rem", paddingBottom: "0.625rem",
        }}
        layout
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg liquid-glass flex items-center justify-center">
            <span className="text-sm font-bold text-primary relative z-10">P</span>
          </div>
          <motion.h1
            className="text-headline text-foreground"
            animate={collapsed ? { fontSize: "0.95rem" } : { fontSize: "1.15rem" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            Primegram
          </motion.h1>
        </div>

        <div className="flex items-center gap-2">
          <button className={iconBtn} onClick={() => navigate("/reels")}>
            <Film className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
          <button className={iconBtn} onClick={() => navigate("/notifications")}>
            <Bell className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
          <button className={iconBtn} onClick={() => navigate("/messages")}>
            <MessageCircle className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
          <button className={iconBtn} onClick={() => navigate("/wallet")}>
            <Wallet className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
          <button className={iconBtn} onClick={() => navigate("/settings")}>
            <Settings className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default TopNavBar;
