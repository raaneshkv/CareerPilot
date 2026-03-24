import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Compass, ArrowRight, Sparkles } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Force dark mode for aesthetics
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "signup");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome to the Matrix.");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Identity registered. Welcome aboard.");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#030014] selection:bg-primary/30 text-white relative overflow-hidden">
      
      {/* Universal Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-50">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Left panel - Visual Identity */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative p-12 z-10 border-r border-white/5 bg-white/[0.01] backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative text-center max-w-lg z-20"
        >
          <div className="absolute -inset-10 bg-gradient-to-tr from-primary/30 to-secondary/30 blur-3xl opacity-50 rounded-full" />
          <div className="relative glass-card p-12 rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.2)]">
            <Link to="/" className="block cursor-pointer group hover:scale-105 transition-transform duration-300">
              <Compass className="w-16 h-16 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(139,92,246,0.8)] group-hover:text-primary transition-colors duration-300" />
              <h1 className="text-5xl font-black font-display mb-6 tracking-tight">
                Hack Your <br/><span className="gradient-text bg-300% animate-[shine_6s_linear_infinite]">Career Matrix.</span>
              </h1>
            </Link>
            <p className="text-lg text-white/50 leading-relaxed font-light">
              Enter the platform that billionaires use to analyze, strategize, and execute career milestones with absolute AI precision.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm glass-card p-8 md:p-10 rounded-3xl"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-10 justify-center group cursor-pointer">
            <Compass className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            <span className="text-3xl font-black font-display tracking-tight text-white">CareerPilot</span>
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-display tracking-tight mb-2">
              {isLogin ? "Authenticate" : "Initialize Profile"}
            </h2>
            <p className="text-white/40 text-sm">
              {isLogin ? "Enter your credentials to access the terminal." : "Deploy a new instance of your career."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/70">Full Identifier</Label>
                <Input
                  id="name"
                  placeholder="John Wick"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white h-12 rounded-xl"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">Email Access</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">Passkey</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white h-12 rounded-xl tracking-widest"
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl gradient-bg text-white font-bold text-lg shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all uppercase tracking-wider mt-4" disabled={loading}>
              {loading ? (
                <>Processing <Sparkles className="w-4 h-4 ml-2 animate-pulse" /></>
              ) : (
                <>{isLogin ? "Execute Login" : "Initialize"} <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-white/40">
            {isLogin ? "No profile detected?" : "Already initialized?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:text-white transition-colors"
            >
              {isLogin ? "Initialize Here" : "Execute Login"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
