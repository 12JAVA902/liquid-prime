import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Play, Search, X, Film, Heart, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassTabBar from "@/components/GlassTabBar";
import LiquidBackground from "@/components/LiquidBackground";

const TMDB_IMG = "https://image.tmdb.org/t/p";
const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tmdb-proxy`;

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  53: "Thriller", 10752: "War", 37: "Western",
};

const MoviesPage = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"trending" | "top_rated" | "upcoming">("trending");

  const fetchMovies = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${FUNC_URL}?endpoint=${endpoint}`, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !Array.isArray(data.results)) {
        console.warn('Invalid TMDB response format:', data);
        setError('Failed to load movies');
        return [];
      }
      return data.results.filter((movie: any) => movie && movie.id && movie.title);
    } catch (error) {
      console.error('TMDB fetch error:', error);
      setError('Network error. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const endpoints: Record<string, string> = { trending: "trending/movie/week", top_rated: "movie/top_rated", upcoming: "movie/upcoming" };
    fetchMovies(endpoints[tab]).then(r => { setTrending(r); });
  }, [tab]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); setError(null); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${FUNC_URL}?endpoint=search/movie&query=${encodeURIComponent(search)}`, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        });
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        setError('Search failed. Please try again.');
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openMovie = async (movie: Movie) => {
    setSelectedMovie(movie);
    setTrailerKey(null);
    try {
      const res = await fetch(`${FUNC_URL}?endpoint=movie/${movie.id}/videos`, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      const data = await res.json();
      const trailer = data.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
      if (trailer) setTrailerKey(trailer.key);
    } catch {}
  };

  const toggleFav = (id: number) => {
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const movies = search.trim() ? searchResults : trending;

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      <LiquidBackground />
      <div className="liquid-glass-elevated safe-area-top relative z-10">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <Film className="w-5 h-5 text-primary" />
          <span className="text-headline text-foreground text-base flex-1">Movie Hub</span>
        </div>
      </div>

      <div className="px-4 py-3 relative z-10">
        <div className="liquid-glass rounded-2xl flex items-center gap-2 px-4 py-3 relative z-10">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movies..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </div>

      {!search && (
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none relative z-10">
          {([["trending", "🔥 Trending"], ["top_rated", "⭐ Top Rated"], ["upcoming", "🎬 Upcoming"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`depth-press px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${tab === k ? "bg-primary text-primary-foreground" : "liquid-glass text-foreground relative z-10"}`}>
              {l}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 relative z-10">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-center text-muted-foreground">{error}</p>
          <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Try Again
          </button>
        </div>
      )}

      {loading && !search && !error ? (
        <div className="px-4 grid grid-cols-2 gap-3 relative z-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-secondary rounded-2xl animate-pulse">
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      ) : !error && (
        <div className="flex justify-center py-20 relative z-10"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <div className="px-4 grid grid-cols-2 gap-3 relative z-10">
          {movies.map((movie, i) => (
            <motion.button key={movie.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => openMovie(movie)} className="depth-press liquid-glass rounded-2xl overflow-hidden text-left relative">
              {movie.poster_path ? (
                <img src={`${TMDB_IMG}/w500${movie.poster_path}`} alt={movie.title} className="w-full aspect-[2/3] object-cover" loading="lazy" />
              ) : (
                <div className="w-full aspect-[2/3] bg-secondary flex items-center justify-center"><Film className="w-8 h-8 text-muted-foreground" /></div>
              )}
              <div className="p-2.5 relative z-10">
                <p className="text-xs font-semibold text-foreground line-clamp-1">{movie.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{movie.release_date?.slice(0, 4)}</span>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); toggleFav(movie.id); }}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full liquid-glass flex items-center justify-center">
                <Heart className={`w-3.5 h-3.5 ${favorites.has(movie.id) ? "text-destructive fill-current" : "text-foreground"}`} />
              </button>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedMovie && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl flex flex-col" onClick={() => setSelectedMovie(null)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="flex-1 overflow-y-auto" onClick={e => e.stopPropagation()}>
              {selectedMovie.backdrop_path ? (
                <div className="relative h-56">
                  <img src={`${TMDB_IMG}/w1280${selectedMovie.backdrop_path}`} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  <button onClick={() => setSelectedMovie(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full liquid-glass flex items-center justify-center z-10">
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-end p-4">
                  <button onClick={() => setSelectedMovie(null)} className="depth-press w-9 h-9 rounded-full liquid-glass flex items-center justify-center"><X className="w-5 h-5 text-foreground" /></button>
                </div>
              )}
              <div className="px-5 pb-8 -mt-12 relative z-10">
                <div className="w-24 rounded-xl shadow-lg">
                  <img src={`${TMDB_IMG}/w500${selectedMovie.poster_path}`} alt="" className="w-24 rounded-xl shadow-lg" />
                </div>
                <div className="flex-1 pt-12">
                  <h2 className="text-lg font-bold text-foreground">{selectedMovie.title}</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1 text-primary"><Star className="w-3 h-3" />{selectedMovie.vote_average.toFixed(1)}</span>
                    <span>{selectedMovie.release_date?.slice(0, 4)}</span>
                    {selectedMovie.genre_ids?.slice(0, 2).map(g => <span key={g} className="px-2 py-0.5 rounded-full liquid-glass-subtle text-xs">{genreMap[g] || ""}</span>)}
                  </div>
                </div>
                {trailerKey && (
                  <div className="rounded-2xl overflow-hidden mb-4 aspect-video">
                    <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} title="Trailer" className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                  </div>
                )}
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">{selectedMovie.overview}</p>
                <div className="flex gap-3">
                  <button onClick={() => toggleFav(selectedMovie.id)} className={`depth-press flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 ${favorites.has(selectedMovie.id) ? "bg-destructive/20 text-destructive" : "liquid-glass text-foreground relative z-10"}`}>
                    <Heart className={`w-4 h-4 ${favorites.has(selectedMovie.id) ? "fill-current" : ""}`} />
                    {favorites.has(selectedMovie.id) ? "Favorited" : "Favorite"}
                  </button>
                  {!trailerKey && (
                    <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + " trailer")}`, "_blank")} className="depth-press flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" /> Trailer
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <GlassTabBar />
    </div>
  );
};

export default MoviesPage;
