import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Camera, Heart } from "lucide-react";

const TopNavBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setCollapsed(latest > 60 && latest > prev);
  });

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 safe-area-top"
      animate={collapsed ? { y: -10, opacity: 0.9 } : { y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <motion.div
        className="liquid-glass-elevated mx-auto flex items-center justify-between"
        animate={collapsed ? {
          marginLeft: "2rem",
          marginRight: "2rem",
          marginTop: "0.5rem",
          borderRadius: "2rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingTop: "0.5rem",
          paddingBottom: "0.5rem",
        } : {
          marginLeft: "0rem",
          marginRight: "0rem",
          marginTop: "0rem",
          borderRadius: "0rem",
          paddingLeft: "1.25rem",
          paddingRight: "1.25rem",
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
        }}
        layout
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      >
        <motion.h1
          className="text-headline text-foreground"
          animate={collapsed ? { fontSize: "1.125rem" } : { fontSize: "1.5rem" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          PRIME
        </motion.h1>
        <div className="flex items-center gap-3">
          <button className="depth-press w-9 h-9 flex items-center justify-center rounded-full liquid-glass-subtle">
            <Heart className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <button className="depth-press w-9 h-9 flex items-center justify-center rounded-full liquid-glass-subtle">
            <Camera className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default TopNavBar;
