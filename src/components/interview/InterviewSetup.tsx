import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
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
  "Cloud Architect",
  "Cybersecurity Analyst",
  "QA Engineer",
];

interface Props {
  onStart: (role: string, skills: string[], resumeText: string) => Promise<void>;
}

const InterviewSetup = ({ onStart }: Props) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [loading, setLoading] = useState(false);

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
  const effectiveRole = customRole.trim() || selectedRole;

  const handleStart = async () => {
    if (!effectiveRole) {
      toast.error("Please select or type a role before starting.");
      return;
    }
    setLoading(true);
    try {
      let resumeText = "";
      if (roadmap?.resume_storage_path && roadmap.resume_storage_path !== 'direct-goal') {
        try {
          const { data, error } = await supabase.storage.from("resumes").download(roadmap.resume_storage_path);
          if (!error && data) {
            resumeText = await data.text();
          }
        } catch (downloadErr) {
          console.warn("Resume download failed:", downloadErr);
        }
      }
      await onStart(effectiveRole, skills, resumeText);
    } catch (err: any) {
      console.error("Failed to start:", err);
      toast.error(err.message || "Failed to start interview.");
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
          <Label className="text-sm font-medium">Select a Role</Label>
          <Select value={selectedRole} onValueChange={(v) => { setSelectedRole(v); setCustomRole(""); }}>
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or type a custom role</span></div>
        </div>

        <div className="space-y-2">
          <Input 
            value={customRole} 
            onChange={e => { setCustomRole(e.target.value); if (e.target.value) setSelectedRole(""); }}
            placeholder="e.g. AI Prompt Engineer, Solutions Architect..."
            className="bg-background"
          />
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
          disabled={!effectiveRole || loading}
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
