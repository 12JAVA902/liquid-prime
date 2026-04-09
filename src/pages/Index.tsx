import TopNavBar from "@/components/TopNavBar";
import GlassTabBar from "@/components/GlassTabBar";
import StoriesBar from "@/components/StoriesBar";
import FeedPost from "@/components/FeedPost";

import feed1 from "@/assets/feed-1.jpg";
import feed2 from "@/assets/feed-2.jpg";
import feed3 from "@/assets/feed-3.jpg";
import feed4 from "@/assets/feed-4.jpg";
import feed5 from "@/assets/feed-5.jpg";

const posts = [
  {
    image: feed1,
    username: "oceandreamer",
    avatar: "🌊",
    caption: "Paradise found. This is where the sky meets the sea ✨",
    likes: 12847,
    comments: 342,
    timeAgo: "2h ago",
  },
  {
    image: feed2,
    username: "arch.studio",
    avatar: "🏛",
    caption: "Golden hour hitting different on this build 🌅",
    likes: 8923,
    comments: 156,
    timeAgo: "4h ago",
  },
  {
    image: feed3,
    username: "neon.nights",
    avatar: "🌃",
    caption: "Lost in the rain-soaked streets of Tokyo 🇯🇵",
    likes: 24561,
    comments: 891,
    timeAgo: "6h ago",
  },
  {
    image: feed4,
    username: "arctic.lens",
    avatar: "🌌",
    caption: "Nature's light show never disappoints 💚",
    likes: 31204,
    comments: 1203,
    timeAgo: "8h ago",
  },
  {
    image: feed5,
    username: "auto.elite",
    avatar: "🏎",
    caption: "Details make the difference. Every drop tells a story 💧",
    likes: 18756,
    comments: 567,
    timeAgo: "12h ago",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(210, 100%, 60%), transparent)" }}
        />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.02]"
          style={{ background: "radial-gradient(circle, hsl(280, 70%, 55%), transparent)" }}
        />
      </div>

      <TopNavBar />
      
      <main className="relative z-10 pt-16 pb-24">
        {/* Stories */}
        <div className="liquid-glass-subtle mx-4 rounded-2xl mt-2 mb-4">
          <StoriesBar />
        </div>

        {/* Feed */}
        <div className="px-4">
          {posts.map((post, i) => (
            <FeedPost key={post.username} {...post} index={i} />
          ))}
        </div>
      </main>

      <GlassTabBar />
    </div>
  );
};

export default Index;
