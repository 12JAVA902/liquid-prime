import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  X,
  Image as ImageIcon,
  Film,
  Camera,
  Video as VideoIcon,
  RotateCcw,
  Sparkles,
  Sticker,
  Square,
  Circle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Mode = "upload" | "camera";

// CSS-filter based effects
const FILTERS = [
  { name: "Normal", css: "none" },
  { name: "Mono", css: "grayscale(1) contrast(1.05)" },
  { name: "Vivid", css: "saturate(1.5) contrast(1.1)" },
  { name: "Warm", css: "sepia(0.3) saturate(1.2) hue-rotate(-10deg)" },
  { name: "Cool", css: "hue-rotate(180deg) saturate(1.1)" },
  { name: "Noir", css: "grayscale(1) contrast(1.4) brightness(0.9)" },
  { name: "Dream", css: "blur(0.5px) brightness(1.1) saturate(1.3)" },
  { name: "Retro", css: "sepia(0.6) contrast(0.95) saturate(1.2)" },
  { name: "Neon", css: "hue-rotate(90deg) saturate(2) contrast(1.2)" },
  { name: "Fade", css: "contrast(0.85) brightness(1.1) saturate(0.8)" },
];

// Quick visual templates (filter + sticker preset)
const TEMPLATES = [
  { name: "Birthday", filter: "saturate(1.4)", emoji: "🎂✨🎉" },
  { name: "Travel", filter: "saturate(1.2) contrast(1.1)", emoji: "✈️🌍📍" },
  { name: "Foodie", filter: "saturate(1.5) brightness(1.05)", emoji: "🍕🔥😋" },
  { name: "Gym", filter: "contrast(1.2) saturate(0.9)", emoji: "💪🔥" },
  { name: "Love", filter: "saturate(1.3) brightness(1.05)", emoji: "❤️💕" },
];

const STICKERS = ["❤️", "🔥", "✨", "😎", "💯", "🎉", "⭐", "🌟", "💫", "🚀", "🌈", "💖"];

interface Overlay {
  id: string;
  emoji: string;
  x: number; // percent
  y: number; // percent
}

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("upload");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);
  const [filterCss, setFilterCss] = useState("none");
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [showStickers, setShowStickers] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoStreamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start/stop camera
  useEffect(() => {
    if (mode !== "camera" || preview) return;
    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoStreamRef.current) videoStreamRef.current.srcObject = stream;
      } catch (err) {
        toast.error("Camera access denied");
        setMode("upload");
      }
    };
    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [mode, facing, preview]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMediaType(f.type.startsWith("video") ? "video" : "image");
  };

  const snapPhoto = () => {
    if (!videoStreamRef.current || !canvasRef.current) return;
    const v = videoStreamRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.filter = filterCss;
    ctx.drawImage(v, 0, 0);
    c.toBlob(
      (blob) => {
        if (!blob) return;
        const f = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        setFile(f);
        setPreview(URL.createObjectURL(blob));
        setMediaType("image");
      },
      "image/jpeg",
      0.92,
    );
  };

  const toggleRecord = () => {
    if (recording) {
      recorderRef.current?.stop();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      setRecording(false);
      return;
    }
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const rec = new MediaRecorder(streamRef.current, { mimeType: mime });
    rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const f = new File([blob], `video-${Date.now()}.webm`, { type: "video/webm" });
      setFile(f);
      setPreview(URL.createObjectURL(blob));
      setMediaType("video");
      setRecordSecs(0);
    };
    rec.start();
    recorderRef.current = rec;
    setRecording(true);
    setRecordSecs(0);
    recordTimerRef.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
  };

  const addSticker = (emoji: string) => {
    setOverlays((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, emoji, x: 50, y: 50 },
    ]);
    setShowStickers(false);
  };

  // Bake filter + overlays into the final image before uploading
  const bakeImage = async (src: File): Promise<File> => {
    if (mediaType !== "image" || (filterCss === "none" && overlays.length === 0)) return src;
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = URL.createObjectURL(src);
    });
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.filter = filterCss;
    ctx.drawImage(img, 0, 0);
    // Reset filter for overlays
    ctx.filter = "none";
    const fontSize = Math.round(c.width * 0.12);
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    overlays.forEach((o) => {
      ctx.fillText(o.emoji, (o.x / 100) * c.width, (o.y / 100) * c.height);
    });
    return await new Promise<File>((resolve) =>
      c.toBlob(
        (b) =>
          resolve(new File([b!], `edited-${Date.now()}.jpg`, { type: "image/jpeg" })),
        "image/jpeg",
        0.92,
      ),
    );
  };

  const handlePost = async () => {
    if (!user || !file) {
      toast.error("Capture or select something first");
      return;
    }
    setUploading(true);
    try {
      const finalFile = await bakeImage(file);
      const ext = finalFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("media").upload(path, finalFile);
      if (uploadErr) throw uploadErr;
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(path);
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        caption: caption || null,
        media_url: publicUrl,
        media_type: mediaType,
      });
      if (error) throw error;
      toast.success("Post shared!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  const resetMedia = () => {
    setFile(null);
    setPreview(null);
    setOverlays([]);
    setFilterCss("none");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-headline text-foreground text-base flex-1">New Post</span>
          <button
            onClick={handlePost}
            disabled={uploading || !file}
            className="depth-press px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
          >
            {uploading ? "..." : "Share"}
          </button>
        </div>

        {/* Mode toggle */}
        {!preview && (
          <div className="px-5 pb-3 flex gap-2 relative z-10">
            {(["camera", "upload"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`depth-press flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
                  mode === m ? "bg-primary text-primary-foreground" : "liquid-glass text-foreground"
                }`}
              >
                {m === "camera" ? <Camera className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                {m === "camera" ? "Camera" : "Library"}
              </button>
            ))}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />

      <div className="p-5 space-y-4">
        {/* PREVIEW MODE */}
        {preview ? (
          <>
            <div
              ref={previewRef}
              className="relative liquid-glass rounded-2xl overflow-hidden aspect-square"
              style={{ filter: filterCss }}
            >
              {mediaType === "video" ? (
                <video src={preview} className="w-full h-full object-cover" controls playsInline />
              ) : (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              )}
              {/* Overlays (only on image) */}
              {mediaType === "image" &&
                overlays.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setOverlays((prev) => prev.filter((x) => x.id !== o.id))}
                    className="absolute text-5xl select-none cursor-pointer"
                    style={{ left: `${o.x}%`, top: `${o.y}%`, transform: "translate(-50%,-50%)", filter: "none" }}
                    title="Tap to remove"
                  >
                    {o.emoji}
                  </div>
                ))}
              <button
                onClick={resetMedia}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"
                style={{ filter: "none" }}
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Filters scroller */}
            <div className="space-y-2">
              <p className="text-caption text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Effects
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setFilterCss(f.css)}
                    className={`depth-press flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium ${
                      filterCss === f.css ? "bg-primary text-primary-foreground" : "liquid-glass text-foreground"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div className="space-y-2">
              <p className="text-caption text-muted-foreground">Templates</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setFilterCss(t.filter);
                      [...t.emoji].forEach((e, i) =>
                        setOverlays((prev) => [
                          ...prev,
                          { id: `${Date.now()}-${i}`, emoji: e, x: 20 + i * 15, y: 20 + i * 10 },
                        ]),
                      );
                    }}
                    className="depth-press flex-shrink-0 liquid-glass rounded-xl px-3 py-2 text-xs font-medium text-foreground"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stickers */}
            {mediaType === "image" && (
              <div>
                <button
                  onClick={() => setShowStickers((s) => !s)}
                  className="depth-press w-full liquid-glass rounded-xl py-2 text-xs font-medium text-foreground flex items-center justify-center gap-2"
                >
                  <Sticker className="w-4 h-4" /> Stickers
                </button>
                <AnimatePresence>
                  {showStickers && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-6 gap-2 mt-2">
                        {STICKERS.map((e) => (
                          <button
                            key={e}
                            onClick={() => addSticker(e)}
                            className="depth-press liquid-glass rounded-xl py-2 text-2xl"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="liquid-glass rounded-2xl p-4 relative z-10">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-24"
              />
            </div>
          </>
        ) : mode === "camera" ? (
          <div className="space-y-4">
            <div className="relative liquid-glass rounded-2xl overflow-hidden aspect-square bg-black">
              <video
                ref={videoStreamRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facing === "user" ? "mirror" : ""}`}
                style={{ filter: filterCss }}
              />
              {recording && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive/90 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  REC {Math.floor(recordSecs / 60)}:{(recordSecs % 60).toString().padStart(2, "0")}
                </div>
              )}
              <button
                onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/60 flex items-center justify-center backdrop-blur-md"
              >
                <RotateCcw className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Filter row on camera too */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFilterCss(f.css)}
                  className={`depth-press flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium ${
                    filterCss === f.css ? "bg-primary text-primary-foreground" : "liquid-glass text-foreground"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Capture controls */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                onClick={snapPhoto}
                disabled={recording}
                className="depth-press w-14 h-14 rounded-2xl liquid-glass-elevated flex items-center justify-center disabled:opacity-40"
                aria-label="Take photo"
              >
                <Square className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={toggleRecord}
                className={`depth-press w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                  recording ? "border-destructive bg-destructive" : "border-white bg-white/20"
                }`}
                aria-label="Record video"
              >
                {recording ? (
                  <Square className="w-7 h-7 text-white" fill="white" />
                ) : (
                  <Circle className="w-10 h-10 text-white" fill="white" />
                )}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="depth-press w-14 h-14 rounded-2xl liquid-glass-elevated flex items-center justify-center"
                aria-label="Pick from library"
              >
                <ImageIcon className="w-6 h-6 text-foreground" />
              </button>
            </div>
          </div>
        ) : (
          // UPLOAD MODE
          <button
            onClick={() => fileRef.current?.click()}
            className="depth-press w-full aspect-square rounded-2xl liquid-glass flex flex-col items-center justify-center gap-3 relative z-10"
          >
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Film className="w-7 h-7 text-primary" />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Tap to select photo or video</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CreatePostPage;
