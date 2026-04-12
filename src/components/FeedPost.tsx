import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

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
}

const FeedPost = ({ image, mediaType = "image", username, avatar, caption, likes, comments, timeAgo, index }: FeedPostProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

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

  const isVideo = mediaType === "video";
  const isUrl = avatar.startsWith("http");

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
            <video src={image} className="w-full aspect-[4/5] object-cover bg-black" controls playsInline />
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
