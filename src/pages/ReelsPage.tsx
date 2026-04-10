import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, Film, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ReelsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [caption, setCaption] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateReel = async () => {
    if (!user) return;
    setUploading(true);
    try {
      // Insert reel metadata (video storage would need a storage bucket)
      const { error } = await supabase.from("reels").insert({
        user_id: user.id,
        caption: caption || null,
        music_title: musicTitle || null,
        video_url: videoPreview || null,
      });
      if (error) throw error;
      toast.success("Reel created!");
      setCreating(false);
      setCaption("");
      setMusicTitle("");
      setVideoFile(null);
      setVideoPreview(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to create reel");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base flex-1">Reels</span>
          <button onClick={() => setCreating(true)} className="depth-press w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Empty state */}
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

      {/* Create Reel Modal */}
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
                <button onClick={() => setCreating(false)} className="depth-press">
                  <X className="w-5 h-5 text-foreground" />
                </button>
                <span className="text-headline text-foreground text-base flex-1">New Reel</span>
                <button
                  onClick={handleCreateReel}
                  disabled={uploading}
                  className="depth-press px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                >
                  {uploading ? "..." : "Post"}
                </button>
              </div>
            </div>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              {/* Video Upload */}
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
                    <span className="text-sm text-muted-foreground">Tap to upload video</span>
                  </button>
                )}
              </div>

              {/* Caption */}
              <div className="liquid-glass rounded-2xl p-4 relative z-10">
                <label className="text-caption text-muted-foreground block mb-2">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20"
                />
              </div>

              {/* Music */}
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
    </div>
  );
};

export default ReelsPage;
