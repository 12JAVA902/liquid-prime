import { useState, useEffect } from "react";
import TopNavBar from "@/components/TopNavBar";
import GlassTabBar from "@/components/GlassTabBar";
import MoviesBar from "@/components/MoviesBar";
import FloatingActions from "@/components/FloatingActions";
import FeedPost from "@/components/FeedPost";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("posts").select("*, profiles!posts_user_id_fkey(display_name, username, avatar_url)").order("created_at", { ascending: false }).limit(50).then(({ data }) => {
      // If join fails, try without join
      if (!data) {
        supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50).then(({ data: d }) => setPosts(d || []));
      } else {
        setPosts(data || []);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(210, 100%, 60%), transparent)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.02]" style={{ background: "radial-gradient(circle, hsl(280, 70%, 55%), transparent)" }} />
      </div>

      <TopNavBar />

      <main className="relative z-10 pt-14 pb-24">
        <div className="liquid-glass-subtle mx-4 rounded-2xl mt-2 mb-4">
          <MoviesBar />
        </div>
        <div className="px-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl liquid-glass flex items-center justify-center mb-4">
                <span className="text-2xl relative z-10">📷</span>
              </div>
              <p className="text-foreground font-semibold mb-1">Welcome to Primegram</p>
              <p className="text-sm text-muted-foreground">No posts yet. Follow people or create your first post!</p>
            </div>
          ) : (
            posts.map((post, i) => (
              <FeedPost
                key={post.id}
                image={post.media_url || ""}
                username={(post.profiles as any)?.display_name || "User"}
                avatar={((post.profiles as any)?.display_name || "U")[0].toUpperCase()}
                caption={post.caption || ""}
                likes={post.likes_count || 0}
                comments={0}
                timeAgo={new Date(post.created_at).toLocaleDateString()}
                index={i}
              />
            ))
          )}
        </div>
      </main>

      <FloatingActions />
      <GlassTabBar />
    </div>
  );
};

export default Index;
