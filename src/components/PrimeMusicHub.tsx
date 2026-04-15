import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Search, Play, Pause, SkipForward, SkipBack, Youtube, Download, Heart, Volume2 } from "lucide-react";

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  youtubeId: string;
  saved?: boolean;
  playCount?: number;
  lastPlayed?: string;
}

interface SavedTrack extends Track {
  id: string;
  addedAt: string;
}

const tracks: Track[] = [
  { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", genre: "Pop", youtubeId: "4NRXx6U8ABQ" },
  { id: 2, title: "Shape of You", artist: "Ed Sheeran", duration: "3:53", genre: "Pop", youtubeId: "JGwWNGJdvx8" },
  { id: 3, title: "Bohemian Rhapsody", artist: "Queen", duration: "5:55", genre: "Rock", youtubeId: "fJ9rUzIMcZQ" },
  { id: 4, title: "Billie Jean", artist: "Michael Jackson", duration: "4:54", genre: "Pop", youtubeId: "Zi_XLOBDo_Y" },
  { id: 5, title: "Smells Like Teen Spirit", artist: "Nirvana", duration: "5:01", genre: "Rock", youtubeId: "hTWKbfoikeg" },
  { id: 6, title: "Hotel California", artist: "Eagles", duration: "6:30", genre: "Rock", youtubeId: "BciS5krYL80" },
  { id: 7, title: "Levitating", artist: "Dua Lipa", duration: "3:23", genre: "Pop", youtubeId: "TUVcZfQe-Kw" },
  { id: 8, title: "Bad Guy", artist: "Billie Eilish", duration: "3:14", genre: "Pop", youtubeId: "DyDfgMOUjCI" },
  { id: 9, title: "Stairway to Heaven", artist: "Led Zeppelin", duration: "8:02", genre: "Rock", youtubeId: "QkF3oxziUI4" },
  { id: 10, title: "Lose Yourself", artist: "Eminem", duration: "5:26", genre: "Hip-Hop", youtubeId: "_Yhyp-_hX2s" },
  { id: 11, title: "Rolling in the Deep", artist: "Adele", duration: "3:48", genre: "Pop", youtubeId: "rYEDA3JcQqw" },
  { id: 12, title: "Humble", artist: "Kendrick Lamar", duration: "2:57", genre: "Hip-Hop", youtubeId: "tvTRZJ-4EyI" },
  { id: 13, title: "Uptown Funk", artist: "Bruno Mars", duration: "4:30", genre: "Funk", youtubeId: "OPf0YbXqDm0" },
  { id: 14, title: "Someone Like You", artist: "Adele", duration: "4:45", genre: "Pop", youtubeId: "hLQl3WQQoQ0" },
  { id: 15, title: "Starboy", artist: "The Weeknd", duration: "3:50", genre: "Pop", youtubeId: "34Na4j8AVgA" },
  { id: 16, title: "God's Plan", artist: "Drake", duration: "3:18", genre: "Hip-Hop", youtubeId: "xpVfcZ0ZcFM" },
  { id: 17, title: "Flowers", artist: "Miley Cyrus", duration: "3:20", genre: "Pop", youtubeId: "G7KNmW9a75Y" },
  { id: 18, title: "Anti-Hero", artist: "Taylor Swift", duration: "3:20", genre: "Pop", youtubeId: "b1kbLwvqugk" },
  { id: 19, title: "As It Was", artist: "Harry Styles", duration: "2:47", genre: "Pop", youtubeId: "H5v3kku4y6Q" },
  { id: 20, title: "Stay", artist: "The Kid LAROI & Justin Bieber", duration: "2:21", genre: "Pop", youtubeId: "kTJczUoc26U" },
  { id: 21, title: "Peaches", artist: "Justin Bieber", duration: "3:18", genre: "Pop", youtubeId: "tQ0yjYUFKAE" },
  { id: 22, title: "Watermelon Sugar", artist: "Harry Styles", duration: "2:54", genre: "Pop", youtubeId: "E07s5ZYadZw" },
  { id: 23, title: "Savage Love", artist: "Jawsh 685 & Jason Derulo", duration: "2:51", genre: "Pop", youtubeId: "gUci-tsiU4I" },
  { id: 24, title: "Rockstar", artist: "Post Malone ft. 21 Savage", duration: "3:38", genre: "Hip-Hop", youtubeId: "UceaB4D0jpo" },
  { id: 25, title: "Thunder", artist: "Imagine Dragons", duration: "3:07", genre: "Rock", youtubeId: "fKopy74weus" },
  { id: 26, title: "Believer", artist: "Imagine Dragons", duration: "3:24", genre: "Rock", youtubeId: "7wtfhZwyrcc" },
  { id: 27, title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", duration: "4:42", genre: "Latin", youtubeId: "kJQP7kiw5Fk" },
  { id: 28, title: "Havana", artist: "Camila Cabello", duration: "3:37", genre: "Pop", youtubeId: "BQ0mxQXmLsk" },
  { id: 29, title: "Old Town Road", artist: "Lil Nas X", duration: "1:53", genre: "Hip-Hop", youtubeId: "r7qovpFAGrQ" },
  { id: 30, title: "Dance Monkey", artist: "Tones and I", duration: "3:29", genre: "Pop", youtubeId: "q0hyYWKXF0Q" },
];

const PrimeMusicHub = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<Track | null>(null);
  const [filter, setFilter] = useState("All");
  const [showPlayer, setShowPlayer] = useState(false);
  const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
  const [volume, setVolume] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const playerRef = useRef<HTMLIFrameElement>(null);

  // IndexedDB setup
  useEffect(() => {
    const initDB = async () => {
      if (typeof window === 'undefined' || !window.indexedDB) return;
      
      const request = indexedDB.open('PrimeMusicDB', 1);
      
      request.onerror = () => console.error('IndexedDB error');
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        loadSavedTracks(db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('savedTracks')) {
          const store = db.createObjectStore('savedTracks', { keyPath: 'id' });
          store.createIndex('addedAt', 'addedAt', { unique: false });
        }
      };
    };
    
    initDB();
  }, []);
  
  const loadSavedTracks = (db: IDBDatabase) => {
    const transaction = db.transaction(['savedTracks'], 'readonly');
    const store = transaction.objectStore('savedTracks');
    const request = store.getAll();
    
    request.onsuccess = () => {
      setSavedTracks(request.result || []);
    };
  };
  
  const saveTrack = (track: Track) => {
    if (typeof window === 'undefined' || !window.indexedDB) return;
    
    const request = indexedDB.open('PrimeMusicDB', 1);
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['savedTracks'], 'readwrite');
      const store = transaction.objectStore('savedTracks');
      
      const savedTrack: SavedTrack = {
        ...track,
        id: `track-${track.id}`,
        addedAt: new Date().toISOString(),
        playCount: (track.playCount || 0) + 1,
        lastPlayed: new Date().toISOString()
      };
      
      store.put(savedTrack);
      
      transaction.oncomplete = () => {
        loadSavedTracks(db);
      };
    };
  };
  
  const removeSavedTrack = (trackId: number) => {
    if (typeof window === 'undefined' || !window.indexedDB) return;
    
    const request = indexedDB.open('PrimeMusicDB', 1);
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['savedTracks'], 'readwrite');
      const store = transaction.objectStore('savedTracks');
      store.delete(`track-${trackId}`);
      
      transaction.oncomplete = () => {
        loadSavedTracks(db);
      };
    };
  };
  
  const isTrackSaved = (trackId: number) => {
    return savedTracks.some(t => t.id === `track-${trackId}`);
  };

  const genres = ["All", "Pop", "Rock", "Hip-Hop", "Funk", "Latin", "Saved"];
  const filtered = filter === "Saved" ? savedTracks : tracks.filter(t =>
    (filter === "All" || t.genre === filter) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase()))
  );

  const playTrack = (track: Track) => {
    setPlaying(track);
    setShowPlayer(true);
    saveTrack(track);
  };

  const nextTrack = () => {
    if (!playing) return;
    const currentTracks = filter === "Saved" ? savedTracks : tracks;
    const idx = currentTracks.findIndex(t => t.id === playing.id);
    let nextIndex = (idx + 1) % currentTracks.length;
    
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * currentTracks.length);
    }
    
    const next = currentTracks[nextIndex];
    if (next) playTrack(next);
  };

  const prevTrack = () => {
    if (!playing) return;
    const currentTracks = filter === "Saved" ? savedTracks : tracks;
    const idx = currentTracks.findIndex(t => t.id === playing.id);
    const prev = currentTracks[(idx - 1 + currentTracks.length) % currentTracks.length];
    if (prev) playTrack(prev);
  };
  
  const toggleRepeat = () => {
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
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

          {/* YouTube Player */}
          <AnimatePresence>
            {showPlayer && playing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 overflow-hidden"
              >
                <div className="rounded-2xl overflow-hidden aspect-video mb-2">
                  <iframe
                    ref={playerRef}
                    key={playing.youtubeId}
                    src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1&rel=0&controls=1&modestbranding=1`}
                    title={playing.title}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1.5">
            {filtered.map((track, i) => (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => playTrack(track)}
                className={`depth-press w-full rounded-2xl p-3 flex items-center gap-3 relative z-10 ${playing?.id === track.id ? "liquid-glass-elevated" : "liquid-glass-subtle"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${playing?.id === track.id ? "bg-primary" : "bg-primary/20"}`}>
                  {playing?.id === track.id ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                  <p className="text-caption text-muted-foreground truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); isTrackSaved(track.id) ? removeSavedTrack(track.id) : saveTrack(track); }}
                    className="depth-press w-7 h-7 rounded-full liquid-glass-subtle flex items-center justify-center"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isTrackSaved(track.id) ? "text-destructive fill-current" : "text-foreground"}`} />
                  </button>
                  <Youtube className="w-3 h-3 text-destructive" />
                  <span className="text-caption text-muted-foreground">{track.duration}</span>
                </div>
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
                  <p className="text-sm font-medium text-foreground truncate">{playing.title}</p>
                  <p className="text-caption text-muted-foreground">{playing.artist}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsShuffled(!isShuffled)} 
                    className={`depth-press w-8 h-8 rounded-full flex items-center justify-center ${isShuffled ? "bg-primary" : "liquid-glass-subtle"}`}
                  >
                    <span className="text-xs font-bold text-foreground">🔀</span>
                  </button>
                  <button 
                    onClick={toggleRepeat} 
                    className={`depth-press w-8 h-8 rounded-full flex items-center justify-center ${repeatMode !== 'off' ? "bg-primary" : "liquid-glass-subtle"}`}
                  >
                    <span className="text-xs font-bold text-foreground">{repeatMode === 'one' ? '🔂' : '🔁'}</span>
                  </button>
                  <button className="depth-press" onClick={prevTrack}><SkipBack className="w-5 h-5 text-foreground" /></button>
                  <button
                    className="depth-press w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                    onClick={() => setShowPlayer(!showPlayer)}
                  >
                    {showPlayer ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground" />}
                  </button>
                  <button className="depth-press" onClick={nextTrack}><SkipForward className="w-5 h-5 text-foreground" /></button>
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
