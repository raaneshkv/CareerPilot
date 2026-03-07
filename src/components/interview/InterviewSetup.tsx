import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "Product Manager",
  "DevOps Engineer",
  "UX Designer",
  "Mobile Developer",
  "Machine Learning Engineer",
];

interface Props {
  onStart: (role: string, skills: string[], resumeText: string) => Promise<void>;
}

const InterviewSetup = ({ onStart }: Props) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch most recent roadmap for skills
  const { data: roadmap } = useQuery({
    queryKey: ["latest-roadmap", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("roadmaps")
        .select("roadmap_data, resume_file_name, resume_storage_path")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const roadmapData = roadmap?.roadmap_data as any;
  const skills: string[] = roadmapData?.current_skills || roadmapData?.skills_to_learn || [];

  const handleStart = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      // Try to get resume text
      let resumeText = "";
      if (roadmap?.resume_storage_path) {
        const { data } = await supabase.storage.from("resumes").download(roadmap.resume_storage_path);
        if (data) resumeText = await data.text();
      }
      await onStart(selectedRole, skills, resumeText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">
          AI <span className="gradient-text">Mock Interview</span>
        </h1>
        <p className="text-muted-foreground mt-1">Practice with AI-generated role-specific questions.</p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Mic className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold font-display">Interview Setup</h2>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Target Role</label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role..." />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {skills.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Extracted Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 12).map((skill, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleStart}
          disabled={!selectedRole || loading}
          className="gradient-bg text-primary-foreground"
          size="lg"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Questions...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate Interview</>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default InterviewSetup;
