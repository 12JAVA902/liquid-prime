import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X, Image, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMediaType(f.type.startsWith("video") ? "video" : "image");
  };

  const handlePost = async () => {
    if (!user || !file) { toast.error("Select a photo or video"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("media").upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        caption: caption || null,
        media_url: publicUrl,
        media_type: mediaType,
      });
      if (error) throw error;
      toast.success("Post created!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base flex-1">New Post</span>
          <button onClick={handlePost} disabled={uploading || !file} className="depth-press px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
            {uploading ? "..." : "Share"}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
        
        {preview ? (
          <div className="relative liquid-glass rounded-2xl overflow-hidden">
            {mediaType === "video" ? (
              <video src={preview} className="w-full aspect-square object-cover" controls />
            ) : (
              <img src={preview} className="w-full aspect-square object-cover" alt="Preview" />
            )}
            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="depth-press w-full aspect-square rounded-2xl liquid-glass flex flex-col items-center justify-center gap-3 relative z-10">
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Image className="w-7 h-7 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Film className="w-7 h-7 text-primary" />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Tap to select photo or video</span>
          </button>
        )}

        <div className="liquid-glass rounded-2xl p-4 relative z-10">
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-24"
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
