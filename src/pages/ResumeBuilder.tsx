import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileDown, Sparkles, Loader2, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResumeBuilder() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [resumeData, setResumeData] = useState({
    name: "John Doe",
    role: "Frontend Developer",
    experience: "Built enterprise React applications. Integrated REST APIs. Improved web performance by 30%.",
    skills: "React, TypeScript, Tailwind CSS, Node.js",
  });
  const [targetJob, setTargetJob] = useState("Looking for a Senior Frontend Developer role requiring React, Next.js, and performance optimization skills.");

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleTailorResume = () => {
    setIsGenerating(true);
    setAtsScore(null);
    setAiSuggestions([]);

    // Simulate AI API Call
    setTimeout(() => {
      setAtsScore(85);
      setAiSuggestions([
        "Add 'Next.js' to your skills since the job description emphasizes it.",
        "Quantify your experience more. E.g., 'Improved web performance by 30% saving 2s on load time'.",
        "Include leadership or mentoring keywords if applying for a Senior role."
      ]);
      setResumeData(prev => ({
        ...prev,
        experience: "Senior Frontend Developer handling enterprise React/Next.js applications. Improved core web vitals by 30%. Led frontend teams."
      }));
      setIsGenerating(false);
      toast.success("Resume optimized successfully by AI!");
    }, 2500);
  };

  const handleExport = () => {
    toast.success("Resume downloaded as PDF!");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display">
          AI <span className="gradient-text">Resume Builder</span>
        </h1>
        <p className="text-muted-foreground mt-1">Create an ATS-friendly, tailored resume instantly for your dream job.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Inputs */}
        <motion.div 
          className="lg:col-span-7 space-y-6"
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-sidebar border border-border">
              <TabsTrigger value="content">Resume Content</TabsTrigger>
              <TabsTrigger value="target">Target Job</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4 space-y-4">
              <Card className="glass-card bg-sidebar/50">
                <CardHeader>
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        value={resumeData.name} 
                        onChange={e => setResumeData({...resumeData, name: e.target.value})} 
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Role</Label>
                      <Input 
                        value={resumeData.role} 
                        onChange={e => setResumeData({...resumeData, role: e.target.value})}
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Key Skills (comma separated)</Label>
                    <Input 
                      value={resumeData.skills} 
                      onChange={e => setResumeData({...resumeData, skills: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Experience Highlights</Label>
                    <Textarea 
                      rows={5}
                      value={resumeData.experience} 
                      onChange={e => setResumeData({...resumeData, experience: e.target.value})}
                      className="bg-background resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="target" className="mt-4">
              <Card className="glass-card bg-sidebar/50 text-card-foreground border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Target Job Description
                  </CardTitle>
                  <CardDescription>
                    Paste the job description here. The AI will tailor your resume to match these exact requirements.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    rows={8}
                    value={targetJob}
                    onChange={e => setTargetJob(e.target.value)}
                    placeholder="Paste job description here..."
                    className="bg-background resize-none"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Right Column - Preview & ATS */}
        <motion.div 
          className="lg:col-span-5 space-y-6"
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="glass-card border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                ATS Score & AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Score Display */}
              <div className="text-center space-y-2">
                {atsScore !== null ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-primary bg-primary/10 mb-2">
                      <span className="text-3xl font-bold text-primary">{atsScore}%</span>
                    </div>
                    <p className="text-sm font-medium text-emerald-500 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Highly Competitive
                    </p>
                  </motion.div>
                ) : (
                  <div className="py-6 text-muted-foreground flex flex-col items-center gap-2">
                    <Sparkles className="w-8 h-8 opacity-50" />
                    <p className="text-sm">Click "Tailor with AI" to generate score</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  className="gradient-bg border-0 w-full hover:opacity-90 transition-opacity"
                  size="lg"
                  onClick={handleTailorResume}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Tailoring using AI...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Tailor with AI</>
                  )}
                </Button>
                <Button variant="outline" className="w-full bg-sidebar/50" onClick={handleExport} disabled={isGenerating}>
                  <FileDown className="w-4 h-4 mr-2" /> Export to PDF
                </Button>
              </div>

              {/* Suggestions */}
              {aiSuggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t border-border space-y-3"
                >
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" /> AI Improvement Tips
                  </h4>
                  <ul className="space-y-2">
                    {aiSuggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-sidebar-foreground bg-sidebar p-3 rounded-lg border border-border">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

            </CardContent>
          </Card>
          
          {/* Live Preview Snippet (Optional Mini View) */}
          <Card className="glass-card bg-sidebar/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Live Preview Snippet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-background border border-border rounded-lg shadow-sm space-y-3">
                <h3 className="font-bold text-lg">{resumeData.name}</h3>
                <p className="text-primary font-medium">{resumeData.role}</p>
                <div className="flex flex-wrap gap-1">
                  {resumeData.skills.split(',').map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{skill.trim()}</Badge>
                  ))}
                </div>
                <p className="text-sm mt-2 text-muted-foreground leading-relaxed">{resumeData.experience}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
