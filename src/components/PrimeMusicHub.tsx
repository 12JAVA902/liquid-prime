import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Play, Pause, SkipForward, SkipBack, Search, Heart } from "lucide-react";

const genres = ["All", "Pop", "Hip-Hop", "R&B", "Electronic", "Rock", "Jazz"];

const tracks = [
  { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", cover: "🌃" },
  { title: "Levitating", artist: "Dua Lipa", duration: "3:23", cover: "✨" },
  { title: "Stay", artist: "The Kid LAROI & Justin Bieber", duration: "2:21", cover: "💫" },
  { title: "Peaches", artist: "Justin Bieber", duration: "3:18", cover: "🍑" },
  { title: "Montero", artist: "Lil Nas X", duration: "2:17", cover: "🦋" },
  { title: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58", cover: "💔" },
  { title: "Kiss Me More", artist: "Doja Cat ft. SZA", duration: "3:28", cover: "💋" },
  { title: "Save Your Tears", artist: "The Weeknd", duration: "3:35", cover: "😢" },
  { title: "drivers license", artist: "Olivia Rodrigo", duration: "4:02", cover: "🚗" },
  { title: "Positions", artist: "Ariana Grande", duration: "2:52", cover: "🌙" },
  { title: "Heat Waves", artist: "Glass Animals", duration: "3:58", cover: "🌊" },
  { title: "Butter", artist: "BTS", duration: "2:44", cover: "🧈" },
];

const PrimeMusicHub = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [activeGenre, setActiveGenre] = useState("All");
  const [playing, setPlaying] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());

  const filtered = tracks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  );

  const toggleLike = (i: number) => {
    setLikedTracks((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
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
          {/* Header */}
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

          {/* Search */}
          <div className="px-5 py-3">
            <div className="liquid-glass rounded-2xl flex items-center gap-3 px-4 py-2.5 relative z-10">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search music..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Genres */}
          <div className="overflow-x-auto scrollbar-none px-5 py-2">
            <div className="flex gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className={`depth-press px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeGenre === g
                      ? "bg-primary text-primary-foreground"
                      : "liquid-glass-subtle text-muted-foreground relative z-10"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Track list */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2 pb-32">
            {filtered.map((track, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="liquid-glass rounded-2xl p-3 flex items-center gap-3 relative z-10"
              >
                <button
                  onClick={() => setPlaying(playing === i ? null : i)}
                  className="depth-press w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0"
                >
                  {playing === i ? (
                    <Pause className="w-5 h-5 text-primary" />
                  ) : (
                    <span>{track.cover}</span>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${playing === i ? "text-primary" : "text-foreground"}`}>
                    {track.title}
                  </p>
                  <p className="text-caption text-muted-foreground truncate">{track.artist}</p>
                </div>
                <span className="text-caption text-muted-foreground">{track.duration}</span>
                <button onClick={() => toggleLike(i)} className="depth-press">
                  <Heart className={`w-4 h-4 ${likedTracks.has(i) ? "fill-like text-like" : "text-muted-foreground"}`} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Now Playing Bar */}
          {playing !== null && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="fixed bottom-0 left-0 right-0 safe-area-bottom"
            >
              <div className="liquid-glass-elevated mx-4 mb-4 rounded-2xl p-4 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
                  {tracks[playing].cover}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{tracks[playing].title}</p>
                  <p className="text-caption text-muted-foreground truncate">{tracks[playing].artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="depth-press" onClick={() => setPlaying(Math.max(0, playing - 1))}>
                    <SkipBack className="w-5 h-5 text-foreground" />
                  </button>
                  <button onClick={() => setPlaying(null)} className="depth-press w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Pause className="w-5 h-5 text-primary-foreground" />
                  </button>
                  <button className="depth-press" onClick={() => setPlaying(Math.min(tracks.length - 1, playing + 1))}>
                    <SkipForward className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrimeMusicHub;
