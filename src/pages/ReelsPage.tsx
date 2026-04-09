import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import feed1 from "@/assets/feed-1.jpg";
import feed2 from "@/assets/feed-2.jpg";
import feed3 from "@/assets/feed-3.jpg";
import feed4 from "@/assets/feed-4.jpg";
import feed5 from "@/assets/feed-5.jpg";

const reels = [
  { image: feed3, user: "neon.nights", views: "245K" },
  { image: feed1, user: "oceandreamer", views: "1.2M" },
  { image: feed5, user: "auto.elite", views: "89K" },
  { image: feed4, user: "arctic.lens", views: "560K" },
  { image: feed2, user: "arch.studio", views: "134K" },
  { image: feed1, user: "travel_co", views: "78K" },
];

const ReelsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base">Reels</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4">
        {reels.map((reel, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="relative rounded-2xl overflow-hidden aspect-[9/16] depth-press"
          >
            <img src={reel.image} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-sm font-semibold text-foreground">{reel.user}</p>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Play className="w-3 h-3" />
                <span className="text-caption">{reel.views}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReelsPage;
