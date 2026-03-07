import { motion } from "framer-motion";
import { Trophy, Target, MessageSquare, Layers, ThumbsUp, ThumbsDown, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AnswerResult } from "@/pages/MockInterview";

interface Props {
  answers: AnswerResult[];
  role: string;
  onRetake: () => void;
}

const InterviewResults = ({ answers, role, onRetake }: Props) => {
  const scored = answers.filter((a) => !a.skipped);
  const avgTechnical = scored.length ? Math.round(scored.reduce((s, a) => s + a.technical_score, 0) / scored.length * 10) : 0;
  const avgClarity = scored.length ? Math.round(scored.reduce((s, a) => s + a.clarity_score, 0) / scored.length * 10) : 0;
  const avgStructure = scored.length ? Math.round(scored.reduce((s, a) => s + a.structure_score, 0) / scored.length * 10) : 0;
  const overall = Math.round((avgTechnical + avgClarity + avgStructure) / 3);

  // Derive strengths/weaknesses from scores
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (avgTechnical >= 60) strengths.push("Strong technical depth");
  else weaknesses.push("Technical depth needs improvement");
  if (avgClarity >= 60) strengths.push("Clear communication");
  else weaknesses.push("Work on answer clarity");
  if (avgStructure >= 60) strengths.push("Well-structured responses");
  else weaknesses.push("Improve answer structure");
  if (scored.length === answers.length) strengths.push("Attempted all questions");
  if (answers.filter((a) => a.skipped).length > 2) weaknesses.push("Too many skipped questions");

  const suggestions = scored
    .filter((a) => a.feedback && a.feedback !== "Evaluation failed.")
    .map((a) => a.feedback)
    .slice(0, 4);

  const scoreColor = (v: number) =>
    v >= 70 ? "text-success" : v >= 40 ? "text-warning" : "text-destructive";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">
          Interview <span className="gradient-text">Results</span>
        </h1>
        <p className="text-muted-foreground mt-1">Your performance for {role}</p>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card-elevated p-8 text-center"
      >
        <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
        <p className={`text-6xl font-bold font-display ${scoreColor(overall)}`}>{overall}</p>
        <p className="text-sm text-muted-foreground mt-1">/ 100</p>
      </motion.div>

      {/* Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Technical Depth", value: avgTechnical, icon: Target },
          { label: "Clarity", value: avgClarity, icon: MessageSquare },
          { label: "Structure", value: avgStructure, icon: Layers },
        ].map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <p className={`text-2xl font-bold font-display ${scoreColor(value)}`}>{value}%</p>
            <Progress value={value} className="h-2 mt-2" />
          </motion.div>
        ))}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="font-semibold font-display flex items-center gap-2 mb-3">
            <ThumbsUp className="w-4 h-4 text-success" /> Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h3 className="font-semibold font-display flex items-center gap-2 mb-3">
            <ThumbsDown className="w-4 h-4 text-destructive" /> Weaknesses
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Improvement Suggestions */}
      {suggestions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="font-semibold font-display flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-warning" /> Improvement Suggestions
          </h3>
          <ul className="space-y-3">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                {s}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <Button onClick={onRetake} size="lg" className="gradient-bg text-primary-foreground">
        <RotateCcw className="w-4 h-4 mr-2" /> Retake Interview
      </Button>
    </motion.div>
  );
};

export default InterviewResults;
