import { motion } from "framer-motion";
import { ArrowLeft, Moon, Lock, Bell, HelpCircle, LogOut, ChevronRight, User, Shield, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const sections = [
  { icon: User, label: "Edit Profile", desc: "Update your info" },
  { icon: Bell, label: "Notifications", desc: "Push & email alerts" },
  { icon: Lock, label: "Privacy", desc: "Account privacy settings" },
  { icon: Shield, label: "Security", desc: "Password & 2FA" },
  { icon: Palette, label: "Appearance", desc: "Theme & display" },
  { icon: Moon, label: "Dark Mode", desc: "Always on" },
  { icon: HelpCircle, label: "Help & Support", desc: "FAQs and contact" },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-headline text-foreground text-base">Settings</span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {sections.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
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
      </div>
    </div>
  );
};

export default SettingsPage;
