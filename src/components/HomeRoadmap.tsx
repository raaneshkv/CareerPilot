import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  BookOpen,
  Code,
  Database,
  Globe,
  Layers,
  Rocket,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Youtube,
  FileText,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapStep {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  details: string;
  concepts: string[];
  resources: {
    youtube: { label: string; url: string }[];
    docs: { label: string; url: string }[];
    github: { label: string; url: string }[];
  };
}

const roadmapSteps: RoadmapStep[] = [
  {
    id: "fundamentals",
    icon: BookOpen,
    title: "Programming Fundamentals",
    description: "Master core programming concepts and problem-solving skills.",
    details:
      "Build a strong foundation in programming logic, data structures, and algorithms. This is the bedrock of every successful tech career.",
    concepts: ["Variables & Data Types", "Control Flow & Loops", "Functions & Scope", "Basic Data Structures", "Complexity Analysis"],
    resources: {
      youtube: [{ label: "CS50 – Harvard", url: "https://youtube.com/cs50" }],
      docs: [{ label: "MDN Web Docs", url: "https://developer.mozilla.org" }],
      github: [{ label: "Coding Interview University", url: "https://github.com/jwasham/coding-interview-university" }],
    },
  },
  {
    id: "frontend",
    icon: Globe,
    title: "Frontend Development",
    description: "Learn HTML, CSS, JavaScript, and modern UI frameworks.",
    details:
      "Create responsive, interactive user interfaces. Master a component-based framework and modern CSS techniques.",
    concepts: ["HTML5 Semantic Markup", "CSS Grid & Flexbox", "JavaScript ES6+", "React / Vue Basics", "Responsive Design"],
    resources: {
      youtube: [{ label: "Traversy Media", url: "https://youtube.com/traversymedia" }],
      docs: [{ label: "React Docs", url: "https://react.dev" }],
      github: [{ label: "30 Days of JavaScript", url: "https://github.com/Asabeneh/30-Days-Of-JavaScript" }],
    },
  },
  {
    id: "backend",
    icon: Database,
    title: "Backend & Databases",
    description: "Build APIs, manage data, and handle authentication.",
    details:
      "Design robust server-side architectures, work with SQL and NoSQL databases, and implement secure authentication flows.",
    concepts: ["REST API Design", "SQL & NoSQL Databases", "Authentication & JWT", "Server-side Frameworks", "Data Modeling"],
    resources: {
      youtube: [{ label: "The Net Ninja", url: "https://youtube.com/thenetninja" }],
      docs: [{ label: "Node.js Docs", url: "https://nodejs.org/docs" }],
      github: [{ label: "Realworld App", url: "https://github.com/gothinkster/realworld" }],
    },
  },
  {
    id: "tools",
    icon: Layers,
    title: "DevOps & Tools",
    description: "Version control, CI/CD, containerization, and cloud.",
    details:
      "Learn the tools and workflows that power modern software teams—from Git to Docker to cloud deployment.",
    concepts: ["Git & GitHub Workflow", "Docker Basics", "CI/CD Pipelines", "Cloud Platforms (AWS/GCP)", "Linux Command Line"],
    resources: {
      youtube: [{ label: "TechWorld with Nana", url: "https://youtube.com/techworld" }],
      docs: [{ label: "Docker Docs", url: "https://docs.docker.com" }],
      github: [{ label: "DevOps Exercises", url: "https://github.com/bregman-arie/devops-exercises" }],
    },
  },
  {
    id: "projects",
    icon: Code,
    title: "Build Real Projects",
    description: "Apply everything by building portfolio-worthy projects.",
    details:
      "Consolidate your skills by building end-to-end applications. Focus on solving real problems and writing clean, maintainable code.",
    concepts: ["Full-Stack Applications", "API Integration", "State Management", "Testing & Debugging", "Code Reviews"],
    resources: {
      youtube: [{ label: "JavaScript Mastery", url: "https://youtube.com/javascriptmastery" }],
      docs: [{ label: "Vercel Guides", url: "https://vercel.com/guides" }],
      github: [{ label: "Build Your Own X", url: "https://github.com/codecrafters-io/build-your-own-x" }],
    },
  },
  {
    id: "career",
    icon: Rocket,
    title: "Career & Interview Prep",
    description: "Resume, DSA practice, mock interviews, and placement prep.",
    details:
      "Polish your resume, practice data structures & algorithms, and prepare for behavioral and technical interviews.",
    concepts: ["Resume Optimization", "DSA Practice", "System Design Basics", "Behavioral Interview Prep", "Networking & Outreach"],
    resources: {
      youtube: [{ label: "NeetCode", url: "https://youtube.com/neetcode" }],
      docs: [{ label: "LeetCode", url: "https://leetcode.com" }],
      github: [{ label: "Tech Interview Handbook", url: "https://github.com/yangshun/tech-interview-handbook" }],
    },
  },
];

/* ---------- SVG Connector ---------- */
const AnimatedConnector = ({ inView }: { inView: boolean }) => (
  <svg width="2" height="48" className="mx-auto my-0" viewBox="0 0 2 48">
    <motion.line
      x1="1" y1="0" x2="1" y2="48"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeDasharray="48"
      initial={{ strokeDashoffset: 48 }}
      animate={inView ? { strokeDashoffset: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  </svg>
);

/* ---------- Progress Tracker ---------- */
const ProgressTracker = ({ completed, total }: { completed: number; total: number }) => {
  const pct = Math.round((completed / total) * 100);
  const r = 54;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r={r} fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (c * pct) / 100 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-display">
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-sm font-medium">{completed}/{total} completed</p>
        <p className="text-xs text-muted-foreground">Keep going — you're doing great!</p>
      </div>
    </div>
  );
};

/* ---------- Roadmap Card ---------- */
const RoadmapCard = ({
  step,
  index,
  isActive,
  isCompleted,
  onToggle,
  onComplete,
}: {
  step: RoadmapStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  onComplete: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref}>
      {index > 0 && <AnimatedConnector inView={inView} />}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        onClick={onToggle}
        className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300
          ${isActive ? "border-primary/50 shadow-xl shadow-primary/10" : "border-border/50 hover:border-primary/30"}
          ${isCompleted ? "bg-success/5 border-success/30" : ""}
          bg-card/80 backdrop-blur-xl
          hover:shadow-lg hover:-translate-y-0.5
        `}
      >
        {/* Gradient border glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-info/20 opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />

        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${isCompleted ? "bg-success/20" : "gradient-bg"}`}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <step.icon className="w-5 h-5 text-primary-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold font-display text-base">{step.title}</h3>
              <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-5 pt-5 border-t border-border/50 space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{step.details}</p>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Key Concepts</h4>
                  <ul className="grid gap-1.5">
                    {step.concepts.map((c, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Free Learning Resources</h4>

                  <div className="grid gap-2">
                    {step.resources.youtube.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                        <Youtube className="w-4 h-4 text-destructive shrink-0" />
                        <span className="group-hover:underline">{r.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                    {step.resources.docs.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                        <FileText className="w-4 h-4 text-info shrink-0" />
                        <span className="group-hover:underline">{r.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                    {step.resources.github.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                        <Github className="w-4 h-4 shrink-0" />
                        <span className="group-hover:underline">{r.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isCompleted ? "outline" : "default"}
                  className={isCompleted ? "border-success text-success" : "gradient-bg text-primary-foreground"}
                  onClick={(e) => { e.stopPropagation(); onComplete(); }}
                >
                  {isCompleted ? (
                    <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Completed</>
                  ) : (
                    "Mark as Completed"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* ---------- Main Roadmap ---------- */
const HomeRoadmap = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section ref={sectionRef} className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-accent text-accent-foreground mb-4">
            <Rocket className="w-4 h-4" />
            Career Roadmap
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display">
            Your Path to <span className="gradient-text">Placement Success</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Follow this step-by-step roadmap. Expand each block for details, resources, and track your progress.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="mb-8 glass-card p-5"
        >
          <ProgressTracker completed={completedIds.size} total={roadmapSteps.length} />
        </motion.div>

        <div>
          {roadmapSteps.map((step, i) => (
            <RoadmapCard
              key={step.id}
              step={step}
              index={i}
              isActive={activeId === step.id}
              isCompleted={completedIds.has(step.id)}
              onToggle={() => setActiveId(activeId === step.id ? null : step.id)}
              onComplete={() => toggleComplete(step.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeRoadmap;
