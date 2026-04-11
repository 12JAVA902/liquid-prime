import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Phone } from "lucide-react";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to verify.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async () => {
    if (!phone) { toast.error("Enter phone number"); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          phone,
          password: password || undefined,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
      }
      setOtpSent(true);
      toast.success("OTP sent to your phone!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: isSignUp ? "sms" : "sms",
      });
      if (error) throw error;
      toast.success("Verified!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) { toast.error("Google sign-in failed"); return; }
      if (result.redirected) return;
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(210,100%,60%), transparent)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(280,70%,55%), transparent)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl liquid-glass flex items-center justify-center">
              <span className="text-xl font-bold text-primary relative z-10">P</span>
            </div>
            <h1 className="text-2xl text-display text-foreground">Primegram</h1>
          </div>
          <p className="text-sm text-muted-foreground">{isSignUp ? "Create your account" : "Welcome back"}</p>
        </div>

        <div className="liquid-glass rounded-3xl p-6 space-y-4">
          {/* Google */}
          <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="depth-press w-full py-3 rounded-2xl liquid-glass-subtle text-foreground text-sm font-semibold flex items-center justify-center gap-2 relative z-10">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 relative z-10">
            <div className="flex-1 h-px bg-border" />
            <span className="text-caption text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Auth method toggle */}
          <div className="flex gap-2 relative z-10">
            <button type="button" onClick={() => { setAuthMethod("email"); setOtpSent(false); }} className={`depth-press flex-1 py-2 rounded-xl text-sm font-medium ${authMethod === "email" ? "bg-primary text-primary-foreground" : "liquid-glass-subtle text-foreground"}`}>
              Email
            </button>
            <button type="button" onClick={() => { setAuthMethod("phone"); setOtpSent(false); }} className={`depth-press flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 ${authMethod === "phone" ? "bg-primary text-primary-foreground" : "liquid-glass-subtle text-foreground"}`}>
              <Phone className="w-3 h-3" /> Phone
            </button>
          </div>

          {authMethod === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <label className="text-caption text-muted-foreground block mb-1.5">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="Your name" required={isSignUp} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div>
                <label className="text-caption text-muted-foreground block mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="text-caption text-muted-foreground block mb-1.5">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="••••••••" required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="depth-press w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                {loading ? "..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {isSignUp && !otpSent && (
                <div>
                  <label className="text-caption text-muted-foreground block mb-1.5">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="Your name" />
                </div>
              )}
              <div>
                <label className="text-caption text-muted-foreground block mb-1.5">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="+1234567890" />
              </div>
              {isSignUp && !otpSent && (
                <div>
                  <label className="text-caption text-muted-foreground block mb-1.5">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="••••••••" minLength={6} />
                </div>
              )}
              {otpSent && (
                <div>
                  <label className="text-caption text-muted-foreground block mb-1.5">Verification Code</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-secondary/50 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="123456" maxLength={6} />
                </div>
              )}
              <button type="button" onClick={otpSent ? handlePhoneVerify : handlePhoneSendOtp} disabled={loading} className="depth-press w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                {loading ? "..." : otpSent ? "Verify OTP" : "Send OTP"}
              </button>
            </div>
          )}

          <div className="relative z-10 text-center">
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setOtpSent(false); }} className="text-sm text-primary hover:underline">
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
