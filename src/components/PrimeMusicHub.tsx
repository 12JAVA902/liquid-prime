import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Search, ExternalLink } from "lucide-react";

const PrimeMusicHub = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [search, setSearch] = useState("");

  const openYouTubeSearch = () => {
    const query = search.trim() || "trending music";
    window.open(`https://music.youtube.com/search?q=${encodeURIComponent(query)}`, "_blank");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed inset-0 z-[60] bg-background flex flex-col"
        >
          <div className="liquid-glass-elevated safe-area-top">
            <div className="flex items-center justify-between px-5 py-4 relative z-10">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                <span className="text-headline text-foreground text-base">Prime Music</span>
              </div>
              <button onClick={onClose} className="depth-press w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center">
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          <div className="px-5 py-3">
            <div className="liquid-glass rounded-2xl flex items-center gap-3 px-4 py-2.5 relative z-10">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && openYouTubeSearch()}
                placeholder="Search music on YouTube..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-3xl liquid-glass flex items-center justify-center mb-4">
              <Music className="w-10 h-10 text-primary relative z-10" />
            </div>
            <p className="text-foreground font-semibold text-lg mb-2">Prime Music</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Search and listen to any song in the world. Powered by YouTube Music.
            </p>
            <button
              onClick={openYouTubeSearch}
              className="depth-press px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open YouTube Music
            </button>

            {/* Quick links */}
            <div className="mt-8 w-full max-w-xs space-y-2">
              {["Top Charts", "New Releases", "Trending", "Chill Vibes"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => window.open(`https://music.youtube.com/search?q=${encodeURIComponent(cat)}`, "_blank")}
                  className="depth-press liquid-glass rounded-2xl p-3 w-full flex items-center gap-3 relative z-10"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{cat}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrimeMusicHub;
