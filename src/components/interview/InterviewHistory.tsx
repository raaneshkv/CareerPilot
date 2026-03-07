import { motion } from "framer-motion";
import { History, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const InterviewHistory = () => {
  const { user } = useAuth();

  const { data: sessions } = useQuery({
    queryKey: ["interview-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!sessions || sessions.length === 0) return null;

  const scoreColor = (v: number | null) =>
    !v ? "text-muted-foreground" : v >= 70 ? "text-success" : v >= 40 ? "text-warning" : "text-destructive";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
      <h2 className="text-lg font-semibold font-display flex items-center gap-2">
        <History className="w-5 h-5 text-primary" /> Interview History
      </h2>
      <div className="grid gap-3">
        {sessions.map((s: any) => (
          <div key={s.id} className="glass-card p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{s.role}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(s.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className={`font-bold font-display ${scoreColor(s.overall_score)}`}>
                {s.overall_score ?? "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default InterviewHistory;
