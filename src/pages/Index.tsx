import TopNavBar from "@/components/TopNavBar";
import GlassTabBar from "@/components/GlassTabBar";
import StoriesBar from "@/components/StoriesBar";
import FloatingActions from "@/components/FloatingActions";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(210, 100%, 60%), transparent)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.02]" style={{ background: "radial-gradient(circle, hsl(280, 70%, 55%), transparent)" }} />
      </div>

      <TopNavBar />

      <main className="relative z-10 pt-14 pb-24">
        <div className="liquid-glass-subtle mx-4 rounded-2xl mt-2 mb-4">
          <StoriesBar />
        </div>
        <div className="px-4">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl liquid-glass flex items-center justify-center mb-4">
              <span className="text-2xl relative z-10">📷</span>
            </div>
            <p className="text-foreground font-semibold mb-1">Welcome to Primegram</p>
            <p className="text-sm text-muted-foreground">No posts yet. Follow people or create your first post!</p>
          </div>
        </div>
      </main>

      <FloatingActions />
      <GlassTabBar />
    </div>
  );
};

export default Index;
