import { motion } from "framer-motion";

interface StoryBubbleProps {
  name: string;
  initial: string;
  gradient: string;
  hasNew?: boolean;
  index: number;
}

const StoryBubble = ({ name, initial, gradient, hasNew = true, index }: StoryBubbleProps) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center gap-1.5 min-w-[4.5rem] depth-press"
  >
    <div className={`relative w-16 h-16 rounded-full ${hasNew ? "p-[2px]" : "p-[1px]"}`}
      style={{ background: hasNew ? gradient : "hsla(var(--glass-border) / 0.15)" }}
    >
      <div className="w-full h-full rounded-full bg-background p-[2px]">
        <div className="w-full h-full rounded-full liquid-glass flex items-center justify-center">
          <span className="text-lg font-semibold text-foreground relative z-10">{initial}</span>
        </div>
      </div>
    </div>
    <span className="text-caption text-foreground/70 truncate w-full text-center">{name}</span>
  </motion.button>
);

const stories = [
  { name: "Your Story", initial: "+", gradient: "linear-gradient(135deg, hsl(210, 100%, 60%), hsl(260, 80%, 60%))", hasNew: false },
  { name: "alex.jpg", initial: "A", gradient: "linear-gradient(135deg, hsl(350, 80%, 58%), hsl(30, 90%, 55%))" },
  { name: "maya_k", initial: "M", gradient: "linear-gradient(135deg, hsl(170, 70%, 45%), hsl(210, 100%, 60%))" },
  { name: "jordan", initial: "J", gradient: "linear-gradient(135deg, hsl(280, 70%, 55%), hsl(350, 80%, 58%))" },
  { name: "sam.w", initial: "S", gradient: "linear-gradient(135deg, hsl(40, 90%, 55%), hsl(350, 80%, 58%))" },
  { name: "nova_art", initial: "N", gradient: "linear-gradient(135deg, hsl(210, 100%, 60%), hsl(170, 70%, 45%))" },
  { name: "kai.dev", initial: "K", gradient: "linear-gradient(135deg, hsl(260, 80%, 60%), hsl(210, 100%, 60%))" },
];

const StoriesBar = () => (
  <div className="overflow-x-auto scrollbar-none py-3 px-4">
    <div className="flex gap-3">
      {stories.map((story, i) => (
        <StoryBubble key={story.name} {...story} index={i} />
      ))}
    </div>
  </div>
);

export default StoriesBar;
