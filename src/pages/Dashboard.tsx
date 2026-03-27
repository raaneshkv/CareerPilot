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
  MessageSquare 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
    description: "Craft and export a beautiful, ATS-friendly resume to land your next job.",
    icon: FileEdit,
    url: "/resume-builder",
    color: "from-purple-500 to-pink-500",
    delay: 0.15,
  },
  {
    title: "Skill Analyzer",
    description: "Gamified RPG-style skill tracking with actionable resource quests.",
    icon: Target,
    url: "/skill-analyzer",
    color: "from-emerald-400 to-green-600",
    delay: 0.2,
  },
  {
    title: "Career Discovery",
    description: "Find your ideal tech roles based on your work traits and active dealbreakers.",
    icon: Map,
    url: "/discovery",
    color: "from-orange-400 to-rose-500",
    delay: 0.25,
  },
  {
    title: "Mock Interview",
    description: "Practice real-world scenario questions with AI evaluating your answers instantly.",
    icon: Mic,
    url: "/mock-interview",
    color: "from-indigo-500 to-purple-600",
    delay: 0.3,
  },
  {
    title: "Market Trends",
    description: "Explore the latest tech job market trends and salary expectations.",
    icon: LineChart,
    url: "/trends",
    color: "from-yellow-400 to-orange-500",
    delay: 0.35,
  },
  {
    title: "AI Mentor Chat",
    description: "Get personalized 1-on-1 career advice from a specialized AI mentor coach.",
    icon: MessageSquare,
    url: "/career-chat",
    color: "from-cyan-400 to-blue-600",
    delay: 0.4,
  },
  {
    title: "Workplace Simulation",
    description: "Experience dynamic workplace scenarios and learn how to navigate them smoothly.",
    icon: Eye,
    url: "/simulation",
    color: "from-rose-400 to-red-600",
    delay: 0.45,
  },
];

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold font-display">
          Welcome back, <span className="gradient-text">{displayName}</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          What would you like to focus on today?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: feature.delay }}
            whileHover={{ scale: 1.02 }}
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
