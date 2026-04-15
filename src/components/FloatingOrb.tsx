import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mic, MicOff, Volume2 } from "lucide-react";
import PrimeOrb from "./PrimeOrb";
import PrimeAIChat from "./PrimeAIChat";

const FloatingOrb = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const orbRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  // Global 'P' key listener and click handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (!aiOpen) {
          // Open AI chat first
          setAiOpen(true);
          setTimeout(() => {
            // Then trigger voice input
            const micButton = document.querySelector('[data-voice-trigger]');
            if (micButton) {
              micButton.click();
            }
          }, 300);
        } else {
          // Toggle voice input if already open
          const micButton = document.querySelector('[data-voice-trigger]');
          if (micButton) {
            micButton.click();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [aiOpen]);
  
  // Voice activity detection
  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const tick = () => {
        analyserRef.current!.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVoiceIntensity(average / 255);
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      
      tick();
      setIsListening(true);
    } catch (error) {
      console.error('Audio analysis error:', error);
    }
  };
  
  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setVoiceIntensity(0);
  };
  
  // Enhanced orb click handler
  const handleOrbClick = () => {
    setIntensity(1);
    setTimeout(() => setIntensity(0), 500);
    
    if (!aiOpen) {
      setAiOpen(true);
      setTimeout(() => {
        const micButton = document.querySelector('[data-voice-trigger]');
        if (micButton) micButton.click();
      }, 300);
    }
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 liquid-glass-elevated rounded-full px-3 py-1.5 text-xs font-medium text-foreground whitespace-nowrap z-10"
              >
                Press 'P' for AI
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        {/* Hidden voice trigger for AI chat */}
        <button
          data-voice-trigger
          className="hidden"
          aria-label="Trigger voice input"
        />
        
        {/* AI Chat */}
        <PrimeAIChat 
          open={aiOpen} 
          onClose={() => setAiOpen(false)} 
          onOpen={() => setAiOpen(true)}
        />
      </motion.div>
    </>
  );
};

export default FloatingOrb;
