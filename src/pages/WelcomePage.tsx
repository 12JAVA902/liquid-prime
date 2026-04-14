import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const GooeyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let mouseX = 0.5, mouseY = 0.5;
    let time = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0]?.clientX : e.clientX;
      const y = "touches" in e ? e.touches[0]?.clientY : e.clientY;
      if (x !== undefined) { mouseX = x / window.innerWidth; mouseY = y! / window.innerHeight; }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });

    const draw = () => {
      time += 0.004;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep dark base
      ctx.fillStyle = "hsl(220, 25%, 3%)";
      ctx.fillRect(0, 0, w, h);

      // Gooey liquid blobs - more intense than main background
      const blobs = [
        { cx: 0.3 + Math.sin(time * 0.5) * 0.15 + mouseX * 0.1, cy: 0.2 + Math.cos(time * 0.3) * 0.1 + mouseY * 0.06, r: 0.45, color: "210, 100%, 60%" },
        { cx: 0.7 + Math.cos(time * 0.4) * 0.15 - mouseX * 0.08, cy: 0.7 + Math.sin(time * 0.6) * 0.12 - mouseY * 0.06, r: 0.4, color: "280, 80%, 55%" },
        { cx: 0.5 + Math.sin(time * 0.7) * 0.12 + mouseX * 0.05, cy: 0.4 + Math.cos(time * 0.3) * 0.15 + mouseY * 0.04, r: 0.35, color: "350, 85%, 58%" },
        { cx: 0.2 + Math.cos(time * 0.9) * 0.08 + mouseX * 0.06, cy: 0.8 + Math.sin(time * 0.5) * 0.08, r: 0.3, color: "170, 70%, 50%" },
        { cx: 0.8 + Math.sin(time * 1.1) * 0.06, cy: 0.3 + Math.cos(time * 0.8) * 0.1 - mouseY * 0.04, r: 0.25, color: "40, 90%, 55%" },
      ];

      for (const blob of blobs) {
        const grad = ctx.createRadialGradient(blob.cx * w, blob.cy * h, 0, blob.cx * w, blob.cy * h, blob.r * Math.max(w, h));
        grad.addColorStop(0, `hsla(${blob.color}, 0.12)`);
        grad.addColorStop(0.4, `hsla(${blob.color}, 0.06)`);
        grad.addColorStop(0.7, `hsla(${blob.color}, 0.02)`);
        grad.addColorStop(1, `hsla(${blob.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Gooey wave lines
      for (let j = 0; j < 5; j++) {
        ctx.strokeStyle = `hsla(210, 100%, 60%, ${0.015 + j * 0.005})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < w; x += 3) {
          const y = h * (0.2 + j * 0.15) +
            Math.sin(x * 0.004 + time * 2 + j * 0.7) * 40 +
            Math.sin(x * 0.008 + time * 1.3 + j * 1.5) * 20 +
            mouseY * 15 * Math.sin(x * 0.003 + time);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
};

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <GooeyBackground />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-sm relative z-10"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 300 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl liquid-glass-elevated mb-6"
          style={{ boxShadow: "0 0 60px hsla(210, 100%, 60%, 0.2), 0 0 120px hsla(280, 70%, 55%, 0.1)" }}
        >
          <span className="text-4xl font-bold text-primary relative z-10">P</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-5xl text-display text-foreground mb-3"
        >
          Primegram
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-muted-foreground text-sm mb-2 leading-relaxed"
        >
          Connect, create, and share moments with the world. Your social experience, reimagined in liquid glass.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <p className="text-xs text-muted-foreground/60">Created by <span className="text-primary font-semibold">Java Prime</span></p>
          <p className="text-xs text-muted-foreground/60">Sponsored by <span className="text-primary font-semibold">JP7 ULTRA</span></p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate("/auth")}
            className="depth-press w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
            style={{ boxShadow: "0 4px 20px hsla(210, 100%, 60%, 0.3)" }}
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
          transition={{ delay: 1.4 }}
          className="text-caption text-muted-foreground mt-6"
        >
          By continuing, you agree to our Terms & Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
