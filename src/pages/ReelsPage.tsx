import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, Film, Upload, Heart, MessageCircle, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GlassTabBar from "@/components/GlassTabBar";

const ReelsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [caption, setCaption] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reels, setReels] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchReels = async () => {
      const { data } = await supabase
        .from("reels")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        setReels(data.map(r => ({ ...r, profile: profileMap.get(r.user_id) })));
      }
    };
    fetchReels();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateReel = async () => {
    if (!user || !videoFile) { toast.error("Select a video first"); return; }
    setUploading(true);
    try {
      const ext = videoFile.name.split(".").pop();
      const path = `${user.id}/reel_${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("media").upload(path, videoFile);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

      const { error } = await supabase.from("reels").insert({
        user_id: user.id,
        caption: caption || null,
        music_title: musicTitle || null,
        video_url: publicUrl,
      });
      if (error) throw error;
      toast.success("Reel created!");
      setCreating(false);
      setCaption("");
      setMusicTitle("");
      setVideoFile(null);
      setVideoPreview(null);
      // Refresh reels
      const { data } = await supabase.from("reels").select("*").order("created_at", { ascending: false }).limit(20);
      if (data) setReels(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to create reel");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate("/")} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base flex-1">Reels</span>
          <button onClick={() => setCreating(true)} className="depth-press w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>

      {reels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-3xl liquid-glass flex items-center justify-center mb-4">
            <Film className="w-8 h-8 text-muted-foreground relative z-10" />
          </div>
          <p className="text-foreground font-semibold mb-1">No reels yet</p>
          <p className="text-sm text-muted-foreground mb-4">Be the first to create a reel!</p>
          <button onClick={() => setCreating(true)} className="depth-press px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold">
            Create Your First Reel
          </button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-4">
          {reels.map((reel, i) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="liquid-glass rounded-2xl overflow-hidden"
            >
              {reel.video_url && (
                <video src={reel.video_url} className="w-full aspect-[9/16] object-cover bg-black" controls playsInline />
              )}
              <div className="p-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                    {(reel.profile?.display_name || "U")[0]}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{reel.profile?.display_name || "User"}</span>
                </div>
                {reel.caption && <p className="text-sm text-foreground/80 mb-2">{reel.caption}</p>}
                {reel.music_title && <p className="text-xs text-muted-foreground">🎵 {reel.music_title}</p>}
                <div className="flex items-center gap-4 mt-3">
                  <button className="depth-press"><Heart className="w-5 h-5 text-foreground" /></button>
                  <button className="depth-press"><MessageCircle className="w-5 h-5 text-foreground" /></button>
                  <button className="depth-press"><Share2 className="w-5 h-5 text-foreground" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl flex flex-col"
          >
            <div className="liquid-glass-elevated safe-area-top">
              <div className="flex items-center gap-3 px-5 py-4 relative z-10">
                <button onClick={() => { setCreating(false); setVideoFile(null); setVideoPreview(null); }} className="depth-press">
                  <X className="w-5 h-5 text-foreground" />
                </button>
                <span className="text-headline text-foreground text-base flex-1">New Reel</span>
                <button
                  onClick={handleCreateReel}
                  disabled={uploading || !videoFile}
                  className="depth-press px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Post"}
                </button>
              </div>
            </div>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              <div className="liquid-glass rounded-2xl p-6 relative z-10">
                <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                {videoPreview ? (
                  <div className="relative">
                    <video src={videoPreview} className="w-full rounded-xl aspect-[9/16] object-cover" controls />
                    <button
                      onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="depth-press w-full py-12 rounded-xl border-2 border-dashed border-border flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tap to upload video from device</span>
                  </button>
                )}
              </div>

              <div className="liquid-glass rounded-2xl p-4 relative z-10">
                <label className="text-caption text-muted-foreground block mb-2">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20"
                />
              </div>

              <div className="liquid-glass rounded-2xl p-4 relative z-10">
                <label className="text-caption text-muted-foreground block mb-2">Music (optional)</label>
                <input
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  placeholder="Add music title..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <GlassTabBar />
    </div>
  );
};

export default ReelsPage;
