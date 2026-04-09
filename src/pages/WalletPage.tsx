import { motion } from "framer-motion";
import { ArrowLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WalletPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base">Wallet</span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* Balance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="liquid-glass-elevated rounded-3xl p-6 text-center relative z-10">
          <p className="text-caption text-muted-foreground mb-1">Prime Balance</p>
          <p className="text-3xl text-display text-foreground">$0.00</p>
          <div className="flex justify-center gap-4 mt-4">
            <button className="depth-press flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center"><Plus className="w-5 h-5 text-primary" /></div>
              <span className="text-caption text-foreground">Add</span>
            </button>
            <button className="depth-press flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center"><ArrowUpRight className="w-5 h-5 text-foreground" /></div>
              <span className="text-caption text-foreground">Send</span>
            </button>
            <button className="depth-press flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center"><ArrowDownLeft className="w-5 h-5 text-foreground" /></div>
              <span className="text-caption text-foreground">Receive</span>
            </button>
          </div>
        </motion.div>
        <div className="liquid-glass rounded-2xl p-6 text-center relative z-10">
          <WalletIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
