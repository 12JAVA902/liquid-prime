import { useState, useEffect } from "react";
import TopNavBar from "@/components/TopNavBar";
import GlassTabBar from "@/components/GlassTabBar";
import StoriesBar from "@/components/StoriesBar";
import FloatingActions from "@/components/FloatingActions";
import FeedPost from "@/components/FeedPost";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      // Fetch posts (not stories) with profile info
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .neq("media_type", "story")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (data && data.length > 0) {
        // Fetch profiles for these posts
        const userIds = [...new Set(data.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, username, avatar_url")
          .in("user_id", userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const enriched = data.map(post => ({
          ...post,
          profile: profileMap.get(post.user_id) || null,
        }));
        setPosts(enriched);
      } else {
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Liquid glass ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(210, 100%, 60%), transparent)" }} />
        <div className="absolute bottom-[-5%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(280, 70%, 55%), transparent)" }} />
        <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full opacity-[0.02]" style={{ background: "radial-gradient(circle, hsl(350, 80%, 58%), transparent)" }} />
      </div>

      <TopNavBar />

      <main className="relative z-10 pt-14 pb-24">
        <div className="liquid-glass-subtle mx-4 rounded-2xl mt-2 mb-4">
          <StoriesBar />
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
                mediaType={post.media_type || "image"}
                username={post.profile?.display_name || "User"}
                avatar={post.profile?.avatar_url || (post.profile?.display_name || "U")[0].toUpperCase()}
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
