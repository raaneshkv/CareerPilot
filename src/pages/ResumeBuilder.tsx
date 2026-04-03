import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileDown, Sparkles, Loader2, Target, CheckCircle2, AlertCircle, XCircle, Award, Layout } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

/* ---- Real ATS Scoring Engine ---- */
function computeATSScore(resumeData: any, targetJob: string) {
  const { name, role, experience, skills, email, phone, education, projects } = resumeData;
  
  // Tokenize
  const jobTokens = targetJob.toLowerCase().split(/[\s,;.\-\/()]+/).filter(t => t.length > 2);
  const resumeText = `${name} ${role} ${experience} ${skills} ${education} ${projects}`.toLowerCase();
  const resumeTokens = resumeText.split(/[\s,;.\-\/()]+/).filter(t => t.length > 2);
  const skillList = skills.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
  
  // 1. Keyword Match Score (40% weight)
  const matchedKeywords = jobTokens.filter(tok => resumeTokens.includes(tok) || resumeText.includes(tok));
  const uniqueJobKeywords = [...new Set(jobTokens)];
  const uniqueMatched = [...new Set(matchedKeywords)];
  const keywordScore = uniqueJobKeywords.length > 0 
    ? Math.min(100, Math.round((uniqueMatched.length / uniqueJobKeywords.length) * 100)) 
    : 50;

  // 2. Skills Coverage Score (25% weight)
  const importantSkillKeywords = uniqueJobKeywords.filter(tok => 
    ['react', 'python', 'java', 'javascript', 'typescript', 'node', 'sql', 'aws', 'docker', 'kubernetes',
     'next', 'vue', 'angular', 'flutter', 'swift', 'kotlin', 'go', 'rust', 'c++', 'c#',
     'machine', 'learning', 'data', 'design', 'agile', 'scrum', 'git', 'api', 'rest', 'graphql',
     'tensorflow', 'pytorch', 'tableau', 'excel', 'figma', 'photoshop', 'ui', 'ux',
     'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'linux', 'devops', 'ci', 'cd',
     'communication', 'leadership', 'management', 'analytical', 'problem', 'solving'].includes(tok)
  );
  const matchedSkills = importantSkillKeywords.filter(sk => skillList.some((s: string) => s.includes(sk)) || resumeText.includes(sk));
  const skillsScore = importantSkillKeywords.length > 0
    ? Math.min(100, Math.round((matchedSkills.length / importantSkillKeywords.length) * 100))
    : 60;

  // 3. Content Quality Score (20% weight)
  let contentScore = 50;
  // Quantified achievements
  const numbers = experience.match(/\d+%|\d+x|\$[\d,]+|₹[\d,]+|\d+ (users|clients|projects|team|members)/gi) || [];
  contentScore += Math.min(25, numbers.length * 8);
  // Action verbs
  const actionVerbs = ['built', 'developed', 'designed', 'implemented', 'led', 'managed', 'optimized', 'improved', 'created', 'delivered', 'launched', 'reduced', 'increased', 'achieved', 'architected', 'engineered', 'mentored', 'scaled'];
  const usedVerbs = actionVerbs.filter(v => experience.toLowerCase().includes(v));
  contentScore += Math.min(15, usedVerbs.length * 3);
  // Length
  if (experience.length > 200) contentScore += 5;
  if (experience.length > 500) contentScore += 5;
  contentScore = Math.min(100, contentScore);

  // 4. Formatting/Completeness Score (15% weight)
  let formatScore = 0;
  if (name.trim()) formatScore += 15;
  if (role.trim()) formatScore += 15;
  if (email.trim() && email.includes('@')) formatScore += 15;
  if (phone.trim()) formatScore += 10;
  if (education.trim()) formatScore += 15;
  if (projects.trim()) formatScore += 15;
  if (skills.split(',').length >= 5) formatScore += 15;
  formatScore = Math.min(100, formatScore);

  const total = Math.round(keywordScore * 0.40 + skillsScore * 0.25 + contentScore * 0.20 + formatScore * 0.15);

  // Generate specific suggestions
  const suggestions: string[] = [];
  const missingKeywords = uniqueJobKeywords.filter(tok => !uniqueMatched.includes(tok) && tok.length > 3);
  if (missingKeywords.length > 0) {
    suggestions.push(`Add these keywords from the job description: ${missingKeywords.slice(0, 5).join(', ')}`);
  }
  if (numbers.length < 2) {
    suggestions.push("Quantify your achievements more. E.g., 'Improved performance by 30%' or 'Managed a team of 8'.");
  }
  if (usedVerbs.length < 3) {
    suggestions.push("Use stronger action verbs: 'Architected', 'Engineered', 'Optimized', 'Delivered' instead of generic descriptions.");
  }
  if (!email.trim() || !phone.trim()) {
    suggestions.push("Include both email and phone contact information for ATS parsing.");
  }
  if (!education.trim()) {
    suggestions.push("Add an Education section — most ATS systems require it.");
  }
  if (!projects.trim()) {
    suggestions.push("Add a Projects section to showcase practical, hands-on experience.");
  }
  if (skillList.length < 5) {
    suggestions.push("List at least 5-8 relevant skills to improve keyword matching.");
  }
  if (role.toLowerCase().includes('senior') || targetJob.toLowerCase().includes('senior')) {
    if (!experience.toLowerCase().includes('lead') && !experience.toLowerCase().includes('mentor')) {
      suggestions.push("For senior roles, highlight leadership/mentoring experience.");
    }
  }

  return {
    total,
    keywordScore,
    skillsScore,
    contentScore,
    formatScore,
    suggestions: suggestions.slice(0, 5),
    matchedKeywordCount: uniqueMatched.length,
    totalKeywordCount: uniqueJobKeywords.length,
  };
}

/* ---- Professional Resume PDF Templates ---- */
function generatePDFContent(data: any, template: string) {
  const skillBadges = data.skills.split(',').map((s: string) => 
    `<span style="display:inline-block;background:#f0f0ff;color:#4338ca;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:500;margin:3px;">${s.trim()}</span>`
  ).join('');

  const experienceItems = data.experience.split('\n').filter(Boolean).map((line: string) =>
    `<li style="margin-bottom:6px;font-size:13px;line-height:1.6;color:#374151;">${line.trim()}</li>`
  ).join('');

  const projectItems = data.projects ? data.projects.split('\n').filter(Boolean).map((line: string) =>
    `<li style="margin-bottom:6px;font-size:13px;line-height:1.6;color:#374151;">${line.trim()}</li>`
  ).join('') : '';

  if (template === 'modern') {
    return `
      <div style="font-family:'Segoe UI',Roboto,'Helvetica Neue',sans-serif;max-width:800px;margin:0 auto;color:#1f2937;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:white;padding:40px 50px;border-radius:0 0 20px 20px;">
          <h1 style="font-size:32px;font-weight:800;margin:0 0 4px 0;letter-spacing:-0.5px;">${data.name}</h1>
          <p style="font-size:18px;margin:0 0 16px 0;opacity:0.9;font-weight:500;">${data.role}</p>
          <div style="display:flex;gap:20px;font-size:13px;opacity:0.85;flex-wrap:wrap;">
            ${data.email ? `<span>📧 ${data.email}</span>` : ''}
            ${data.phone ? `<span>📱 ${data.phone}</span>` : ''}
            ${data.linkedin ? `<span>🔗 ${data.linkedin}</span>` : ''}
          </div>
        </div>
        
        <div style="padding:30px 50px;">
          <!-- Skills -->
          <div style="margin-bottom:28px;">
            <h3 style="font-size:16px;font-weight:700;color:#4338ca;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">Technical Skills</h3>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">${skillBadges}</div>
          </div>
          
          <!-- Experience -->
          <div style="margin-bottom:28px;">
            <h3 style="font-size:16px;font-weight:700;color:#4338ca;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">Professional Experience</h3>
            <ul style="padding-left:18px;margin:0;">${experienceItems}</ul>
          </div>
          
          ${data.education ? `
          <div style="margin-bottom:28px;">
            <h3 style="font-size:16px;font-weight:700;color:#4338ca;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">Education</h3>
            <p style="font-size:13px;line-height:1.8;color:#374151;white-space:pre-wrap;">${data.education}</p>
          </div>` : ''}
          
          ${projectItems ? `
          <div style="margin-bottom:28px;">
            <h3 style="font-size:16px;font-weight:700;color:#4338ca;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">Projects</h3>
            <ul style="padding-left:18px;margin:0;">${projectItems}</ul>
          </div>` : ''}
        </div>
      </div>
    `;
  }

  if (template === 'minimal') {
    return `
      <div style="font-family:'Georgia',serif;max-width:750px;margin:0 auto;padding:50px;color:#111827;">
        <div style="text-align:center;margin-bottom:30px;border-bottom:1px solid #d1d5db;padding-bottom:20px;">
          <h1 style="font-size:28px;font-weight:700;margin:0 0 6px 0;letter-spacing:1px;">${data.name}</h1>
          <p style="font-size:16px;color:#6b7280;margin:0 0 10px 0;">${data.role}</p>
          <div style="font-size:12px;color:#9ca3af;display:flex;justify-content:center;gap:15px;flex-wrap:wrap;">
            ${data.email ? `<span>${data.email}</span>` : ''}
            ${data.phone ? `<span>${data.phone}</span>` : ''}
          </div>
        </div>
        
        <div style="margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#374151;margin-bottom:10px;">Skills</h3>
          <p style="font-size:13px;color:#4b5563;line-height:1.8;">${data.skills}</p>
        </div>
        
        <div style="margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#374151;margin-bottom:10px;">Experience</h3>
          <ul style="padding-left:16px;margin:0;">${experienceItems}</ul>
        </div>
        
        ${data.education ? `
        <div style="margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#374151;margin-bottom:10px;">Education</h3>
          <p style="font-size:13px;color:#4b5563;line-height:1.8;white-space:pre-wrap;">${data.education}</p>
        </div>` : ''}
        
        ${projectItems ? `
        <div style="margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#374151;margin-bottom:10px;">Projects</h3>
          <ul style="padding-left:16px;margin:0;">${projectItems}</ul>
        </div>` : ''}
      </div>
    `;
  }

  // Classic (default)
  return `
    <div style="font-family:'Segoe UI',Roboto,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#1f2937;">
      <div style="margin-bottom:28px;border-bottom:3px solid #1f2937;padding-bottom:16px;">
        <h1 style="font-size:30px;font-weight:800;margin:0 0 4px 0;">${data.name}</h1>
        <p style="font-size:17px;color:#4b5563;margin:0 0 10px 0;">${data.role}</p>
        <div style="font-size:12px;color:#6b7280;display:flex;gap:15px;flex-wrap:wrap;">
          ${data.email ? `<span>Email: ${data.email}</span>` : ''}
          ${data.phone ? `<span>Phone: ${data.phone}</span>` : ''}
          ${data.linkedin ? `<span>LinkedIn: ${data.linkedin}</span>` : ''}
        </div>
      </div>
      
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;color:#1f2937;">Skills</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">${skillBadges}</div>
      </div>
      
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;color:#1f2937;">Professional Experience</h3>
        <ul style="padding-left:18px;margin:0;">${experienceItems}</ul>
      </div>
      
      ${data.education ? `
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;color:#1f2937;">Education</h3>
        <p style="font-size:13px;line-height:1.8;color:#374151;white-space:pre-wrap;">${data.education}</p>
      </div>` : ''}
      
      ${projectItems ? `
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;color:#1f2937;">Projects</h3>
        <ul style="padding-left:18px;margin:0;">${projectItems}</ul>
      </div>` : ''}
    </div>
  `;
}

export default function ResumeBuilder() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [resumeData, setResumeData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    linkedin: "",
    experience: "",
    skills: "",
    education: "",
    projects: "",
  });
  const [targetJob, setTargetJob] = useState("");

  const handleTailorResume = () => {
    if (!targetJob.trim()) {
      toast.error("Please enter a target job description first.");
      return;
    }
    if (!resumeData.name.trim() && !resumeData.skills.trim()) {
      toast.error("Please fill in at least your name and skills.");
      return;
    }
    setIsGenerating(true);
    setAtsResult(null);

    setTimeout(() => {
      const result = computeATSScore(resumeData, targetJob);
      setAtsResult(result);
      setIsGenerating(false);
      toast.success("ATS analysis complete!");
    }, 1500);
  };

  const handleExport = () => {
    if (!resumeData.name.trim()) {
      toast.error("Please enter your name before exporting.");
      return;
    }
    setIsGenerating(true);
    const element = document.createElement("div");
    element.innerHTML = generatePDFContent(resumeData, selectedTemplate);

    const opt = {
      margin: 10,
      filename: `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsGenerating(false);
      toast.success("Professional resume downloaded!");
    }).catch((err: any) => {
      console.error(err);
      setIsGenerating(false);
      toast.error("Failed to generate PDF");
    });
  };

  const scoreColor = (v: number) => v >= 75 ? "text-emerald-500" : v >= 50 ? "text-amber-500" : "text-rose-500";
  const scoreLabel = (v: number) => v >= 80 ? "Excellent" : v >= 65 ? "Good" : v >= 50 ? "Needs Work" : "Poor";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display">
          AI <span className="gradient-text">Resume Builder</span>
        </h1>
        <p className="text-muted-foreground mt-1">Create an ATS-friendly, tailored resume with real keyword analysis.</p>
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
                      <Label>Full Name *</Label>
                      <Input 
                        value={resumeData.name} 
                        onChange={e => setResumeData({...resumeData, name: e.target.value})} 
                        className="bg-background"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current/Target Role *</Label>
                      <Input 
                        value={resumeData.role} 
                        onChange={e => setResumeData({...resumeData, role: e.target.value})}
                        className="bg-background"
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        value={resumeData.email} 
                        onChange={e => setResumeData({...resumeData, email: e.target.value})} 
                        className="bg-background"
                        placeholder="you@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input 
                        value={resumeData.phone} 
                        onChange={e => setResumeData({...resumeData, phone: e.target.value})}
                        className="bg-background"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn</Label>
                      <Input 
                        value={resumeData.linkedin} 
                        onChange={e => setResumeData({...resumeData, linkedin: e.target.value})}
                        className="bg-background"
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Key Skills (comma separated) *</Label>
                    <Input 
                      value={resumeData.skills} 
                      onChange={e => setResumeData({...resumeData, skills: e.target.value})}
                      className="bg-background"
                      placeholder="React, TypeScript, Node.js, Python, AWS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Experience (one point per line) *</Label>
                    <Textarea 
                      rows={5}
                      value={resumeData.experience} 
                      onChange={e => setResumeData({...resumeData, experience: e.target.value})}
                      className="bg-background resize-none"
                      placeholder="Built enterprise React applications serving 50K+ users&#10;Improved web performance by 30%, reducing load time by 2s&#10;Led a team of 4 developers on a critical product launch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Education</Label>
                    <Textarea 
                      rows={2}
                      value={resumeData.education} 
                      onChange={e => setResumeData({...resumeData, education: e.target.value})}
                      className="bg-background resize-none"
                      placeholder="B.Tech Computer Science, XYZ University, 2024 — CGPA: 8.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Projects (one per line)</Label>
                    <Textarea 
                      rows={3}
                      value={resumeData.projects} 
                      onChange={e => setResumeData({...resumeData, projects: e.target.value})}
                      className="bg-background resize-none"
                      placeholder="E-Commerce Platform — Built with Next.js and Stripe, handling 1000+ transactions&#10;AI Chatbot — NLP-powered support bot reducing ticket load by 40%"
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
                    Paste the job description here. The ATS engine will analyze keyword matches and score your resume.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    rows={10}
                    value={targetJob}
                    onChange={e => setTargetJob(e.target.value)}
                    placeholder="Paste the complete job description here..."
                    className="bg-background resize-none"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Right Column - ATS Score & Actions */}
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
                ATS Score & Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Score Display */}
              <div className="text-center space-y-2">
                {atsResult ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full border-4 ${atsResult.total >= 75 ? 'border-emerald-500 bg-emerald-500/10' : atsResult.total >= 50 ? 'border-amber-500 bg-amber-500/10' : 'border-rose-500 bg-rose-500/10'} mb-2`}>
                      <span className={`text-3xl font-bold ${scoreColor(atsResult.total)}`}>{atsResult.total}%</span>
                    </div>
                    <p className={`text-sm font-medium ${scoreColor(atsResult.total)} flex items-center justify-center gap-1`}>
                      {atsResult.total >= 75 ? <CheckCircle2 className="w-4 h-4" /> : atsResult.total >= 50 ? <AlertCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {scoreLabel(atsResult.total)}
                    </p>

                    {/* Score Breakdown */}
                    <div className="mt-4 space-y-3 text-left">
                      {[
                        { label: "Keyword Match", value: atsResult.keywordScore, detail: `${atsResult.matchedKeywordCount}/${atsResult.totalKeywordCount} keywords` },
                        { label: "Skills Coverage", value: atsResult.skillsScore },
                        { label: "Content Quality", value: atsResult.contentScore },
                        { label: "Completeness", value: atsResult.formatScore },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className={`font-bold ${scoreColor(item.value)}`}>{item.value}%</span>
                          </div>
                          <Progress value={item.value} className="h-1.5" />
                          {item.detail && <p className="text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-6 text-muted-foreground flex flex-col items-center gap-2">
                    <Sparkles className="w-8 h-8 opacity-50" />
                    <p className="text-sm">Click "Analyze ATS Score" to get a real score</p>
                  </div>
                )}
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                  <Layout className="w-3 h-3" /> PDF Template
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {['modern', 'classic', 'minimal'].map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTemplate(t)}
                      className={`p-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                        selectedTemplate === t 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
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
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Analyze ATS Score</>
                  )}
                </Button>
                <Button variant="outline" className="w-full bg-sidebar/50" onClick={handleExport} disabled={isGenerating}>
                  <FileDown className="w-4 h-4 mr-2" /> Export {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} PDF
                </Button>
              </div>

              {/* Suggestions */}
              {atsResult?.suggestions?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t border-border space-y-3"
                >
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" /> Improvement Tips
                  </h4>
                  <ul className="space-y-2">
                    {atsResult.suggestions.map((suggestion: string, i: number) => (
                      <li key={i} className="text-sm text-sidebar-foreground bg-sidebar p-3 rounded-lg border border-border">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </CardContent>
          </Card>
          
          {/* Live Preview */}
          <Card className="glass-card bg-sidebar/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-background border border-border rounded-lg shadow-sm space-y-3">
                <h3 className="font-bold text-lg">{resumeData.name || "Your Name"}</h3>
                <p className="text-primary font-medium">{resumeData.role || "Your Role"}</p>
                {resumeData.email && <p className="text-xs text-muted-foreground">{resumeData.email} {resumeData.phone && `· ${resumeData.phone}`}</p>}
                <div className="flex flex-wrap gap-1">
                  {resumeData.skills ? resumeData.skills.split(',').map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{skill.trim()}</Badge>
                  )) : <span className="text-xs text-muted-foreground">Add skills above</span>}
                </div>
                {resumeData.experience && <p className="text-sm mt-2 text-muted-foreground leading-relaxed line-clamp-3">{resumeData.experience}</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
