import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoryBubbleProps {
  name: string;
  imageUrl?: string | null;
  initial: string;
  gradient: string;
  hasNew?: boolean;
  index: number;
  onClick?: () => void;
  isAdd?: boolean;
}

const StoryBubble = ({ name, imageUrl, initial, gradient, hasNew = true, index, onClick, isAdd }: StoryBubbleProps) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center gap-1.5 min-w-[4.5rem] depth-press"
    onClick={onClick}
  >
    <div className={`relative w-16 h-16 rounded-full ${hasNew ? "p-[2px]" : "p-[1px]"}`}
      style={{ background: hasNew ? gradient : "hsla(var(--glass-border) / 0.15)" }}
    >
      <div className="w-full h-full rounded-full bg-background p-[2px]">
        <div className="w-full h-full rounded-full liquid-glass flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : isAdd ? (
            <Plus className="w-6 h-6 text-primary relative z-10" />
          ) : (
            <span className="text-lg font-semibold text-foreground relative z-10">{initial}</span>
          )}
        </div>
      </div>
    </div>
    <span className="text-caption text-foreground/70 truncate w-full text-center">{name}</span>
  </motion.button>
);

interface StoryView {
  id: string;
  image_url: string;
  display_name: string;
  created_at: string;
}

const StoriesBar = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryView[]>([]);
  const [viewingStory, setViewingStory] = useState<StoryView | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddStory = () => {
    fileRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/story_${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("media").upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      
      // Store as a post with media_type = 'story'
      await supabase.from("posts").insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: "story",
        caption: "Story",
      });
      toast.success("Story posted!");
      // Add to local state
      setStories(prev => [{
        id: Date.now().toString(),
        image_url: publicUrl,
        display_name: user.user_metadata?.full_name || "You",
        created_at: new Date().toISOString(),
      }, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Failed to post story");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <div className="overflow-x-auto scrollbar-none py-3 px-4">
        <div className="flex gap-3">
          <StoryBubble
            name={uploading ? "Posting..." : "Your Story"}
            initial="+"
            gradient="linear-gradient(135deg, hsl(210, 100%, 60%), hsl(260, 80%, 60%))"
            hasNew={false}
            index={0}
            onClick={handleAddStory}
            isAdd
          />
          {stories.map((story, i) => (
            <StoryBubble
              key={story.id}
              name={story.display_name}
              imageUrl={story.image_url}
              initial={story.display_name[0]}
              gradient="linear-gradient(135deg, hsl(350, 80%, 58%), hsl(280, 70%, 55%))"
              hasNew
              index={i + 1}
              onClick={() => setViewingStory(story)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {viewingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black flex items-center justify-center"
            onClick={() => setViewingStory(null)}
          >
            <button onClick={() => setViewingStory(null)} className="absolute top-12 right-4 z-10 w-10 h-10 rounded-full liquid-glass flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
            <img src={viewingStory.image_url} alt="Story" className="max-w-full max-h-full object-contain" />
            <div className="absolute bottom-8 left-4 text-white text-sm font-semibold">{viewingStory.display_name}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoriesBar;
