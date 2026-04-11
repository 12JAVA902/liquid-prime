import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Search, Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";

const tracks = [
  { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", genre: "Pop" },
  { id: 2, title: "Shape of You", artist: "Ed Sheeran", duration: "3:53", genre: "Pop" },
  { id: 3, title: "Bohemian Rhapsody", artist: "Queen", duration: "5:55", genre: "Rock" },
  { id: 4, title: "Billie Jean", artist: "Michael Jackson", duration: "4:54", genre: "Pop" },
  { id: 5, title: "Smells Like Teen Spirit", artist: "Nirvana", duration: "5:01", genre: "Rock" },
  { id: 6, title: "Hotel California", artist: "Eagles", duration: "6:30", genre: "Rock" },
  { id: 7, title: "Levitating", artist: "Dua Lipa", duration: "3:23", genre: "Pop" },
  { id: 8, title: "Bad Guy", artist: "Billie Eilish", duration: "3:14", genre: "Pop" },
  { id: 9, title: "Stairway to Heaven", artist: "Led Zeppelin", duration: "8:02", genre: "Rock" },
  { id: 10, title: "Lose Yourself", artist: "Eminem", duration: "5:26", genre: "Hip-Hop" },
  { id: 11, title: "Rolling in the Deep", artist: "Adele", duration: "3:48", genre: "Pop" },
  { id: 12, title: "Humble", artist: "Kendrick Lamar", duration: "2:57", genre: "Hip-Hop" },
  { id: 13, title: "Uptown Funk", artist: "Bruno Mars", duration: "4:30", genre: "Funk" },
  { id: 14, title: "Someone Like You", artist: "Adele", duration: "4:45", genre: "Pop" },
  { id: 15, title: "Starboy", artist: "The Weeknd", duration: "3:50", genre: "Pop" },
  { id: 16, title: "God's Plan", artist: "Drake", duration: "3:18", genre: "Hip-Hop" },
  { id: 17, title: "Happier Than Ever", artist: "Billie Eilish", duration: "4:58", genre: "Pop" },
  { id: 18, title: "Anti-Hero", artist: "Taylor Swift", duration: "3:20", genre: "Pop" },
  { id: 19, title: "As It Was", artist: "Harry Styles", duration: "2:47", genre: "Pop" },
  { id: 20, title: "Flowers", artist: "Miley Cyrus", duration: "3:20", genre: "Pop" },
];

const PrimeMusicHub = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");

  const genres = ["All", "Pop", "Rock", "Hip-Hop", "Funk"];
  const filtered = tracks.filter(t =>
    (filter === "All" || t.genre === filter) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase()))
  );

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
                onChange={e => setSearch(e.target.value)}
                placeholder="Search songs or artists..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 px-5 pb-2 overflow-x-auto scrollbar-none">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={`depth-press px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${filter === g ? "bg-primary text-primary-foreground" : "liquid-glass-subtle text-foreground relative z-10"}`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1.5">
            {filtered.map((track, i) => (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setPlaying(playing === track.id ? null : track.id)}
                className={`depth-press w-full rounded-2xl p-3 flex items-center gap-3 relative z-10 ${playing === track.id ? "liquid-glass-elevated" : "liquid-glass-subtle"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${playing === track.id ? "bg-primary" : "bg-primary/20"}`}>
                  {playing === track.id ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                  <p className="text-caption text-muted-foreground truncate">{track.artist}</p>
                </div>
                <span className="text-caption text-muted-foreground">{track.duration}</span>
              </motion.button>
            ))}
          </div>

          {playing && (
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              className="liquid-glass-elevated px-5 py-4 safe-area-bottom"
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tracks.find(t => t.id === playing)?.title}</p>
                  <p className="text-caption text-muted-foreground">{tracks.find(t => t.id === playing)?.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="depth-press" onClick={() => setPlaying(Math.max(1, (playing || 1) - 1))}><SkipBack className="w-5 h-5 text-foreground" /></button>
                  <button className="depth-press w-10 h-10 rounded-full bg-primary flex items-center justify-center" onClick={() => setPlaying(null)}>
                    <Pause className="w-5 h-5 text-primary-foreground" />
                  </button>
                  <button className="depth-press" onClick={() => setPlaying(Math.min(tracks.length, (playing || 1) + 1))}><SkipForward className="w-5 h-5 text-foreground" /></button>
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
