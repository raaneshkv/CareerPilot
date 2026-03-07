import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, TrendingUp, FileText, CheckCircle2, BarChart3, Layers, Shield, Zap, BookOpen } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import TypingText from "@/components/TypingText";
import FloatingShapes from "@/components/FloatingShapes";
import HomeRoadmap from "@/components/HomeRoadmap";
import { useAuth } from "@/hooks/useAuth";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const ctaLink = user ? "/dashboard" : "/auth?mode=signup";

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <PublicNavbar />

      {/* Hero */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-6 overflow-hidden min-h-[90vh] flex items-center">
        <FloatingShapes />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 via-info/5 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-5xl mx-auto text-center w-full"
        >
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-accent text-accent-foreground mb-8 shadow-sm">
                <Sparkles className="w-4 h-4" />
                AI-Powered Career Intelligence
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-bold font-display leading-tight tracking-tight"
            >
              Know Your{" "}
              <span className="gradient-text">Placement Readiness</span>
            </motion.h1>

            <motion.div
              variants={fadeUp}
              className="mt-4 text-lg md:text-xl font-medium text-foreground/80"
            >
              <TypingText
                texts={[
                  "Stop guessing. Start preparing strategically.",
                  "Discover skill gaps with AI-driven analysis",
                  "Get a personalized career roadmap instantly",
                  "Land your dream role with confidence",
                ]}
                className="text-foreground/80 font-medium"
              />
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              CareerPilot analyzes your resume against real job market expectations and generates a personalized roadmap — highlighting skill gaps, recommended projects, certifications, and a structured timeline to reach 80%+ placement readiness.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="gradient-bg text-primary-foreground px-8 text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 animate-pulse-glow"
                asChild
              >
                <Link to={ctaLink}>
                  Analyze My Resume
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 text-base hover:scale-105 transition-all duration-300 border-border/80"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                See How It Works
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              {[
                { icon: Shield, text: "Built for College Placements" },
                { icon: Zap, text: "AI-Powered Analysis" },
                { icon: Layers, text: "Structured Roadmap" },
              ].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-28 grid md:grid-cols-3 gap-6 text-left"
          >
            {[
              {
                icon: FileText,
                title: "Resume Analysis",
                desc: "Upload your PDF or DOCX resume and let AI benchmark your profile against real industry expectations.",
              },
              {
                icon: Target,
                title: "Skill Gap Detection",
                desc: "Identify exactly which skills you're missing with measurable readiness scores and priority rankings.",
              },
              {
                icon: TrendingUp,
                title: "Career Roadmap",
                desc: "Get a structured Beginner → Intermediate → Advanced timeline with projects, certifications, and milestones.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group"
              >
                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow duration-300">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold font-display text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-accent text-accent-foreground mb-4">
              <BookOpen className="w-4 h-4" />
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-display">
              How <span className="gradient-text">CareerPilot</span> Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Resume",
                desc: "Drop your PDF or DOCX file. Our AI extracts skills, experience, and education data in seconds.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Get AI Analysis",
                desc: "We benchmark your profile against industry standards and compute a placement readiness score.",
                icon: BarChart3,
              },
              {
                step: "03",
                title: "Follow Your Roadmap",
                desc: "Receive a prioritized action plan — skill gaps to close, projects to build, and certifications to earn.",
                icon: CheckCircle2,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative glass-card p-8 group hover:border-primary/30 transition-all duration-300"
              >
                <span className="text-5xl font-bold font-display text-primary/10 absolute top-4 right-6 group-hover:text-primary/20 transition-colors duration-300">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold font-display text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Roadmap Section */}
      <HomeRoadmap />

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center glass-card-elevated p-12 md:p-16 relative overflow-hidden"
        >
          <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-transparent to-info/20 rounded-xl blur-xl -z-10" />
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Ready to <span className="gradient-text">Accelerate</span> Your Career?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
            Join thousands of students who've mapped their path to placement success with data-driven, AI-powered career analysis.
          </p>
          <Button
            size="lg"
            className="gradient-bg text-primary-foreground px-10 text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link to={ctaLink}>
              Start My Analysis <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-display font-semibold text-foreground">CareerPilot</span>
          <span>© {new Date().getFullYear()} CareerPilot. AI-Powered Career Intelligence.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
