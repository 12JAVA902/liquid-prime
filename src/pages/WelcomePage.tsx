import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, hsl(210,100%,60%), transparent)" }} />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(280,70%,55%), transparent)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(350,80%,58%), transparent)" }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-sm"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 300 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl liquid-glass-elevated mb-6"
        >
          <span className="text-3xl font-bold text-primary relative z-10">P</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl text-display text-foreground mb-3"
        >
          Primegram
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-muted-foreground text-sm mb-8 leading-relaxed"
        >
          Connect, create, and share moments with the world. Your social experience, reimagined in liquid glass.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate("/auth")}
            className="depth-press w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Get Started
          </button>

          <button
            onClick={() => navigate("/auth")}
            className="depth-press w-full py-3.5 rounded-2xl liquid-glass text-foreground text-sm font-semibold relative z-10"
          >
            I already have an account
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-caption text-muted-foreground mt-6"
        >
          By continuing, you agree to our Terms & Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
