import { motion } from "framer-motion";

interface SiriOrbProps {
  size?: number;
  intensity?: number;
  listening?: boolean;
  onClick?: () => void;
}

/**
 * Translucent Siri-style orb with red/blue/green spinning waves.
 */
const SiriOrb = ({ size = 64, intensity = 0, listening = false, onClick }: SiriOrbProps) => {
  const scale = 1 + intensity * 0.15;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative rounded-full overflow-visible group"
      style={{ width: size, height: size }}
      animate={{ scale }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Outer multicolor glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,80,80,0.45) 0%, rgba(80,140,255,0.35) 40%, rgba(80,255,140,0.30) 70%, transparent 80%)",
          filter: "blur(18px)",
        }}
        animate={{
          opacity: listening ? [0.6, 1, 0.6] : [0.5, 0.85, 0.5],
          scale: listening ? [1, 1.3, 1] : [1, 1.1, 1],
        }}
        transition={{ duration: listening ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* RED wave ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, rgba(255,60,60,0.95) 25%, transparent 50%, transparent 100%)",
          filter: "blur(5px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: listening ? 2 : 4, repeat: Infinity, ease: "linear" }}
      />

      {/* BLUE wave ring (counter-rotating) */}
      <motion.div
        className="absolute inset-[3%] rounded-full"
        style={{
          background:
            "conic-gradient(from 120deg, transparent 0%, rgba(60,140,255,0.95) 25%, transparent 50%, transparent 100%)",
          filter: "blur(5px)",
          mixBlendMode: "screen",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: listening ? 2.6 : 5, repeat: Infinity, ease: "linear" }}
      />

      {/* GREEN wave ring */}
      <motion.div
        className="absolute inset-[6%] rounded-full"
        style={{
          background:
            "conic-gradient(from 240deg, transparent 0%, rgba(60,255,140,0.9) 25%, transparent 50%, transparent 100%)",
          filter: "blur(5px)",
          mixBlendMode: "screen",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: listening ? 3.2 : 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Glass sphere body */}
      <div
        className="absolute inset-[10%] rounded-full backdrop-blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 35%, rgba(20,20,40,0.4) 70%, rgba(10,5,30,0.6) 100%)",
          boxShadow:
            "inset 0 2px 12px rgba(255,255,255,0.45), inset 0 -8px 24px rgba(80,40,180,0.35), 0 4px 20px rgba(120,80,255,0.4)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      />

      {/* Specular highlight */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "28%",
          height: "18%",
          top: "14%",
          left: "24%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* Listening pulse waves */}
      {listening && (
        <>
          {[0, 0.4, 0.8].map((delay) => (
            <motion.div
              key={delay}
              className="absolute inset-0 rounded-full border border-white/40 pointer-events-none"
              animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, delay, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
        </>
      )}
    </motion.button>
  );
};

export default SiriOrb;
