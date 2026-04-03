import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Route, 
  FileEdit, 
  Target, 
  Map, 
  LineChart, 
  Eye, 
  Mic, 
  MessageSquare,
  Calculator,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const features = [
  {
    title: "Career Roadmap",
    description: "Upload your resume to generate a personalized AI career technical syllabus and path.",
    icon: Route,
    url: "/roadmap",
    color: "from-blue-500 to-cyan-400",
    delay: 0.1,
  },
  {
    title: "Resume Builder",
    description: "Craft and export a beautiful, ATS-friendly resume with real keyword scoring.",
    icon: FileEdit,
    url: "/resume-builder",
    color: "from-purple-500 to-pink-500",
    delay: 0.15,
  },
  {
    title: "Skill Tracker",
    description: "Gamified RPG-style skill tracking with actionable resource quests.",
    icon: Target,
    url: "/skill-analyzer",
    color: "from-emerald-400 to-green-600",
    delay: 0.2,
  },
  {
    title: "Career Discovery",
    description: "Find your ideal tech roles based on 5-dimension personality analysis.",
    icon: Map,
    url: "/discovery",
    color: "from-orange-400 to-rose-500",
    delay: 0.25,
  },
  {
    title: "Mock Interview",
    description: "Practice role-specific questions with AI evaluating your answers instantly.",
    icon: Mic,
    url: "/mock-interview",
    color: "from-indigo-500 to-purple-600",
    delay: 0.3,
  },
  {
    title: "Market Trends",
    description: "Explore the latest tech job market trends and salary data in ₹ and $.",
    icon: LineChart,
    url: "/trends",
    color: "from-yellow-400 to-orange-500",
    delay: 0.35,
  },
  {
    title: "AI Mentor Chat",
    description: "Get personalized 1-on-1 career advice from an advanced AI mentor.",
    icon: MessageSquare,
    url: "/career-chat",
    color: "from-cyan-400 to-blue-600",
    delay: 0.4,
  },
  {
    title: "What-If Simulation",
    description: "Predict salary, stability, and effort for any career switch with data.",
    icon: Eye,
    url: "/simulation",
    color: "from-rose-400 to-red-600",
    delay: 0.45,
  },
  {
    title: "Financial Engine",
    description: "Quantify the ROI and break-even timelines of your next target role in ₹.",
    icon: Calculator,
    url: "/finance",
    color: "from-green-400 to-emerald-600",
    delay: 0.5,
  },
];

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const [roadmapResult, interviewResult] = await Promise.all([
        supabase.from("roadmaps").select("id", { count: "exact", head: true }),
        supabase.from("interview_sessions").select("id, overall_score", { count: "exact" }),
      ]);
      const roadmapCount = roadmapResult.count || 0;
      const interviewCount = interviewResult.count || 0;
      const interviews = interviewResult.data || [];
      const avgScore = interviews.length > 0
        ? Math.round(interviews.reduce((s: number, i: any) => s + (i.overall_score || 0), 0) / interviews.length)
        : 0;
      return { roadmapCount, interviewCount, avgScore };
    },
    enabled: !!user,
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display">
            Welcome back, <span className="gradient-text">{displayName}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            What would you like to focus on today?
          </p>
        </div>

        {stats && (stats.roadmapCount > 0 || stats.interviewCount > 0) && (
          <div className="flex items-center gap-4 bg-sidebar/60 border border-border p-3 px-5 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xl font-bold font-display gradient-text">{stats.roadmapCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Roadmaps</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold font-display gradient-text">{stats.interviewCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Interviews</p>
            </div>
            {stats.avgScore > 0 && (
              <>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-xl font-bold font-display text-emerald-500">{stats.avgScore}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Score</p>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Quick Action Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="glass-card-elevated p-6 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => navigate("/roadmap")}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold font-display text-lg">Quick Start: Upload Your Resume</p>
            <p className="text-sm text-muted-foreground">Generate a complete career roadmap with AI in under 30 seconds</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: feature.delay }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(feature.url)}
            className="group relative cursor-pointer glass-card p-6 overflow-hidden border-white/10 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] flex flex-col h-full"
          >
            {/* Background Glow Effect */}
            <div
              className={`absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br ${feature.color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
            />

            <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-inner`}>
              <feature.icon className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-semibold font-display mb-2 text-slate-100 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            
            <p className="text-muted-foreground leading-relaxed flex-grow">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
