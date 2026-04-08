import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, SkipForward, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { InterviewQuestion, AnswerResult } from "@/pages/MockInterview";

const TIMER_SECONDS = 60;

const difficultyColors: Record<string, string> = {
  easy: "bg-success/15 text-success border-success/20",
  medium: "bg-warning/15 text-warning border-warning/20",
  hard: "bg-destructive/15 text-destructive border-destructive/20",
};

const typeColors: Record<string, string> = {
  technical: "bg-info/15 text-info border-info/20",
  behavioral: "bg-primary/15 text-primary border-primary/20",
  hr: "bg-accent text-accent-foreground border-border",
};

interface Props {
  questions: InterviewQuestion[];
  role: string;
  onFinish: (results: AnswerResult[]) => void;
}

const InterviewSession = ({ questions, role, onFinish }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<AnswerResult[]>([]);

  const current = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  // Timer
  useEffect(() => {
    setTimeLeft(TIMER_SECONDS);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const evaluateAndProceed = useCallback(async (skipped: boolean) => {
    if (evaluating) return;
    setEvaluating(true);

    let result: AnswerResult;

    if (skipped || !answer.trim()) {
      result = {
        questionId: current.id,
        answer: "",
        technical_score: 0,
        clarity_score: 0,
        structure_score: 0,
        feedback: "Question was skipped.",
        skipped: true,
      };
    } else {
      try {
        // Race between evaluation and a 30s client-side timeout
        const evaluationPromise = fetch("http://localhost:8000/interview/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: current.question, answer, questionType: current.type, role }),
        }).then(res => {
          if (!res.ok) throw new Error("Evaluation request failed");
          return res.json();
        });
        
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Evaluation timed out")), 30000)
        );

        const data = await Promise.race([evaluationPromise, timeoutPromise]);
        
        if (data.error) throw new Error(data.error);
        result = {
          questionId: current.id,
          answer,
          technical_score: data.technical_score ?? 5,
          clarity_score: data.clarity_score ?? 5,
          structure_score: data.structure_score ?? 5,
          feedback: data.feedback ?? "Evaluation completed.",
          skipped: false,
        };
      } catch (e: any) {
        console.error("Evaluation error:", e);
        toast.error("Evaluation error — default scores applied. Moving on.");
        result = {
          questionId: current.id,
          answer,
          technical_score: 5,
          clarity_score: 5,
          structure_score: 5,
          feedback: "Evaluation failed or timed out. Default scores were applied.",
          skipped: false,
        };
      }
    }

    const updatedResults = [...results, result];
    setResults(updatedResults);
    setAnswer("");
    setEvaluating(false);

    if (currentIndex + 1 >= questions.length) {
      onFinish(updatedResults);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [answer, current, currentIndex, evaluating, onFinish, questions.length, results, role]);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft <= 10 ? "text-destructive" : timeLeft <= 20 ? "text-warning" : "text-muted-foreground";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display">
          Mock Interview: <span className="gradient-text">{role}</span>
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <Progress value={progress} className="flex-1 h-2" />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="glass-card p-8 space-y-6"
        >
          {/* Badges */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[current.type] || ""}`}>
              {current.type}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${difficultyColors[current.difficulty] || ""}`}>
              {current.difficulty}
            </span>
          </div>

          {/* Question */}
          <p className="text-lg font-medium leading-relaxed">{current.question}</p>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${timerColor}`} />
            <span className={`text-sm font-mono font-medium ${timerColor}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: "100%" }}
                animate={{ width: `${timerPct}%` }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </div>
          </div>

          {/* Answer */}
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[140px] resize-none"
            disabled={evaluating}
          />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => evaluateAndProceed(false)}
              disabled={evaluating || !answer.trim()}
              className="gradient-bg text-primary-foreground flex-1"
            >
              {evaluating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Submit Answer</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => evaluateAndProceed(true)}
              disabled={evaluating}
            >
              <SkipForward className="w-4 h-4 mr-2" /> Skip
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default InterviewSession;
