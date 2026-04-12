import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Play, Search, X, TrendingUp, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassTabBar from "@/components/GlassTabBar";

const allMovies = [
  { title: "The Shawshank Redemption", year: 1994, genre: "Drama", rating: 9.3, poster: "🎬", desc: "Two imprisoned men bond over years, finding solace and eventual redemption through acts of common decency." },
  { title: "The Godfather", year: 1972, genre: "Crime", rating: 9.2, poster: "🎭", desc: "The aging patriarch of an organized crime dynasty transfers control to his reluctant youngest son." },
  { title: "The Dark Knight", year: 2008, genre: "Action", rating: 9.0, poster: "🦇", desc: "Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice." },
  { title: "Pulp Fiction", year: 1994, genre: "Crime", rating: 8.9, poster: "💊", desc: "The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine in four tales of violence and redemption." },
  { title: "Forrest Gump", year: 1994, genre: "Drama", rating: 8.8, poster: "🏃", desc: "The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75." },
  { title: "Inception", year: 2010, genre: "Sci-Fi", rating: 8.8, poster: "🌀", desc: "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea." },
  { title: "The Matrix", year: 1999, genre: "Sci-Fi", rating: 8.7, poster: "💻", desc: "A computer programmer discovers that reality as he knows it is a simulation created by machines." },
  { title: "Interstellar", year: 2014, genre: "Sci-Fi", rating: 8.7, poster: "🚀", desc: "A team of explorers travel through a wormhole in space to ensure humanity's survival." },
  { title: "Parasite", year: 2019, genre: "Thriller", rating: 8.5, poster: "🏠", desc: "Greed and class discrimination threaten the newly formed symbiotic relationship between two families." },
  { title: "Oppenheimer", year: 2023, genre: "Drama", rating: 8.3, poster: "💥", desc: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb." },
  { title: "Avengers: Endgame", year: 2019, genre: "Action", rating: 8.4, poster: "🛡️", desc: "After Thanos' devastating snap, the remaining Avengers assemble once more to undo his actions." },
  { title: "Spider-Man: No Way Home", year: 2021, genre: "Action", rating: 8.2, poster: "🕷️", desc: "Peter Parker's identity is revealed, and he seeks Doctor Strange's help to make the world forget." },
  { title: "Dune: Part Two", year: 2024, genre: "Sci-Fi", rating: 8.5, poster: "🏜️", desc: "Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family." },
  { title: "John Wick 4", year: 2023, genre: "Action", rating: 7.7, poster: "🔫", desc: "John Wick uncovers a path to defeating The High Table, but must face a new enemy with powerful alliances." },
  { title: "Top Gun: Maverick", year: 2022, genre: "Action", rating: 8.2, poster: "✈️", desc: "After thirty years, Maverick is still pushing the envelope as a top naval aviator." },
  { title: "Everything Everywhere All at Once", year: 2022, genre: "Sci-Fi", rating: 7.8, poster: "🥯", desc: "A middle-aged woman must connect with parallel universe versions of herself to stop a powerful being." },
  { title: "The Batman", year: 2022, genre: "Action", rating: 7.8, poster: "🦇", desc: "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind cryptic clues." },
  { title: "Joker", year: 2019, genre: "Drama", rating: 8.4, poster: "🃏", desc: "A mentally troubled comedian embarks on a downward spiral that leads to the creation of an iconic villain." },
  { title: "1917", year: 2019, genre: "War", rating: 8.3, poster: "⚔️", desc: "Two young British soldiers must cross enemy territory to deliver a message that could save 1,600 men." },
  { title: "Gladiator", year: 2000, genre: "Action", rating: 8.5, poster: "⚔️", desc: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family." },
];

const genres = ["All", "Action", "Drama", "Sci-Fi", "Crime", "Thriller", "War"];

const MoviesPage = () => {
  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<typeof allMovies[0] | null>(null);

  const filtered = allMovies.filter(m => {
    const matchGenre = selectedGenre === "All" || m.genre === selectedGenre;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  const trending = allMovies.filter(m => m.year >= 2022).sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <Film className="w-5 h-5 text-primary" />
          <span className="text-headline text-foreground text-base flex-1">Movie Hub</span>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="liquid-glass rounded-2xl flex items-center gap-2 px-4 py-3 relative z-10">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search movies..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-none px-4 pb-3">
        <div className="flex gap-2">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`depth-press px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${selectedGenre === g ? "bg-primary text-primary-foreground" : "liquid-glass text-foreground relative z-10"}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {!search && selectedGenre === "All" && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Trending Now</span>
          </div>
          <div className="overflow-x-auto scrollbar-none">
            <div className="flex gap-3">
              {trending.slice(0, 6).map((movie, i) => (
                <motion.button
                  key={movie.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedMovie(movie)}
                  className="depth-press liquid-glass rounded-2xl p-3 min-w-[140px] flex flex-col items-center gap-2 relative z-10"
                >
                  <span className="text-3xl">{movie.poster}</span>
                  <span className="text-xs font-semibold text-foreground text-center line-clamp-2">{movie.title}</span>
                  <span className="flex items-center gap-1 text-xs text-primary"><Star className="w-3 h-3" />{movie.rating}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 space-y-2">
        {filtered.map((movie, i) => (
          <motion.button
            key={movie.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedMovie(movie)}
            className="depth-press liquid-glass rounded-2xl p-4 flex items-center gap-4 w-full text-left relative z-10"
          >
            <div className="w-14 h-14 rounded-xl liquid-glass-subtle flex items-center justify-center text-2xl">
              {movie.poster}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{movie.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{movie.year}</span>
                <span>•</span>
                <span>{movie.genre}</span>
                <span className="flex items-center gap-1 text-primary ml-auto"><Star className="w-3 h-3" />{movie.rating}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setSelectedMovie(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="liquid-glass-elevated rounded-3xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl liquid-glass flex items-center justify-center text-3xl">
                  {selectedMovie.poster}
                </div>
                <button onClick={() => setSelectedMovie(null)} className="depth-press w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1 relative z-10">{selectedMovie.title}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 relative z-10">
                <span>{selectedMovie.year}</span>
                <span>{selectedMovie.genre}</span>
                <span className="flex items-center gap-1 text-primary"><Star className="w-3 h-3" />{selectedMovie.rating}</span>
              </div>
              <p className="text-sm text-foreground/70 mb-4 relative z-10">{selectedMovie.desc}</p>
              <button
                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + " trailer")}`, "_blank")}
                className="depth-press w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Watch Trailer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <GlassTabBar />
    </div>
  );
};

export default MoviesPage;
