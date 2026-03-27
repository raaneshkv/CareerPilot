import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, TrendingUp, FileText, BarChart3, Shield, Zap, BookOpen, Layers, Rocket, BrainCircuit, Eye, Map, Calculator } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-primary/30 scroll-smooth overflow-x-hidden relative">
      <PublicNavbar />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Deep Background Gradients */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[20%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-6xl mx-auto w-full flex flex-col items-center text-center"
        >
          {/* Main Headline */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full"
          >
            <h1 className="text-6xl md:text-[6rem] font-black font-display leading-[0.9] tracking-tighter mb-6 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">Hack Your<br/></span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-300% animate-[shine_6s_linear_infinite]">Career Matrix.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed mb-10"
          >
            Stop guessing your future. Upload your resume and let our AI engine generate your personalized, hyper-optimized roadmap to placement success. 
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Button size="lg" className="h-14 px-8 rounded-full bg-white text-black hover:bg-white/90 font-bold text-lg w-full sm:w-auto transition-transform hover:scale-105" asChild>
              <Link to="/auth?mode=signup">
                Start Free Analysis <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-white/10 bg-transparent text-white hover:bg-white/5 font-medium text-lg w-full sm:w-auto transition-all">
              Watch Demo
            </Button>
          </motion.div>

          {/* Social Proof Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mt-16 pt-8 border-t border-white/10 w-full max-w-3xl mx-auto"
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black font-display text-white">12,450+</span>
              <span className="text-xs text-white/40 uppercase tracking-widest font-semibold mt-2">Platform Views</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black font-display text-emerald-400">8,200+</span>
              <span className="text-xs text-white/40 uppercase tracking-widest font-semibold mt-2">Active Logins</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black font-display text-primary">94%</span>
              <span className="text-xs text-white/40 uppercase tracking-widest font-semibold mt-2">Placement Rate</span>
            </div>
          </motion.div>

          {/* Floating UI Mocks */}
          <div className="relative mt-20 w-full max-w-5xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden border border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl p-2 hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent z-10 pointer-events-none" />
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Preview" className="w-full h-full object-cover rounded-xl opacity-40 mix-blend-screen filter contrast-125" />
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1 }}
              className="absolute top-1/4 left-[10%] z-20 glass-card p-4 rounded-xl border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.3)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                  <span className="text-emerald-400 font-bold">94%</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Job Match Score</div>
                  <div className="text-xs text-emerald-400">Ready to apply</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-1/3 right-[10%] z-20 glass-card p-4 rounded-xl border border-white/10 shadow-[0_0_40px_rgba(236,72,153,0.3)]"
            >
               <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center border border-secondary/50">
                  <BrainCircuit className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">AI Mentor</div>
                  <div className="text-xs text-white/50">Analyzing trajectory...</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-6 relative border-t border-white/5 bg-[#030014]/50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4">An Unfair Advantage.</h2>
            <p className="text-xl text-white/50 max-w-2xl font-light">Eight distinct AI engines working together to craft, predict, and secure your optimal career trajectory.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: "Smart Resume Builder", desc: "Auto-tailor your resume to drastically increase your ATS pass rates." },
              { icon: Target, title: "RPG Skill Tracker", desc: "Level up like a game. Turn missing requirements into active quests." },
              { icon: TrendingUp, title: "Real-time Trends", desc: "See where the market is moving before the crowd does." },
              { icon: BrainCircuit, title: "AI Mentor", desc: "24/7 personal career guidance trained on elite tech profiles." },
              { icon: Eye, title: "Future Simulation", desc: "Predict salary and stability 10 years out based on current choices." },
              { icon: Map, title: "Career Discovery", desc: "Match your psychology directly to unconsidered career paths." },
              { icon: Calculator, title: "Financial Engine", desc: "Calculate the exact ROI of your next target role and plan transition affordabilities." }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/5 overflow-hidden hover:bg-white/[0.07] transition-colors"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <feat.icon className="w-8 h-8 text-primary mb-6" />
                <h3 className="text-xl font-bold font-display text-white mb-3">{feat.title}</h3>
                <p className="text-white/50 leading-relaxed font-light">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Extreme CTA */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030014] to-primary/10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black font-display mb-8 leading-tight">
            Stop Scrolling.<br/>Start Building.
          </h2>
          <Button size="lg" className="h-16 px-10 rounded-full bg-white text-black hover:bg-white/90 font-bold text-xl shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-transform hover:scale-105" asChild>
            <Link to="/auth?mode=signup">
              Deploy Your Career
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
};

export default Home;
