import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Youtube,
  FileText,
  Github,
  BookOpen,
  Code,
  Database,
  Layers,
  Palette,
  BarChart3,
  Users,
  Terminal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SkillProgressBar from "./SkillProgressBar";

export interface RoadmapNodeData {
  id: string;
  title: string;
  description: string;
  currentLevel: number;
  targetLevel: number;
  status: "pending" | "completed";
  category: string;
  concepts: string[];
  resources: {
    youtube: { label: string; url: string }[];
    docs: { label: string; url: string }[];
    github: { label: string; url: string }[];
  };
}

const categoryIcons: Record<string, React.ElementType> = {
  frontend: Code,
  backend: Database,
  devops: Layers,
  softskills: Users,
  data: BarChart3,
  design: Palette,
};

/* SVG Connector */
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

interface RoadmapNodeProps {
  node: RoadmapNodeData;
  index: number;
  isActive: boolean;
  onToggle: () => void;
  onComplete: () => void;
}

const RoadmapNode = ({ node, index, isActive, onToggle, onComplete }: RoadmapNodeProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [initializing, setInitializing] = useState(false);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isCompleted = node.status === "completed";
  const Icon = categoryIcons[node.category] || BookOpen;

  // Determine if this node sounds like a project
  const isProject = node.title.toLowerCase().includes("project") || node.description.toLowerCase().includes("build");

  const handleInitWorkspace = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInitializing(true);

    // Simulate API call to initialize a GitHub repo or workspace
    setTimeout(() => {
      setInitializing(false);
      toast.success("Workspace initialized! Check your email for the GitHub repo link.", {
        icon: <Terminal className="w-4 h-4" />
      });
    }, 1500);
  };

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
          bg-card/80 backdrop-blur-xl hover:shadow-lg hover:-translate-y-0.5`}
      >
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-info/20 opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />

        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${isCompleted ? "bg-success/20" : "gradient-bg"}`}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Icon className="w-5 h-5 text-primary-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold font-display text-base">{node.title}</h3>
              <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{node.description}</p>

            {/* Mini progress indicator */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--gradient-primary)" }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${node.currentLevel}%` } : {}}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{node.currentLevel}%</span>
            </div>
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
                {/* Skill Gap */}
                <SkillProgressBar
                  label="Skill Proficiency"
                  current={node.currentLevel}
                  target={node.targetLevel}
                />

                {/* Why this matters */}
                <div className="p-3 rounded-lg bg-accent/50 border border-accent-foreground/10">
                  <p className="text-sm text-accent-foreground font-medium mb-1">Why this matters</p>
                  <p className="text-sm text-muted-foreground">{node.description}</p>
                </div>

                {/* Key Concepts */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Key Concepts</h4>
                  <ul className="grid gap-1.5">
                    {node.concepts?.map((c, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                {node.resources && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Free Learning Resources</h4>
                    <div className="grid gap-2">
                      {node.resources.youtube?.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                          <Youtube className="w-4 h-4 text-destructive shrink-0" />
                          <span className="group-hover:underline">{r.label}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                      {node.resources.docs?.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                          <FileText className="w-4 h-4 text-info shrink-0" />
                          <span className="group-hover:underline">{r.label}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                      {node.resources.github?.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                          <Github className="w-4 h-4 shrink-0" />
                          <span className="group-hover:underline">{r.label}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
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

                  {isProject && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleInitWorkspace}
                      disabled={initializing}
                      className="border border-primary/20 hover:border-primary/50 text-primary"
                    >
                      {initializing ? (
                        <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Initializing...</>
                      ) : (
                        <><Terminal className="w-4 h-4 mr-1.5" /> Initialize Workspace</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RoadmapNode;
