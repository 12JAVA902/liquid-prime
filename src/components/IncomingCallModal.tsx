import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User, Volume2 } from 'lucide-react';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar?: string;
  onJoin: () => void;
  onDecline: () => void;
}

const IncomingCallModal = ({ isOpen, callerName, callerAvatar, onJoin, onDecline }: IncomingCallModalProps) => {
  const [ringing, setRinging] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Ringing sound effect
  useEffect(() => {
    if (isOpen && !ringing) {
      setRinging(true);
      // Create a simple ringing tone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Ringing frequency
      gainNode.gain.value = 0.1; // Volume
      
      oscillator.start();
      
      // Ring pattern
      const ringInterval = setInterval(() => {
        oscillator.frequency.value = oscillator.frequency.value === 800 ? 600 : 800;
      }, 1000);
      
      // Store for cleanup
      (audioRef.current as any) = { oscillator, gainNode, ringInterval };
      
      return () => {
        clearInterval(ringInterval);
        oscillator.stop();
        setRinging(false);
      };
    }
    
    return () => {
      // Cleanup ringing sound
      if (audioRef.current && (audioRef.current as any).oscillator) {
        (audioRef.current as any).oscillator.stop();
        clearInterval((audioRef.current as any).ringInterval);
      }
    };
  }, [isOpen, ringing]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="liquid-glass-elevated rounded-3xl p-8 max-w-sm w-full"
          >
            {/* Caller Info */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4">
                {callerAvatar ? (
                  <img src={callerAvatar} alt={callerName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{callerName}</h2>
              <p className="text-sm text-muted-foreground mb-4">Incoming video call...</p>
              
              {/* Ringing Animation */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <Phone className="w-8 h-8 text-primary animate-pulse" />
                </motion.div>
              </div>
            </div>

            {/* Call Actions */}
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDecline}
                className="depth-press flex-1 py-4 rounded-2xl bg-destructive text-destructive-foreground font-semibold flex items-center justify-center gap-2"
              >
                <PhoneOff className="w-5 h-5" />
                Decline
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onJoin}
                className="depth-press flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Join
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallModal;
