import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import PrimeOrb from "./PrimeOrb";
import PrimeAIChat from "./PrimeAIChat";

const FloatingOrb = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [intensity, setIntensity] = useState(0);

  const handleOrbClick = () => {
    setAiOpen(true);
    setIntensity(1);
    setTimeout(() => setIntensity(0), 500);
  };

  return (
    <>
      {/* Floating Orb Assistant */}
      <motion.div
        className="fixed bottom-24 left-4 z-[55]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.button
          onClick={handleOrbClick}
          className="relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: isHovered 
                ? "0 0 30px hsla(210, 100%, 60%, 0.6), 0 0 60px hsla(280, 70%, 55%, 0.4)"
                : "0 0 15px hsla(210, 100%, 60%, 0.3), 0 0 30px hsla(280, 70%, 55%, 0.2)"
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* 3D Orb */}
          <div className="w-16 h-16 relative">
            <PrimeOrb intensity={intensity} />
          </div>
          
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Sparkles on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        {/* Label */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 liquid-glass-elevated rounded-full px-3 py-1 whitespace-nowrap"
            >
              <span className="text-xs text-foreground font-medium">Press 'P' for AI</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Chat */}
      <PrimeAIChat 
        open={aiOpen} 
        onClose={() => setAiOpen(false)} 
        onOpen={() => setAiOpen(true)} 
      />
    </>
  );
};

export default FloatingOrb;
