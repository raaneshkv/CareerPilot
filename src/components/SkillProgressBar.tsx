import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SkillProgressBarProps {
  label: string;
  current: number;
  target: number;
}

const SkillProgressBar = ({ label, current, target }: SkillProgressBarProps) => {
  const [animatedCurrent, setAnimatedCurrent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedCurrent(current), 100);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {current}% → {target}%
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-secondary overflow-hidden">
        {/* Target level (faded) */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/20"
          style={{ width: `${target}%` }}
        />
        {/* Current level (animated) */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "var(--gradient-primary)" }}
          initial={{ width: 0 }}
          animate={{ width: `${animatedCurrent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
        {/* Target marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-primary"
          style={{ left: `${target}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Current</span>
        <span>Target</span>
      </div>
    </div>
  );
};

export default SkillProgressBar;
