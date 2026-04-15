import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark, Play, Pause } from "lucide-react";

interface FeedPostProps {
  image: string;
  mediaType?: string;
  username: string;
  avatar: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  index: number;
  autoPlay?: boolean;
}

const FeedPost = ({ image, mediaType = "image", username, avatar, caption, likes, comments, timeAgo, index, autoPlay = true }: FeedPostProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showHeart, setShowHeart] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastTap = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const isVideo = mediaType === "video";
  const isUrl = avatar.startsWith("http");

  // Intersection Observer for auto-play
  useEffect(() => {
    if (!isVideo || !autoPlay) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Auto-play when visible
            if (videoRef.current && !isPlaying) {
              videoRef.current.play().catch(() => {
                // Handle autoplay restrictions
                console.log('Autoplay blocked, user interaction required');
              });
              setIsPlaying(true);
            }
          } else {
            setIsVisible(false);
            // Pause when not visible
            if (videoRef.current && isPlaying) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: 0.5, // Play when 50% visible
        rootMargin: '0px'
      }
    );
    
    if (videoRef.current) {
      observerRef.current.observe(videoRef.current);
    }
    
    return () => {
      if (observerRef.current && videoRef.current) {
        observerRef.current.unobserve(videoRef.current);
      }
    };
  }, [isVideo, autoPlay, isPlaying]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {
        console.log('Play failed, user interaction required');
      });
      setIsPlaying(true);
    }
  };

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) { setLiked(true); setLikeCount((c) => c + 1); }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTap.current = now;
  }, [liked]);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
    >
      <div className="liquid-glass rounded-[1.5rem] overflow-hidden">
        <div className="flex items-center gap-3 p-4 relative z-10">
          {isUrl ? (
            <img src={avatar} alt={username} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {avatar}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{username}</p>
            <p className="text-caption text-muted-foreground">{timeAgo}</p>
          </div>
          <button className="depth-press w-8 h-8 flex items-center justify-center rounded-full liquid-glass-subtle">
            <span className="text-muted-foreground text-lg">···</span>
          </button>
        </div>

        <div className="relative" onClick={handleDoubleTap}>
          {isVideo ? (
            <div className="relative">
              <video 
                ref={videoRef}
                src={image} 
                className="w-full aspect-[4/5] object-cover bg-black" 
                playsInline
                muted={false}
                loop
                onClick={togglePlayPause}
              />
              
              {/* Play/Pause overlay */}
              {!isVisible && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Play className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              )}
              
              {/* Controls hint */}
              <div className="absolute bottom-2 right-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </motion.div>
              </div>
            </div>
          ) : (
            <img src={image} alt={`Post by ${username}`} className="w-full aspect-[4/5] object-cover" loading="lazy" />
          )}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-20 h-20 fill-like text-like drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={toggleLike} className="depth-press">
              <motion.div animate={liked ? { scale: [1, 1.3, 0.9, 1] } : {}} transition={{ duration: 0.4 }}>
                <Heart className={`w-6 h-6 transition-colors ${liked ? "fill-like text-like" : "text-foreground"}`} />
              </motion.div>
            </button>
            <button className="depth-press"><MessageCircle className="w-6 h-6 text-foreground" /></button>
            <button className="depth-press"><Send className="w-6 h-6 text-foreground" /></button>
            <div className="flex-1" />
            <button onClick={() => setSaved(!saved)} className="depth-press">
              <Bookmark className={`w-6 h-6 transition-colors ${saved ? "fill-foreground text-foreground" : "text-foreground"}`} />
            </button>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">{likeCount.toLocaleString()} likes</p>
          <p className="text-sm text-foreground/90">
            <span className="font-semibold">{username}</span>{" "}
            <span className="text-foreground/70">{caption}</span>
          </p>
          {comments > 0 && <p className="text-sm text-muted-foreground mt-1">View all {comments} comments</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default FeedPost;
