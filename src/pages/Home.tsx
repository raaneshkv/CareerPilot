import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, TrendingUp, FileText, BarChart3, BrainCircuit, Eye, Map, Calculator, Rocket, ChevronDown, Zap, Shield, Users } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

/* Animated counter that counts up */
const AnimatedCounter = ({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

/* Floating orb component */
const FloatingOrb = ({ size, color, delay, duration, x, y }: { size: number; color: string; delay: number; duration: number; x: string; y: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, background: color, filter: `blur(${size * 0.6}px)` }}
    animate={{
      y: [0, -30, 0, 20, 0],
      x: [0, 15, -10, 5, 0],
      scale: [1, 1.1, 0.95, 1.05, 1],
      opacity: [0.3, 0.5, 0.3, 0.45, 0.3],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const stats = [
    { label: "Career Paths Mapped", value: 2500, suffix: "+" },
    { label: "Skills Tracked", value: 180, suffix: "+" },
    { label: "AI Accuracy", value: 96, suffix: "%" },
    { label: "Resumes Optimized", value: 1200, suffix: "+" },
  ];

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-primary/30 scroll-smooth overflow-x-hidden relative">
      <PublicNavbar />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Animated Orbs */}
        <FloatingOrb size={400} color="hsl(260 100% 65% / 0.15)" delay={0} duration={12} x="10%" y="15%" />
        <FloatingOrb size={300} color="hsl(300 100% 60% / 0.1)" delay={2} duration={15} x="70%" y="60%" />
        <FloatingOrb size={200} color="hsl(217 91% 60% / 0.08)" delay={4} duration={10} x="50%" y="30%" />
        <FloatingOrb size={150} color="hsl(152 70% 45% / 0.08)" delay={1} duration={14} x="85%" y="20%" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-6xl mx-auto w-full flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/70 font-medium">AI-Powered Career Intelligence Platform</span>
          </motion.div>

          {/* Main Headline */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full"
          >
            <h1 className="text-6xl md:text-[6rem] font-black font-display leading-[0.9] tracking-tighter mb-6 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">Hack Your<br/></span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-[shine_6s_linear_infinite]">Career Matrix.</span>
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
            <Button size="lg" className="h-14 px-8 rounded-full bg-white text-black hover:bg-white/90 font-bold text-lg w-full sm:w-auto transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]" asChild>
              <Link to="/auth?mode=signup">
                Start Free Analysis <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 rounded-full border-white/10 bg-transparent text-white hover:bg-white/5 font-medium text-lg w-full sm:w-auto transition-all"
              onClick={scrollToFeatures}
            >
              Explore Features <ChevronDown className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm"
              >
                <div className="text-2xl md:text-3xl font-black font-display gradient-text">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/40 mt-1 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating UI Mocks */}
          <div className="relative mt-16 w-full max-w-5xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden border border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl p-2 hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent z-10 pointer-events-none" />
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Preview" className="w-full h-full object-cover rounded-xl opacity-40 mix-blend-screen filter contrast-125" />
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1 }}
              className="absolute top-1/4 left-[10%] z-20 glass-card p-4 rounded-xl border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.3)] float-animation"
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
              className="absolute bottom-1/3 right-[10%] z-20 glass-card p-4 rounded-xl border border-white/10 shadow-[0_0_40px_rgba(236,72,153,0.3)] float-animation-delay"
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

            <motion.div 
              initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 1 }}
              className="absolute top-[60%] left-[25%] z-20 glass-card p-3 rounded-xl border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.2)] float-animation-slow"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-white/70">3 skills to level up</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 z-10 cursor-pointer"
          onClick={scrollToFeatures}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section ref={featuresRef} className="py-32 px-6 relative border-t border-white/5 bg-[#030014]/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4">An Unfair Advantage.</h2>
            <p className="text-xl text-white/50 max-w-2xl font-light">Nine distinct AI engines working together to craft, predict, and secure your optimal career trajectory.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: "Smart Resume Builder", desc: "Auto-tailor your resume to drastically increase your ATS pass rates.", color: "from-violet-500/20 to-purple-500/20" },
              { icon: Target, title: "RPG Skill Tracker", desc: "Level up like a game. Turn missing requirements into active quests.", color: "from-emerald-500/20 to-green-500/20" },
              { icon: TrendingUp, title: "Real-time Trends", desc: "See where the market is moving before the crowd does.", color: "from-orange-500/20 to-amber-500/20" },
              { icon: BrainCircuit, title: "AI Mentor", desc: "24/7 personal career guidance powered by advanced AI models.", color: "from-blue-500/20 to-cyan-500/20" },
              { icon: Eye, title: "Future Simulation", desc: "Predict salary and stability 10 years out based on current choices.", color: "from-rose-500/20 to-pink-500/20" },
              { icon: Map, title: "Career Discovery", desc: "Match your psychology directly to unconsidered career paths.", color: "from-indigo-500/20 to-violet-500/20" },
              { icon: Calculator, title: "Financial Engine", desc: "Calculate the exact ROI of your next target role in ₹.", color: "from-teal-500/20 to-emerald-500/20" },
              { icon: Shield, title: "Mock Interview", desc: "Practice with AI-generated questions and get instant feedback.", color: "from-amber-500/20 to-yellow-500/20" },
              { icon: Rocket, title: "Career Roadmap", desc: "AI generates a step-by-step study plan from your resume.", color: "from-fuchsia-500/20 to-pink-500/20" },
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -5 }}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/5 overflow-hidden hover:bg-white/[0.07] transition-colors"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <feat.icon className="w-8 h-8 text-primary mb-6" />
                  <h3 className="text-xl font-bold font-display text-white mb-3">{feat.title}</h3>
                  <p className="text-white/50 leading-relaxed font-light">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 px-6 relative overflow-hidden border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-3xl font-black font-display text-white"><AnimatedCounter target={5000} suffix="+" /></p>
              <p className="text-sm text-white/40 mt-1">Active Users</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <BarChart3 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-3xl font-black font-display text-white"><AnimatedCounter target={92} suffix="%" /></p>
              <p className="text-sm text-white/40 mt-1">Placement Rate</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <p className="text-3xl font-black font-display text-white"><AnimatedCounter target={4.8} suffix="/5" /></p>
              <p className="text-sm text-white/40 mt-1">User Rating</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Extreme CTA */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030014] to-primary/10" />
        <FloatingOrb size={300} color="hsl(260 100% 65% / 0.1)" delay={0} duration={10} x="20%" y="20%" />
        <FloatingOrb size={200} color="hsl(300 100% 60% / 0.08)" delay={3} duration={12} x="70%" y="50%" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-black font-display mb-8 leading-tight">
              Stop Scrolling.<br/>Start Building.
            </h2>
            <Button size="lg" className="h-16 px-10 rounded-full bg-white text-black hover:bg-white/90 font-bold text-xl shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-transform hover:scale-105" asChild>
              <Link to="/auth?mode=signup">
                Deploy Your Career
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
