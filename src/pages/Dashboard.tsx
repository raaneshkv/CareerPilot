import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, Loader2, Rocket, Mic, Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PersonalizedRoadmap from "@/components/PersonalizedRoadmap";
import RoadmapDisplay from "@/components/RoadmapDisplay";
import type { RoadmapNodeData } from "@/components/RoadmapNode";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null);
  const [isCriticMode, setIsCriticMode] = useState(false);
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Capture dropped file or ID from query params
  useEffect(() => {
    // Handle query params
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    if (id && id !== activeRoadmapId) {
      setActiveRoadmapId(id);
      // Clean up URL without triggering re-render
      window.history.replaceState({}, document.title, location.pathname);
    }
    // Handle dropped file
    else if (location.state?.droppedFile && !file && !activeRoadmapId) {
      setFile(location.state.droppedFile);
      window.history.replaceState({}, document.title);
    }
  }, [location.search, location.state?.droppedFile, file, activeRoadmapId]);

  const { data: roadmaps, refetch } = useQuery({
    queryKey: ["roadmaps", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const activeRoadmap = roadmaps?.find((r: any) => r.id === activeRoadmapId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(selected.type)) {
        toast.error("Please upload a PDF or DOCX file");
        return;
      }
      setFile(selected);
      setActiveRoadmapId(null);
    }
  };

  const handleGenerate = async () => {
    if (!file || !user) return;
    setGenerating(true);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const text = await file.text();

      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeText: text, fileName: file.name },
      });
      if (error) throw error;

      let roadmapData = data.roadmap;

      // Roast mode enhancement
      if (isCriticMode) {
        roadmapData.summary = "🔥 ROAST MODE: " + (roadmapData.summary || "") +
          "\nHonestly, this resume has a lot of fluff and lacks hard impact metrics. You're getting filtered out by ATS systems because you sound like everyone else. We need to upgrade these skills aggressively.";
      }

      const { data: saved, error: saveError } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user.id,
          resume_file_name: file.name,
          resume_storage_path: filePath,
          roadmap_data: roadmapData,
        })
        .select("id")
        .single();
      if (saveError) throw saveError;

      setActiveRoadmapId(saved.id);
      setFile(null);
      refetch();
      if (isCriticMode) {
        toast.success("Resume roasted! Hope you're ready for the truth.", { icon: "🔥" });
      } else {
        toast.success("Roadmap generated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateNodes = async (roadmapId: string, nodes: RoadmapNodeData[]) => {
    const rm = roadmaps?.find((r: any) => r.id === roadmapId);
    if (!rm) return;

    const updatedData = { ...(rm.roadmap_data as any), nodes };

    const { error } = await supabase
      .from("roadmaps")
      .update({ roadmap_data: updatedData })
      .eq("id", roadmapId);

    if (error) {
      toast.error("Failed to save progress");
      return;
    }
    refetch();
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display">
          Welcome, <span className="gradient-text">{displayName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Upload your resume and get a personalized career roadmap.</p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card p-8"
      >
        <h2 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" /> Upload Resume
        </h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Click to upload your resume</p>
              <p className="text-sm text-muted-foreground mt-1">PDF or DOCX (max 10MB)</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 bg-secondary/50 p-2.5 rounded-lg border border-border">
            <Label htmlFor="mode-toggle" className="text-sm font-medium flex items-center gap-1 cursor-pointer">
              Mentor Mode
            </Label>
            <Switch
              id="mode-toggle"
              checked={isCriticMode}
              onCheckedChange={setIsCriticMode}
              className="data-[state=checked]:bg-destructive"
            />
            <Label htmlFor="mode-toggle" className="text-sm font-medium flex items-center gap-1 cursor-pointer text-destructive">
              <Flame className="w-3 h-3" /> "Roast Me" Mode
            </Label>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!file || generating}
            className={`gradient-bg text-primary-foreground ${isCriticMode ? 'from-orange-500 to-red-600' : ''}`}
            size="lg"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Resume...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate Roadmap</>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Start Mock Interview CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="glass-card p-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
            <Mic className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold font-display">AI Mock Interview</p>
            <p className="text-sm text-muted-foreground">Practice role-specific questions with AI evaluation.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/mock-interview")} className="gradient-bg text-primary-foreground">
          Start Interview
        </Button>
      </motion.div>

      {/* Active Roadmap */}
      {activeRoadmap && (
        (activeRoadmap.roadmap_data as any)?.nodes ? (
          <PersonalizedRoadmap
            roadmap={activeRoadmap.roadmap_data as any}
            onUpdateNodes={(nodes) => handleUpdateNodes(activeRoadmap.id, nodes)}
          />
        ) : (
          <RoadmapDisplay roadmap={activeRoadmap.roadmap_data as any} />
        )
      )}

      {/* Empty State */}
      {!activeRoadmap && (!roadmaps || roadmaps.length === 0) && !generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold font-display">No roadmap yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your resume to generate your AI-powered career roadmap.
          </p>
        </motion.div>
      )}

      {/* Recent Roadmaps */}
      {roadmaps && roadmaps.length > 0 && !activeRoadmap && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold font-display">Recent Roadmaps</h2>
          <div className="grid gap-3">
            {roadmaps.map((rm: any) => {
              const nodes = rm.roadmap_data?.nodes || [];
              const done = nodes.filter((n: any) => n.status === "completed").length;
              const pct = nodes.length > 0 ? Math.round((done / nodes.length) * 100) : 0;

              return (
                <div
                  key={rm.id}
                  onClick={() => setActiveRoadmapId(rm.id)}
                  className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{rm.resume_file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rm.created_at).toLocaleDateString()} · {pct}% complete
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
