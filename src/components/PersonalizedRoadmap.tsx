import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Rocket, Download, Briefcase, Zap, Share2, BarChart3, Terminal, Code, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RoadmapNode, { type RoadmapNodeData } from "./RoadmapNode";
import { SkillRadarChart } from "./SkillRadarChart";
import { JobMatchList } from "./JobMatchList";

interface RoadmapData {
  summary?: string;
  current_skills?: string[];
  career_roles?: string[];
  skill_gaps?: { skill: string; current: number; required: number }[];
  nodes: RoadmapNodeData[];
}

/* ---------- Circular Progress ---------- */
const ProgressTracker = ({ completed, total }: { completed: number; total: number }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
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
        <p className="text-xs text-muted-foreground">
          {pct === 100 ? "🎉 All done!" : "Keep going — you're doing great!"}
        </p>
      </div>
    </div>
  );
};

interface PersonalizedRoadmapProps {
  roadmap: RoadmapData;
  onUpdateNodes: (nodes: RoadmapNodeData[]) => void;
}

const PersonalizedRoadmap = ({ roadmap, onUpdateNodes }: PersonalizedRoadmapProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initializingProject, setInitializingProject] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  const nodes = roadmap.nodes || [];
  const completedCount = nodes.filter((n) => n.status === "completed").length;

  // Ensure default mock projects exist if AI didn't provide them
  const projects = (roadmap as any).recommended_projects || [
    { title: "Full-Stack Job Board", description: "Build a job board utilizing React, Node.js, and Supabase to prove full-stack capabilities." },
    { title: "AI Resume Analyzer", description: "An open-source resume parsing tool utilizing the OpenAI API to analyze resumes." }
  ];

  const handleInitWorkspace = (index: number) => {
    setInitializingProject(index);
    setTimeout(() => {
      setInitializingProject(null);
      toast.success("Workspace initialized! Check your email for the GitHub repo link.", {
        icon: <Terminal className="w-4 h-4" />
      });
    }, 1500);
  };

  const toggleComplete = (id: string) => {
    const updated = nodes.map((n) =>
      n.id === id ? { ...n, status: n.status === "completed" ? "pending" as const : "completed" as const } : n
    );
    onUpdateNodes(updated);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-roadmap.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    // Mock sharing functionality for hackathon
    const mockUrl = `https://careerpilot.app/roadmap/${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(mockUrl);
    toast.success("Roadmap link copied to clipboard!");
  };

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold font-display gradient-text flex items-center gap-2">
            <Rocket className="w-6 h-6" /> Your AI Roadmap
          </h2>
          {roadmap.summary && (
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">{roadmap.summary}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </motion.div>

      {/* Career Roles */}
      {roadmap.career_roles && roadmap.career_roles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold font-display text-sm flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-success" /> Recommended Roles
          </h3>
          <div className="flex flex-wrap gap-2">
            {roadmap.career_roles.map((role, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                {role}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Jobs */}
      {roadmap.career_roles && roadmap.career_roles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="mt-6"
        >
          <JobMatchList roles={roadmap.career_roles} />
        </motion.div>
      )}

      {/* Recommended Projects (Proof of Work) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.13 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2">
            <Code className="w-4 h-4 text-info" /> Recommended Projects (Proof of Work)
          </h3>
          <span className="text-xs text-info bg-info/10 border border-info/20 px-2 py-1 rounded-full px-2">
            Build these to stand out
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project: any, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors flex flex-col justify-between h-full gap-4">
              <div>
                <p className="font-bold text-sm mb-1">{project.title}</p>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInitWorkspace(i)}
                disabled={initializingProject === i}
                className="w-full bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary"
              >
                {initializingProject === i ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Initializing...</>
                ) : (
                  <><Terminal className="w-4 h-4 mr-2" /> Initialize Workspace</>
                )}
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Current Skills & Radar Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        {roadmap.current_skills && roadmap.current_skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold font-display text-sm flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" /> Skills Detected
            </h3>
            <div className="flex flex-wrap gap-2">
              {roadmap.current_skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Radar Chart (Mocked if empty) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold font-display text-sm flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" /> Skill Gap Analysis
          </h3>
          <SkillRadarChart
            data={roadmap.skill_gaps || [
              { skill: "JavaScript", current: 80, required: 90 },
              { skill: "React", current: 60, required: 85 },
              { skill: "Node.js", current: 30, required: 70 },
              { skill: "System Design", current: 10, required: 50 },
            ]}
          />
        </motion.div>
      </div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card p-5"
      >
        <ProgressTracker completed={completedCount} total={nodes.length} />
      </motion.div>

      {/* Roadmap Nodes */}
      <div className="max-w-2xl mx-auto">
        {nodes.map((node, i) => (
          <RoadmapNode
            key={node.id}
            node={node}
            index={i}
            isActive={activeId === node.id}
            onToggle={() => setActiveId(activeId === node.id ? null : node.id)}
            onComplete={() => toggleComplete(node.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRoadmap;
