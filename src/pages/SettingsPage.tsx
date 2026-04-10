import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Moon, Lock, Bell, HelpCircle, LogOut, ChevronRight, User, Shield, Palette, X, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Panel = null | "profile" | "notifications" | "privacy" | "security" | "appearance" | "darkmode" | "help";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("display_name, username, bio").eq("user_id", user.id).single();
    if (data) {
      setDisplayName(data.display_name || "");
      setUsername(data.username || "");
      setBio(data.bio || "");
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName, username, bio }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated!");
  };

  const sections = [
    { icon: User, label: "Edit Profile", desc: "Update your info", panel: "profile" as Panel, onOpen: loadProfile },
    { icon: Bell, label: "Notifications", desc: "Push & email alerts", panel: "notifications" as Panel },
    { icon: Lock, label: "Privacy", desc: "Account privacy settings", panel: "privacy" as Panel },
    { icon: Shield, label: "Security", desc: "Password & 2FA", panel: "security" as Panel },
    { icon: Palette, label: "Appearance", desc: "Theme & display", panel: "appearance" as Panel },
    { icon: Moon, label: "Dark Mode", desc: "Always on", panel: "darkmode" as Panel },
    { icon: HelpCircle, label: "Help & Support", desc: "FAQs and contact", panel: "help" as Panel },
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case "profile":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-caption text-muted-foreground block mb-1.5">Display Name</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm outline-none" />
            </div>
            <div>
              <label className="text-caption text-muted-foreground block mb-1.5">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm outline-none" />
            </div>
            <div>
              <label className="text-caption text-muted-foreground block mb-1.5">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm outline-none resize-none h-20" />
            </div>
            <button onClick={saveProfile} disabled={saving} className="depth-press w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-3">
            {["Push Notifications", "Email Notifications", "Like Alerts", "Comment Alerts", "Follow Alerts", "Message Alerts"].map(item => (
              <div key={item} className="liquid-glass rounded-2xl p-4 flex items-center justify-between relative z-10">
                <span className="text-sm text-foreground">{item}</span>
                <div className="w-11 h-6 rounded-full bg-primary/30 flex items-center px-0.5">
                  <div className="w-5 h-5 rounded-full bg-primary ml-auto" />
                </div>
              </div>
            ))}
          </div>
        );
      case "privacy":
        return (
          <div className="space-y-3">
            {["Private Account", "Show Activity Status", "Allow Tags from Everyone", "Allow Messages from Everyone"].map(item => (
              <div key={item} className="liquid-glass rounded-2xl p-4 flex items-center justify-between relative z-10">
                <span className="text-sm text-foreground">{item}</span>
                <div className="w-11 h-6 rounded-full bg-secondary flex items-center px-0.5">
                  <div className="w-5 h-5 rounded-full bg-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        );
      case "security":
        return (
          <div className="space-y-3">
            <div className="liquid-glass rounded-2xl p-4 relative z-10">
              <p className="text-sm font-semibold text-foreground mb-1">Change Password</p>
              <p className="text-caption text-muted-foreground">Update your password regularly for security</p>
            </div>
            <div className="liquid-glass rounded-2xl p-4 relative z-10">
              <p className="text-sm font-semibold text-foreground mb-1">Two-Factor Authentication</p>
              <p className="text-caption text-muted-foreground">Add extra security to your account</p>
            </div>
            <div className="liquid-glass rounded-2xl p-4 relative z-10">
              <p className="text-sm font-semibold text-foreground mb-1">Login Activity</p>
              <p className="text-caption text-muted-foreground">Review your recent login sessions</p>
            </div>
          </div>
        );
      case "appearance":
        return (
          <div className="space-y-3">
            <div className="liquid-glass rounded-2xl p-4 relative z-10">
              <p className="text-sm font-semibold text-foreground mb-2">App Theme</p>
              <div className="flex gap-2">
                <button className="depth-press flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Dark</button>
                <button className="depth-press flex-1 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium">Light</button>
                <button className="depth-press flex-1 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium">Auto</button>
              </div>
            </div>
            <div className="liquid-glass rounded-2xl p-4 flex items-center justify-between relative z-10">
              <span className="text-sm text-foreground">Reduce Animations</span>
              <div className="w-11 h-6 rounded-full bg-secondary flex items-center px-0.5">
                <div className="w-5 h-5 rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        );
      case "darkmode":
        return (
          <div className="space-y-3">
            <div className="liquid-glass rounded-2xl p-4 flex items-center gap-3 relative z-10">
              <Moon className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Dark Mode is Active</p>
                <p className="text-caption text-muted-foreground">Easier on the eyes in low light</p>
              </div>
              <div className="w-11 h-6 rounded-full bg-primary/30 flex items-center px-0.5">
                <div className="w-5 h-5 rounded-full bg-primary ml-auto" />
              </div>
            </div>
          </div>
        );
      case "help":
        return (
          <div className="space-y-3">
            {["FAQ", "Contact Support", "Report a Problem", "Terms of Service", "Privacy Policy", "About Primegram"].map(item => (
              <button key={item} className="depth-press liquid-glass rounded-2xl p-4 flex items-center justify-between w-full text-left relative z-10">
                <span className="text-sm text-foreground">{item}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => activePanel ? setActivePanel(null) : navigate(-1)} className="depth-press">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-headline text-foreground text-base">
            {activePanel ? sections.find(s => s.panel === activePanel)?.label || "Settings" : "Settings"}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activePanel ? (
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-4"
          >
            {renderPanel()}
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-2"
          >
            {sections.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setActivePanel(item.panel); item.onOpen?.(); }}
                className="depth-press liquid-glass rounded-2xl p-4 flex items-center gap-3 w-full text-left relative z-10"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-caption text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleSignOut}
              className="depth-press w-full mt-4 py-3 rounded-2xl liquid-glass text-destructive text-sm font-semibold flex items-center justify-center gap-2 relative z-10"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
