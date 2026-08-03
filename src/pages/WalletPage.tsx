import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, X, CreditCard, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GlassTabBar from "@/components/GlassTabBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  id: string;
  type: "send" | "receive" | "topup";
  amount: number;
  counterparty: string | null;
  created_at: string;
}

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"send" | "receive" | "topup" | null>(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const balance = transactions.reduce((b, t) => b + (t.type === "send" ? -Number(t.amount) : Number(t.amount)), 0);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("id, type, amount, counterparty, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load wallet");
    else setTransactions((data as Transaction[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    // Top-ups require a verified payment and are credited by the payment
    // processor server-side — the client can never create funds itself.
    if (modal === "topup") {
      toast.info("Top-ups require a verified payment method. Card top-ups are coming soon.");
      return;
    }

    // "Receive" is not a client action: funds arrive when another user sends them.
    if (modal === "receive") {
      toast.info("Share your username so others can send you funds.");
      return;
    }

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (!recipient.trim()) { toast.error("Enter recipient username"); return; }

    // Balance check, recipient lookup and the paired debit/credit all happen
    // atomically server-side.
    const { data, error } = await supabase.rpc("wallet_send", {
      _recipient: recipient.trim(),
      _amount: amt,
    });
    if (error) { toast.error(error.message || "Transaction failed"); return; }
    const sent = Array.isArray(data) ? Number(data[0]?.transfer_amount ?? amt) : amt;
    toast.success(`Sent $${sent.toFixed(2)} to ${recipient.trim()}`);
    setModal(null); setAmount(""); setRecipient("");
    load();
  };

  const txIcon = (type: string) => {
    if (type === "send") return <ArrowUpRight className="w-4 h-4 text-red-400" />;
    if (type === "receive") return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
    return <Plus className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <CreditCard className="w-5 h-5 text-primary" />
          <span className="text-headline text-foreground text-base">Prime Wallet</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="liquid-glass-elevated rounded-3xl p-6 relative z-10">
          <div className="text-center mb-5">
            <p className="text-caption text-muted-foreground mb-1">Prime Balance</p>
            <p className="text-4xl text-display text-foreground">${balance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">{transactions.length} transactions · saved to your account</p>
          </div>
          <div className="flex justify-center gap-5">
            {[
              { icon: Plus, label: "Top Up", action: () => setModal("topup") },
              { icon: ArrowUpRight, label: "Send", action: () => setModal("send") },
              { icon: ArrowDownLeft, label: "Receive", action: () => setModal("receive") },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action} className="depth-press flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-caption text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="liquid-glass rounded-2xl relative z-10">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Transactions</span>
          </div>
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center">
              <WalletIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground">Top up to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {transactions.map(tx => (
                <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-xl liquid-glass-subtle flex items-center justify-center">{txIcon(tx.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">{tx.type === "topup" ? "Top Up" : tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.counterparty ? `${tx.type === "send" ? "To" : "From"}: ${tx.counterparty} · ` : ""}
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "send" ? "text-red-400" : "text-green-400"}`}>
                    {tx.type === "send" ? "-" : "+"}${Number(tx.amount).toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-xl flex items-end justify-center" onClick={() => setModal(null)}>
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="liquid-glass-elevated rounded-t-3xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center relative z-10">
                <h3 className="text-lg font-semibold text-foreground capitalize">{modal === "topup" ? "Top Up" : modal}</h3>
                <button onClick={() => setModal(null)} className="depth-press w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center"><X className="w-4 h-4 text-foreground" /></button>
              </div>
              {modal !== "topup" && (
                <div className="relative z-10">
                  <label className="text-caption text-muted-foreground block mb-1.5">{modal === "send" ? "Recipient" : "From"}</label>
                  <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Username" className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              )}
              <div className="relative z-10">
                <label className="text-caption text-muted-foreground block mb-1.5">Amount ($)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-2xl font-bold outline-none focus:ring-2 focus:ring-primary/30 text-center" />
              </div>
              <button onClick={handleSubmit} className="depth-press w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold relative z-10">
                {modal === "topup" ? "Add Funds" : modal === "send" ? "Send Money" : "Confirm"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <GlassTabBar />
    </div>
  );
};

export default WalletPage;
