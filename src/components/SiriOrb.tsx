import { motion } from "framer-motion";

interface SiriOrbProps {
  size?: number;
  intensity?: number;
  listening?: boolean;
  speaking?: boolean;
  onClick?: () => void;
}

/**
 * Siri orb — a translucent glass sphere with fluid multicolour plasma blobs
 * swirling inside, a refractive rim and an audio-reactive halo.
 * Fully CSS/SVG driven, reacts to `intensity` (0..1) from the mic analyser.
 */
const SiriOrb = ({
  size = 64,
  intensity = 0,
  listening = false,
  speaking = false,
  onClick,
}: SiriOrbProps) => {
  const active = listening || speaking;
  const energy = Math.min(1, Math.max(0, intensity));
  const speed = active ? 3.2 - energy * 1.6 : 7;

  const blob = (
    name: string,
    color: string,
    duration: number,
    inset: string,
    delay = 0,
  ) => (
    <div
      className="absolute rounded-full"
      style={{
        inset,
        background: color,
        filter: `blur(${Math.max(3, size * 0.11)}px)`,
        mixBlendMode: "screen",
        animation: `${name} ${duration}s ease-in-out ${delay}s infinite`,
        willChange: "transform",
      }}
    />
  );

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Siri assistant"
      className="relative rounded-full overflow-visible"
      style={{ width: size, height: size }}
      animate={{ scale: 1 + energy * 0.14 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
    >
      {/* Ambient bloom */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-35%",
          background:
            "radial-gradient(circle, hsla(214,100%,62%,0.40) 0%, hsla(280,90%,65%,0.30) 35%, hsla(150,85%,55%,0.22) 60%, transparent 78%)",
          filter: `blur(${size * 0.28}px)`,
        }}
        animate={{
          opacity: active ? [0.7, 1, 0.7] : [0.45, 0.7, 0.45],
          scale: active ? [1, 1.18, 1] : [1, 1.06, 1],
        }}
        transition={{ duration: active ? 1.1 : 3.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Glass sphere with fluid plasma interior */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: "radial-gradient(circle at 50% 55%, hsla(230,40%,10%,0.55), hsla(240,50%,4%,0.75))",
          backdropFilter: "blur(6px) saturate(1.6)",
          WebkitBackdropFilter: "blur(6px) saturate(1.6)",
          boxShadow:
            "inset 0 0 0 1px hsla(0,0%,100%,0.22), inset 0 2px 10px hsla(0,0%,100%,0.30), inset 0 -12px 26px hsla(214,100%,60%,0.35)",
        }}
      >
        {blob("siri-blob-a", "radial-gradient(circle, hsla(214,100%,62%,0.95) 0%, transparent 70%)", speed, "-18% auto auto -14%")}
        {blob("siri-blob-b", "radial-gradient(circle, hsla(292,95%,66%,0.90) 0%, transparent 70%)", speed * 1.25, "auto -16% -20% auto", 0.3)}
        {blob("siri-blob-c", "radial-gradient(circle, hsla(150,88%,55%,0.85) 0%, transparent 70%)", speed * 1.5, "auto auto -12% -20%", 0.6)}
        {blob("siri-blob-a", "radial-gradient(circle, hsla(0,90%,62%,0.75) 0%, transparent 70%)", speed * 1.8, "-10% -20% auto auto", 0.9)}

        {/* blob sizing wrappers rely on inset offsets; keep them round */}
        <style>{`
          @supports (mix-blend-mode: screen) { /* progressive enhancement marker */ }
        `}</style>

        {/* Inner caustic swirl */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, hsla(0,0%,100%,0.18) 18%, transparent 40%, hsla(0,0%,100%,0.12) 68%, transparent 90%)",
            mixBlendMode: "overlay",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: active ? 5 : 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Frosted glass veil so the plasma reads as *inside* the sphere */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 32% 26%, hsla(0,0%,100%,0.42) 0%, hsla(0,0%,100%,0.08) 30%, transparent 58%)",
          }}
        />
      </div>

      {/* Refractive rim */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 0 1px hsla(0,0%,100%,0.30), 0 6px 22px hsla(214,100%,56%,0.35), 0 2px 6px hsla(0,0%,0%,0.45)",
        }}
      />

      {/* Specular highlight */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "26%",
          height: "16%",
          top: "13%",
          left: "23%",
          transform: "rotate(-18deg)",
          background: "radial-gradient(ellipse, hsla(0,0%,100%,0.9) 0%, transparent 72%)",
          filter: "blur(1.5px)",
        }}
      />

      {/* Listening / speaking ripples */}
      {active &&
        [0, 0.45, 0.9].map((delay) => (
          <motion.div
            key={delay}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: "1px solid hsla(0,0%,100%,0.45)" }}
            animate={{ scale: [1, 1.9], opacity: [0.65, 0] }}
            transition={{ duration: 1.7, delay, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
    </motion.button>
  );
};

export default SiriOrb;
