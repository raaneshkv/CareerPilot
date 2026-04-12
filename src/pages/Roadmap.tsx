import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, Loader2, Rocket, Mic, Flame, Map, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PersonalizedRoadmap from "@/components/PersonalizedRoadmap";
import RoadmapDisplay from "@/components/RoadmapDisplay";
import { API_URL } from "@/lib/api";
import type { RoadmapNodeData } from "@/components/RoadmapNode";

import * as pdfjsLib from "pdfjs-dist";
// Use Vite's explicit URL import for the worker script
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === "application/pdf";
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        text += strings.join(" ") + "\n";
      }
      return text;
    } else if (isDocx) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error("Failed to extract text from the file. Please ensure it's a valid PDF or DOCX.");
  }
  return await file.text();
};

const Roadmap = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null);
  const [isCriticMode, setIsCriticMode] = useState(false);
  const [targetRoleInput, setTargetRoleInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    if (id && id !== activeRoadmapId) {
      setActiveRoadmapId(id);
      window.history.replaceState({}, document.title, location.pathname);
    } else if (location.state?.droppedFile && !file && !activeRoadmapId) {
      setFile(location.state.droppedFile);
      window.history.replaceState({}, document.title);
    }
    // Handle pre-filled target from Career Discovery "Create Roadmap" button
    if (location.state?.targetRole && !targetRoleInput) {
      setTargetRoleInput(location.state.targetRole);
      window.history.replaceState({}, document.title);
    }
  }, [location.search, location.state?.droppedFile, location.state?.targetRole, file, activeRoadmapId]);

  const { data: roadmaps, refetch } = useQuery({
    queryKey: ["roadmaps", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const activeRoadmap = roadmaps?.find((r: any) => r.id === activeRoadmapId);

  const isValidFile = (f: File) => {
    const isPdf = f.name.toLowerCase().endsWith('.pdf');
    const isDocx = f.name.toLowerCase().endsWith('.docx');
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    return validTypes.includes(f.type) || isPdf || isDocx;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!isValidFile(selected)) {
        toast.error("Please upload a PDF or DOCX file");
        if (e.target) e.target.value = '';
        return;
      }
      setFile(selected);
      setActiveRoadmapId(null);
    }
    if (e.target) e.target.value = '';
  };

  /* Drag & Drop Handlers */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!isValidFile(droppedFile)) {
        toast.error("Please upload a PDF or DOCX file");
        return;
      }
      setFile(droppedFile);
      setActiveRoadmapId(null);
      toast.success(`File "${droppedFile.name}" loaded!`);
    }
  }, []);

  const [localRoadmap, setLocalRoadmap] = useState<any>(null);

  const mockRoadmapData = (roleOrFile: string) => ({
    summary: `Your personalized path based on ${roleOrFile}`,
    current_skills: ["React", "JavaScript", "Communication"],
    career_roles: ["Frontend Dev", "Full Stack Dev"],
    nodes: [
      {
        id: "node-1",
        title: "Advanced React Patterns",
        description: "Master hooks, context, and performance optimization.",
        currentLevel: 40,
        targetLevel: 90,
        category: "frontend",
        status: "pending",
        concepts: ["Custom Hooks", "Render Props", "useMemo"],
        resources: {
          youtube: [{ label: "React Performance", url: "#" }],
          docs: [{ label: "React Docs", url: "#" }],
          github: []
        }
      },
      {
        id: "node-2",
        title: "System Design basics",
        description: "Understand scaling, caching, and databases.",
        currentLevel: 10,
        targetLevel: 70,
        category: "backend",
        status: "pending",
        concepts: ["Load Balancing", "Caching Strategy"],
        resources: {
          youtube: [{ label: "System Design for beginners", url: "#" }],
          docs: [],
          github: []
        }
      }
    ]
  });

  const handleGenerate = async () => {
    if (!file) return;
    if (!user) {
      toast.error("Please sign in to generate and save your roadmap.");
      navigate("/auth");
      return;
    }
    setGenerating(true);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${safeName}`;
      
      // Try to upload to storage, but don't block roadmap generation if it fails
      let storagePath = filePath;
      try {
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, file);
        if (uploadError) {
          console.warn("Resume upload failed (storage may not be configured):", uploadError.message);
          storagePath = "upload-skipped";
        }
      } catch (e) {
        console.warn("Resume storage unavailable:", e);
        storagePath = "upload-skipped";
      }

      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 50) {
        toast.error("Could not extract enough text from the file. Please try a different file format.");
        setGenerating(false);
        return;
      }

      // Truncate to avoid exceeding LLM token limits
      const truncatedText = text.slice(0, 6000);

      const response = await fetch(`${API_URL}/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: truncatedText, fileName: file.name }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = "Failed to generate roadmap. Please try again.";
        if (errData.detail) {
          if (typeof errData.detail === 'string') errMsg = errData.detail;
          else if (Array.isArray(errData.detail) && errData.detail[0]?.msg) errMsg = errData.detail[0].msg;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      let roadmapData = data.roadmap;
      
      if (!roadmapData || (!roadmapData.nodes && !roadmapData.skills_to_learn)) {
        throw new Error("AI returned invalid roadmap data. Please try again.");
      }

      if (isCriticMode) {
        roadmapData.summary = "🔥 ROAST MODE: " + (roadmapData.summary || "") +
          "\nHonestly, this resume has a lot of fluff and lacks hard impact metrics. You're getting filtered out by ATS systems because you sound like everyone else. We need to upgrade these skills aggressively.";
      }

      const { data: saved, error: saveError } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user.id,
          resume_file_name: file.name,
          resume_storage_path: storagePath,
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

  const handleGenerateDirect = async () => {
    if (!targetRoleInput) return;
    if (!user) {
      toast.error("Please sign in to generate and save your roadmap.");
      navigate("/auth");
      return;
    }
    setGenerating(true);

    try {
      const response = await fetch(`${API_URL}/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapTarget: targetRoleInput }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = "Failed to generate roadmap from local AI";
        if (errData.detail) {
          if (typeof errData.detail === 'string') errMsg = errData.detail;
          else if (Array.isArray(errData.detail) && errData.detail[0]?.msg) errMsg = errData.detail[0].msg;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      let roadmapData = data.roadmap;
      
      if (!roadmapData || (!roadmapData.nodes && !roadmapData.skills_to_learn)) {
        throw new Error("AI returned invalid data. Please try again.");
      }

      if (isCriticMode) {
        roadmapData.summary = "🔥 ROAST MODE: " + (roadmapData.summary || "") +
          "\nHonestly, this goal is ambitious for your current level. You've got a lot of work to do.";
      }

      const { data: saved, error: saveError } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user.id,
          resume_file_name: `Goal: ${targetRoleInput}`,
          resume_storage_path: `direct-goal`,
          roadmap_data: roadmapData,
        })
        .select("id")
        .single();
      if (saveError) throw saveError;

      setActiveRoadmapId(saved.id);
      setTargetRoleInput("");
      refetch();
      if (isCriticMode) {
        toast.success("Goal roasted! Good luck.", { icon: "🔥" });
      } else {
        toast.success("Roadmap generated from goal successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate roadmap from goal");
    } finally {
      setGenerating(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const displayedRoadmap = localRoadmap || activeRoadmap;

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
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragOver 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : file 
                ? 'border-primary/50 bg-primary/5' 
                : 'border-border hover:border-primary/50'
          }`}
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
          ) : isDragOver ? (
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }}
              className="text-primary"
            >
              <Upload className="w-12 h-12 mx-auto mb-3 animate-bounce" />
              <p className="font-bold text-lg">Drop your file here!</p>
            </motion.div>
          ) : (
            <div>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GripVertical className="w-6 h-6 text-primary/60" />
              </div>
              <p className="font-medium">Drag & drop your resume here or click to browse</p>
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
              <><Sparkles className="w-4 h-4 mr-2" /> Generate from Resume</>
            )}
          </Button>
        </div>

        {/* OR Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-semibold">Or Generate from Scratch</span>
          </div>
        </div>

        {/* Direct Goal Input */}
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 space-y-2 w-full">
            <Label>Target Career Goal</Label>
            <Input 
              value={targetRoleInput}
              onChange={e => setTargetRoleInput(e.target.value)}
              placeholder="e.g. Senior Machine Learning Engineer" 
              className="bg-background"
            />
          </div>
          <Button
            onClick={handleGenerateDirect}
            disabled={!targetRoleInput || generating}
            className="gradient-bg text-primary-foreground sm:w-auto w-full"
            size="lg"
          >
            <Map className="w-4 h-4 mr-2" /> Generate Roadmap
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
      {displayedRoadmap && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-display">Current Roadmap</h2>
            <Button variant="ghost" size="sm" onClick={() => { setActiveRoadmapId(null); setLocalRoadmap(null); }}>
              ← Back to list
            </Button>
          </div>
          {(displayedRoadmap.roadmap_data as any)?.nodes ? (
            <PersonalizedRoadmap
              roadmap={displayedRoadmap.roadmap_data as any}
              onUpdateNodes={(nodes) => handleUpdateNodes(displayedRoadmap.id, nodes)}
            />
          ) : (
            <RoadmapDisplay roadmap={displayedRoadmap.roadmap_data as any} />
          )}
        </div>
      )}

      {/* Empty State */}
      {!displayedRoadmap && (!roadmaps || roadmaps.length === 0) && !generating && (
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

      {/* Recent Roadmaps — always visible list */}
      {roadmaps && roadmaps.length > 0 && !displayedRoadmap && (
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
                <motion.div
                  key={rm.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setActiveRoadmapId(rm.id)}
                  className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{rm.resume_file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rm.created_at).toLocaleDateString()} · {pct}% complete
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View →</Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Loading overlay */}
      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            <div className="absolute inset-2 rounded-full border-r-2 border-secondary animate-spin" style={{ animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold font-display">AI is analyzing your profile...</h3>
          <p className="text-sm text-muted-foreground mt-2">This may take 15-30 seconds. We're building your personalized career roadmap.</p>
        </motion.div>
      )}
    </div>
  );
};

export default Roadmap;
