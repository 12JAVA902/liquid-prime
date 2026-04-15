import { useState, useEffect } from "react";
import TopNavBar from "@/components/TopNavBar";
import GlassTabBar from "@/components/GlassTabBar";
import StoriesBar from "@/components/StoriesBar";
import FloatingActions from "@/components/FloatingActions";
import FloatingOrb from "@/components/FloatingOrb";
import FeedPost from "@/components/FeedPost";
import LiquidBackground from "@/components/LiquidBackground";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .neq("media_type", "story")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, username, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        setPosts(data.map(post => ({ ...post, profile: profileMap.get(post.user_id) || null })));
      } else {
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <LiquidBackground />
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
      <FloatingOrb />
      <GlassTabBar />
    </div>
  );
};

export default Index;
