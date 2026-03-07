import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Clock,
  Target,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineBlockData {
  level: string;
  tasks: string[];
}

interface SkillGap {
  skill: string;
  current: number;
  required: number;
}

interface TimelineBlockProps {
  phase: TimelineBlockData;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  onComplete: () => void;
  skillGaps?: SkillGap[];
  isLast: boolean;
}

const estimatedWeeks: Record<string, string> = {
  Beginner: "2–4 weeks",
  Intermediate: "4–6 weeks",
  Advanced: "6–10 weeks",
};

const phaseDescriptions: Record<string, string> = {
  Beginner: "Build a strong foundation with core concepts and fundamentals to get started confidently.",
  Intermediate: "Deepen your understanding with hands-on projects and more complex problem-solving.",
  Advanced: "Master advanced techniques, optimize your workflow, and prepare for senior-level roles.",
};

/* Vertical gradient connector */
const BlockConnector = ({ inView }: { inView: boolean }) => (
  <div className="flex justify-center py-0">
    <motion.div
      className="w-0.5 h-10 rounded-full"
      style={{ background: "linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--primary) / 0.2))" }}
      initial={{ scaleY: 0, originY: 0 }}
      animate={inView ? { scaleY: 1 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
  </div>
);

/* Inline progress bar */
const InlineProgress = ({ current, target }: { current: number; target: number }) => {
  const gap = Math.max(0, target - current);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Current {current}%</span>
        <span>Target {target}%</span>
      </div>
      <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/20"
          style={{ width: `${target}%` }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "var(--gradient-primary, hsl(var(--primary)))" }}
          initial={{ width: 0 }}
          animate={{ width: `${current}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-primary"
          style={{ left: `${target}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Gap: {gap}%</p>
    </div>
  );
};

const TimelineBlock = ({
  phase,
  index,
  isActive,
  isCompleted,
  onToggle,
  onComplete,
  skillGaps,
  isLast,
}: TimelineBlockProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const matchedGap = skillGaps?.find(
    (g) => phase.level.toLowerCase().includes(g.skill.toLowerCase()) || g.skill.toLowerCase().includes(phase.level.toLowerCase())
  );

  const currentVal = matchedGap?.current ?? (index === 0 ? 40 : index === 1 ? 25 : 15);
  const targetVal = matchedGap?.required ?? 80;
  const description = phaseDescriptions[phase.level] || "Progress through this phase to advance your career.";
  const duration = estimatedWeeks[phase.level] || "3–6 weeks";

  return (
    <div ref={ref}>
      {index > 0 && <BlockConnector inView={inView} />}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, delay: 0.05 }}
        onClick={onToggle}
        className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-300
          ${isActive ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border/50 hover:border-primary/30"}
          ${isCompleted ? "bg-success/5 border-success/30" : "bg-card/80 backdrop-blur-xl"}
          hover:shadow-md hover:-translate-y-0.5`}
      >
        {/* Header row */}
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300
            ${isCompleted ? "bg-success/20" : "gradient-bg"}`}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold font-display text-base">{phase.level}</h4>
              <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{description}</p>

            {/* Compact info row */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {duration}</span>
              <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Gap {Math.max(0, targetVal - currentVal)}%</span>
            </div>

            {/* Mini progress */}
            <div className="mt-2">
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: isCompleted ? "hsl(var(--success))" : "var(--gradient-primary, hsl(var(--primary)))" }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: isCompleted ? "100%" : `${currentVal}%` } : {}}
                  transition={{ duration: 0.7, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-5 pt-5 border-t border-border/50 space-y-4">
                {/* Skill gap bar */}
                <InlineProgress current={currentVal} target={targetVal} />

                {/* Tasks */}
                <div>
                  <h5 className="text-sm font-semibold mb-2">Key Tasks</h5>
                  <ul className="grid gap-1.5">
                    {phase.tasks.map((task, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Collapsible resources */}
                <CollapsibleResources level={phase.level} />

                {/* Mark complete */}
                <Button
                  size="sm"
                  variant={isCompleted ? "outline" : "default"}
                  className={isCompleted ? "border-success text-success" : "gradient-bg text-primary-foreground"}
                  onClick={(e) => { e.stopPropagation(); onComplete(); }}
                >
                  {isCompleted ? (
                    <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Completed</>
                  ) : (
                    "Mark as Complete"
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

/* Collapsible resources panel */
const CollapsibleResources = ({ level }: { level: string }) => {
  const [open, setOpen] = useState(false);

  const resourceMap: Record<string, { links: { label: string; url: string; icon: React.ElementType }[]; project: string; cert?: string }> = {
    Beginner: {
      links: [
        { label: "freeCodeCamp – Beginner Course", url: "https://www.freecodecamp.org/", icon: BookOpen },
        { label: "MDN Web Docs – Getting Started", url: "https://developer.mozilla.org/", icon: BookOpen },
      ],
      project: "Build a personal portfolio website",
      cert: "freeCodeCamp Responsive Web Design",
    },
    Intermediate: {
      links: [
        { label: "JavaScript.info – Modern Tutorial", url: "https://javascript.info/", icon: BookOpen },
        { label: "Fireship – Quick Tutorials (YouTube)", url: "https://www.youtube.com/@Fireship", icon: BookOpen },
      ],
      project: "Create a full-stack CRUD application",
    },
    Advanced: {
      links: [
        { label: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer", icon: BookOpen },
        { label: "Frontend Masters – Advanced Courses", url: "https://frontendmasters.com/", icon: BookOpen },
      ],
      project: "Contribute to an open-source project",
      cert: "AWS Cloud Practitioner or equivalent",
    },
  };

  const res = resourceMap[level] || resourceMap["Beginner"];

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-accent/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Resources
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {res.links.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <l.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="group-hover:underline">{l.label}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-medium text-foreground">Project:</span> {res.project}
              </p>
              {res.cert && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Certification:</span> {res.cert}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineBlock;
