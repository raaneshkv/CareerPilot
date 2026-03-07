import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import InterviewSetup from "@/components/interview/InterviewSetup";
import InterviewSession from "@/components/interview/InterviewSession";
import InterviewResults from "@/components/interview/InterviewResults";
import InterviewHistory from "@/components/interview/InterviewHistory";

export interface InterviewQuestion {
  id: string;
  question: string;
  type: string;
  difficulty: string;
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

const MockInterview = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<"setup" | "session" | "results">("setup");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [role, setRole] = useState("");

  const handleStartInterview = async (selectedRole: string, skills: string[], resumeText: string) => {
    if (!user) return;
    setRole(selectedRole);

    try {
      // Create session
      const { data: session, error: sessionErr } = await supabase
        .from("interview_sessions")
        .insert({ user_id: user.id, role: selectedRole, skills })
        .select("id")
        .single();
      if (sessionErr) throw sessionErr;
      setSessionId(session.id);

      // Generate questions
      const { data, error } = await supabase.functions.invoke("generate-interview", {
        body: { role: selectedRole, skills, resumeText },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const generated = (data.questions as any[]).map((q, i) => ({
        ...q,
        id: `q-${i}`,
      }));

      // Save questions to DB
      const questionsToInsert = generated.map((q, i) => ({
        session_id: session.id,
        question: q.question,
        type: q.type,
        difficulty: q.difficulty,
        sort_order: i,
      }));
      const { data: savedQs, error: qErr } = await supabase
        .from("interview_questions")
        .insert(questionsToInsert)
        .select("id, question, type, difficulty, sort_order");
      if (qErr) throw qErr;

      const sorted = (savedQs || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
      setQuestions(sorted.map((q: any) => ({ id: q.id, question: q.question, type: q.type, difficulty: q.difficulty })));
      setStep("session");
    } catch (e: any) {
      toast.error(e.message || "Failed to start interview");
    }
  };

  const handleFinishInterview = async (results: AnswerResult[]) => {
    setAnswers(results);

    // Save answers to DB
    try {
      for (const r of results) {
        await supabase.from("interview_answers").insert({
          question_id: r.questionId,
          answer: r.answer,
          technical_score: r.technical_score,
          clarity_score: r.clarity_score,
          structure_score: r.structure_score,
          feedback: r.feedback,
          skipped: r.skipped,
        });
      }

      // Calculate overall score
      const scored = results.filter((r) => !r.skipped);
      const overall = scored.length > 0
        ? Math.round(
            scored.reduce((sum, r) => sum + ((r.technical_score + r.clarity_score + r.structure_score) / 3) * 10, 0) / scored.length
          )
        : 0;

      await supabase
        .from("interview_sessions")
        .update({ overall_score: overall, status: "completed" })
        .eq("id", sessionId);
    } catch (e: any) {
      console.error("Failed to save results:", e);
    }

    setStep("results");
  };

  const handleRetake = () => {
    setStep("setup");
    setSessionId(null);
    setQuestions([]);
    setAnswers([]);
    setRole("");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {step === "setup" && (
        <>
          <InterviewSetup onStart={handleStartInterview} />
          <InterviewHistory />
        </>
      )}
      {step === "session" && (
        <InterviewSession
          questions={questions}
          role={role}
          onFinish={handleFinishInterview}
        />
      )}
      {step === "results" && (
        <InterviewResults answers={answers} role={role} onRetake={handleRetake} />
      )}
    </div>
  );
};

export default MockInterview;
