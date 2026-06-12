import { motion } from "framer-motion";

interface SiriOrbProps {
  size?: number;
  intensity?: number;
  listening?: boolean;
  onClick?: () => void;
}

/**
 * Translucent Siri-style orb (pure CSS/SVG, no three.js).
 * Layered conic gradients + blur create the iridescent glassy look.
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
      {/* Outer glow halo */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(120,180,255,0.55) 0%, rgba(180,120,255,0.35) 40%, transparent 70%)",
          filter: "blur(18px)",
        }}
        animate={{
          opacity: listening ? [0.6, 1, 0.6] : [0.4, 0.7, 0.4],
          scale: listening ? [1, 1.25, 1] : [1, 1.1, 1],
        }}
        transition={{ duration: listening ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating iridescent conic ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #5eb1ff, #b97cff, #ff7cc8, #ffd07c, #7cffd0, #5eb1ff)",
          filter: "blur(6px)",
          opacity: 0.85,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: listening ? 3 : 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Glass sphere body */}
      <div
        className="absolute inset-[6%] rounded-full backdrop-blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 35%, rgba(40,60,120,0.25) 70%, rgba(20,10,50,0.5) 100%)",
          boxShadow:
            "inset 0 2px 12px rgba(255,255,255,0.45), inset 0 -8px 24px rgba(80,40,180,0.35), 0 4px 20px rgba(120,80,255,0.35)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      />

      {/* Inner swirling highlight */}
      <motion.div
        className="absolute inset-[15%] rounded-full pointer-events-none"
        style={{
          background:
            "conic-gradient(from 90deg, transparent, rgba(150,200,255,0.6), transparent, rgba(220,150,255,0.55), transparent)",
          filter: "blur(8px)",
          mixBlendMode: "screen",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Specular highlight */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "30%",
          height: "20%",
          top: "12%",
          left: "22%",
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
