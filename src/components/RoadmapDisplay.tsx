import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code,
  Briefcase,
  TrendingUp,
  Target,
  Download,
  GraduationCap,
  Zap,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import TimelineBlock from "./TimelineBlock";

interface RoadmapData {
  skills_to_learn: string[];
  recommended_projects: { title: string; description: string }[];
  career_roles: string[];
  timeline: { level: string; tasks: string[] }[];
  skill_gaps: { skill: string; current: number; required: number }[];
  learning_path: { step: number; title: string; description: string }[];
}

const RoadmapDisplay = ({ roadmap }: { roadmap: RoadmapData }) => {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());

  const toggleComplete = (index: number) => {
    setCompletedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleDownload = () => {
    const content = JSON.stringify(roadmap, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-roadmap.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  const levelIcons: Record<string, React.ReactNode> = {
    Beginner: <GraduationCap className="w-5 h-5" />,
    Intermediate: <Zap className="w-5 h-5" />,
    Advanced: <Star className="w-5 h-5" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-display gradient-text">Your Career Roadmap</h2>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" /> Download
        </Button>
      </div>

      {/* Skills to Learn */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="glass-card p-6">
        <h3 className="font-semibold font-display text-lg flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" /> Skills to Learn
        </h3>
        <div className="flex flex-wrap gap-2">
          {roadmap.skills_to_learn?.map((skill, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium bg-accent text-accent-foreground">
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Skill Gaps */}
      {roadmap.skill_gaps && roadmap.skill_gaps.length > 0 && (
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="glass-card p-6">
          <h3 className="font-semibold font-display text-lg flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-warning" /> Skill Gap Analysis
          </h3>
          <div className="space-y-4">
            {roadmap.skill_gaps.map((gap, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{gap.skill}</span>
                  <span className="text-muted-foreground">{gap.current}% → {gap.required}%</span>
                </div>
                <div className="relative">
                  <Progress value={gap.required} className="h-2 opacity-30" />
                  <Progress value={gap.current} className="h-2 absolute top-0 left-0 w-full" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Projects */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="glass-card p-6">
        <h3 className="font-semibold font-display text-lg flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-info" /> Recommended Projects
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {roadmap.recommended_projects?.map((project, i) => (
            <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
              <p className="font-medium text-sm">{project.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Career Roles */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="glass-card p-6">
        <h3 className="font-semibold font-display text-lg flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-success" /> Suitable Career Roles
        </h3>
        <div className="flex flex-wrap gap-2">
          {roadmap.career_roles?.map((role, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium bg-success/10 text-success border border-success/20">
              {role}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Timeline — Visual Block Roadmap */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="glass-card p-6">
        <h3 className="font-semibold font-display text-lg flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" /> Step-by-Step Roadmap
        </h3>
        <div className="max-w-xl mx-auto relative">
          {/* Continuous background line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary/30 via-primary/15 to-transparent pointer-events-none" />
          <div className="relative">
            {roadmap.timeline?.map((phase, i) => (
              <TimelineBlock
                key={i}
                phase={phase}
                index={i}
                isActive={activePhase === i}
                isCompleted={completedPhases.has(i)}
                onToggle={() => setActivePhase(activePhase === i ? null : i)}
                onComplete={() => toggleComplete(i)}
                skillGaps={roadmap.skill_gaps}
                isLast={i === (roadmap.timeline?.length ?? 0) - 1}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Learning Path */}
      {roadmap.learning_path && roadmap.learning_path.length > 0 && (
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="glass-card p-6">
          <h3 className="font-semibold font-display text-lg flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" /> Recommended Learning Path
          </h3>
          <div className="space-y-4">
            {roadmap.learning_path.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">{step.step}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RoadmapDisplay;
