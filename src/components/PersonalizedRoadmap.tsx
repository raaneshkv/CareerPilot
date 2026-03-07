import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Rocket, Download, Briefcase, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoadmapNode, { type RoadmapNodeData } from "./RoadmapNode";

interface RoadmapData {
  summary?: string;
  current_skills?: string[];
  career_roles?: string[];
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  const nodes = roadmap.nodes || [];
  const completedCount = nodes.filter((n) => n.status === "completed").length;

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
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
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

      {/* Current Skills */}
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
