import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, Grid3X3, Bookmark, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import feed1 from "@/assets/feed-1.jpg";
import feed2 from "@/assets/feed-2.jpg";
import feed3 from "@/assets/feed-3.jpg";
import feed4 from "@/assets/feed-4.jpg";
import feed5 from "@/assets/feed-5.jpg";

const postImages = [feed1, feed2, feed3, feed4, feed5];

interface Profile {
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [tab, setTab] = useState<"posts" | "saved" | "liked">("posts");

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, username, bio, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data) setProfile(data);

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id);
      setFollowersCount(followers || 0);

      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id);
      setFollowingCount(following || 0);
    };
    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Sign in to view your profile</p>
          <button onClick={() => navigate("/auth")} className="depth-press px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base flex-1">{profile?.username || "Profile"}</span>
          <button onClick={() => navigate("/settings")} className="depth-press"><Settings className="w-5 h-5 text-foreground" /></button>
        </div>
      </div>

      {/* Profile header */}
      <div className="p-5">
        <div className="flex items-center gap-5 mb-4">
          <div className="w-20 h-20 rounded-full liquid-glass flex items-center justify-center">
            <span className="text-2xl font-bold text-primary relative z-10">
              {(profile?.display_name || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 flex justify-around text-center">
            <div><p className="text-lg font-bold text-foreground">0</p><p className="text-caption text-muted-foreground">Posts</p></div>
            <div><p className="text-lg font-bold text-foreground">{followersCount}</p><p className="text-caption text-muted-foreground">Followers</p></div>
            <div><p className="text-lg font-bold text-foreground">{followingCount}</p><p className="text-caption text-muted-foreground">Following</p></div>
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground">{profile?.display_name || "User"}</p>
        <p className="text-sm text-muted-foreground mt-1">{profile?.bio || "No bio yet"}</p>

        <div className="flex gap-2 mt-4">
          <button onClick={() => navigate("/settings")} className="depth-press flex-1 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-foreground relative z-10">
            Edit Profile
          </button>
          <button className="depth-press flex-1 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-foreground relative z-10">
            Share Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "posts" as const, icon: Grid3X3 },
          { id: "saved" as const, icon: Bookmark },
          { id: "liked" as const, icon: Heart },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 flex justify-center relative ${tab === t.id ? "text-foreground" : "text-muted-foreground"}`}
          >
            <t.icon className="w-5 h-5" />
            {tab === t.id && (
              <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {postImages.map((img, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="aspect-square">
            <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
