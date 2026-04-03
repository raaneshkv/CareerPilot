import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InterviewSetup from "@/components/interview/InterviewSetup";
import InterviewSession from "@/components/interview/InterviewSession";
import InterviewResults from "@/components/interview/InterviewResults";
import InterviewHistory from "@/components/interview/InterviewHistory";

export interface InterviewQuestion {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "hr";
  difficulty: "easy" | "medium" | "hard";
}

export interface AnswerResult {
  questionId: string;
  answer: string;
  technical_score: number;
  clarity_score: number;
  structure_score: number;
  feedback: string;
  skipped: boolean;
}

/* ===== Fallback Question Generator (when AI fails) ===== */
const FALLBACK_QUESTIONS: Record<string, InterviewQuestion[]> = {
  "Frontend Developer": [
    { id: "f1", question: "Explain the difference between virtual DOM and real DOM. How does React use the virtual DOM to optimize rendering?", type: "technical", difficulty: "medium" },
    { id: "f2", question: "Tell me about a time when you had to optimize the performance of a web application. What tools and techniques did you use?", type: "behavioral", difficulty: "medium" },
    { id: "f3", question: "What is your understanding of web accessibility (a11y)? How do you ensure your applications are accessible?", type: "technical", difficulty: "medium" },
    { id: "f4", question: "Describe a situation where you received critical feedback on your code during a code review. How did you handle it?", type: "behavioral", difficulty: "easy" },
    { id: "f5", question: "Explain the concept of closures in JavaScript with a practical example.", type: "technical", difficulty: "hard" },
    { id: "f6", question: "What are your salary expectations and what factors are important to you in choosing an employer?", type: "hr", difficulty: "easy" },
    { id: "f7", question: "How would you architect a complex form with dynamic validation, nested fields, and multi-step navigation?", type: "technical", difficulty: "hard" },
    { id: "f8", question: "Where do you see yourself in 3-5 years in terms of your frontend development career?", type: "hr", difficulty: "easy" },
  ],
  "Backend Developer": [
    { id: "b1", question: "How would you design a rate limiting system for an API? What data structures and algorithms would you use?", type: "technical", difficulty: "hard" },
    { id: "b2", question: "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?", type: "technical", difficulty: "medium" },
    { id: "b3", question: "Tell me about a production incident you handled. What was the root cause and how did you prevent it from recurring?", type: "behavioral", difficulty: "medium" },
    { id: "b4", question: "What is database indexing? How do you decide which columns to index?", type: "technical", difficulty: "medium" },
    { id: "b5", question: "Describe your approach to writing clean, maintainable code. Give specific examples.", type: "behavioral", difficulty: "easy" },
    { id: "b6", question: "How do you handle authentication and authorization in a microservices architecture?", type: "technical", difficulty: "hard" },
    { id: "b7", question: "Why are you looking to leave your current position?", type: "hr", difficulty: "easy" },
    { id: "b8", question: "Explain the concept of eventual consistency in distributed systems.", type: "technical", difficulty: "hard" },
  ],
  "default": [
    { id: "d1", question: "Walk me through the most complex technical project you've worked on. What was your specific contribution?", type: "technical", difficulty: "medium" },
    { id: "d2", question: "How do you stay updated with the latest technologies and industry trends?", type: "behavioral", difficulty: "easy" },
    { id: "d3", question: "Describe a time when you had to learn a completely new technology in a short time. How did you approach it?", type: "behavioral", difficulty: "medium" },
    { id: "d4", question: "What is your approach to debugging a performance issue in a production application?", type: "technical", difficulty: "medium" },
    { id: "d5", question: "Tell me about a time you disagreed with a team member on a technical decision. How was it resolved?", type: "behavioral", difficulty: "medium" },
    { id: "d6", question: "Explain the SOLID principles and how you apply them in your daily work.", type: "technical", difficulty: "hard" },
    { id: "d7", question: "What motivates you in your career and what kind of work environment do you thrive in?", type: "hr", difficulty: "easy" },
    { id: "d8", question: "Design a simple URL shortening service. What components would you need and how would they interact?", type: "technical", difficulty: "hard" },
  ],
};

function getFallbackQuestions(role: string): InterviewQuestion[] {
  return FALLBACK_QUESTIONS[role] || FALLBACK_QUESTIONS["default"];
}

export default function MockInterview() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<"setup" | "session" | "results">("setup");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [role, setRole] = useState("");
  const [answers, setAnswers] = useState<AnswerResult[]>([]);

  const handleStart = useCallback(async (selectedRole: string, skills: string[], resumeText: string) => {
    setRole(selectedRole);

    try {
      const { data, error } = await supabase.functions.invoke("generate-interview", {
        body: { role: selectedRole, skills, resumeText },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (!data?.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions generated");
      }

      const qs: InterviewQuestion[] = data.questions.map((q: any, i: number) => ({
        id: `q-${i + 1}`,
        question: q.question,
        type: q.type || "technical",
        difficulty: q.difficulty || "medium",
      }));

      setQuestions(qs);
      setPhase("session");
      toast.success(`${qs.length} AI-generated questions ready!`);
    } catch (err: any) {
      console.warn("AI interview generation failed, using fallback:", err.message);
      toast.info("Using curated interview questions for this session.", {
        description: "AI generation was unavailable."
      });
      
      const fallback = getFallbackQuestions(selectedRole);
      setQuestions(fallback);
      setPhase("session");
    }
  }, []);

  const handleFinish = useCallback(async (results: AnswerResult[]) => {
    setAnswers(results);
    setPhase("results");

    // Save to DB
    if (user) {
      try {
        const scored = results.filter(a => !a.skipped);
        const avgTech = scored.length ? Math.round(scored.reduce((s, a) => s + a.technical_score, 0) / scored.length * 10) : 0;
        const avgClarity = scored.length ? Math.round(scored.reduce((s, a) => s + a.clarity_score, 0) / scored.length * 10) : 0;
        const avgStructure = scored.length ? Math.round(scored.reduce((s, a) => s + a.structure_score, 0) / scored.length * 10) : 0;
        const overall = Math.round((avgTech + avgClarity + avgStructure) / 3);

        await supabase.from("interview_sessions").insert({
          user_id: user.id,
          role,
          questions: questions as any,
          answers: results as any,
          overall_score: overall,
          status: "completed",
        });
      } catch (e) {
        console.error("Failed to save interview:", e);
      }
    }
  }, [user, role, questions]);

  const handleRetake = useCallback(() => {
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setRole("");
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {phase === "setup" && (
        <>
          <InterviewSetup onStart={handleStart} />
          <InterviewHistory />
        </>
      )}
      {phase === "session" && (
        <InterviewSession questions={questions} role={role} onFinish={handleFinish} />
      )}
      {phase === "results" && (
        <InterviewResults answers={answers} role={role} onRetake={handleRetake} />
      )}
    </div>
  );
}
