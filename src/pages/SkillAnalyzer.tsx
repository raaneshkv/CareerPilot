import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SkillRadarChart } from "@/components/SkillRadarChart";
import { Target, Zap, Loader2, BookOpen, ExternalLink, ArrowRight, Trophy, Flame, Swords, Shield, Star, Crown, Gem, Award, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_URL } from "@/lib/api";

/* ---- Comprehensive Job Skill Requirements Database ---- */
const JOB_SKILL_DB: Record<string, { skill: string; weight: number; course: string; url: string }[]> = {
  "frontend developer": [
    { skill: "React", weight: 95, course: "React - The Complete Guide", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/" },
    { skill: "JavaScript", weight: 90, course: "JavaScript: The Advanced Concepts", url: "https://www.udemy.com/course/advanced-javascript-concepts/" },
    { skill: "TypeScript", weight: 85, course: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/" },
    { skill: "CSS/Tailwind", weight: 80, course: "CSS for JavaScript Developers", url: "https://css-for-js.dev/" },
    { skill: "Next.js", weight: 75, course: "Next.js 14 Complete Course", url: "https://nextjs.org/learn" },
    { skill: "Testing", weight: 65, course: "Testing JavaScript", url: "https://testingjavascript.com/" },
    { skill: "Performance", weight: 60, course: "Web Performance Fundamentals", url: "https://frontendmasters.com/courses/web-perf/" },
    { skill: "Git", weight: 70, course: "Git & GitHub Crash Course", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
  ],
  "backend developer": [
    { skill: "Node.js", weight: 90, course: "Complete Node.js Developer", url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/" },
    { skill: "Python", weight: 85, course: "Python Backend Development", url: "https://www.udemy.com/course/100-days-of-code/" },
    { skill: "SQL/PostgreSQL", weight: 90, course: "SQL and PostgreSQL Complete", url: "https://www.udemy.com/course/sql-and-postgresql/" },
    { skill: "REST APIs", weight: 85, course: "REST API Design", url: "https://restfulapi.net/" },
    { skill: "Docker", weight: 70, course: "Docker Mastery", url: "https://www.udemy.com/course/docker-mastery/" },
    { skill: "System Design", weight: 75, course: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
    { skill: "Authentication", weight: 65, course: "OAuth 2.0 Simplified", url: "https://www.oauth.com/" },
    { skill: "Git", weight: 70, course: "Git & GitHub", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
  ],
  "full stack developer": [
    { skill: "React", weight: 90, course: "React Complete Guide", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/" },
    { skill: "Node.js", weight: 85, course: "Complete Node.js Developer", url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/" },
    { skill: "TypeScript", weight: 80, course: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/" },
    { skill: "SQL", weight: 80, course: "SQL Complete Course", url: "https://www.udemy.com/course/sql-and-postgresql/" },
    { skill: "Docker", weight: 65, course: "Docker Mastery", url: "https://www.udemy.com/course/docker-mastery/" },
    { skill: "AWS/Cloud", weight: 70, course: "AWS Cloud Practitioner", url: "https://aws.amazon.com/certification/certified-cloud-practitioner/" },
    { skill: "System Design", weight: 75, course: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
    { skill: "Git", weight: 70, course: "Pro Git Book", url: "https://git-scm.com/book/en/v2" },
  ],
  "data scientist": [
    { skill: "Python", weight: 95, course: "Python for Data Science", url: "https://www.coursera.org/professional-certificates/ibm-data-science" },
    { skill: "Machine Learning", weight: 90, course: "ML Specialization by Andrew Ng", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
    { skill: "SQL", weight: 80, course: "SQL for Data Science", url: "https://www.coursera.org/learn/sql-for-data-science" },
    { skill: "Statistics", weight: 85, course: "Statistics & Probability", url: "https://www.khanacademy.org/math/statistics-probability" },
    { skill: "Pandas/NumPy", weight: 85, course: "Data Analysis with Python", url: "https://www.freecodecamp.org/learn/data-analysis-with-python/" },
    { skill: "Deep Learning", weight: 70, course: "Deep Learning Specialization", url: "https://www.coursera.org/specializations/deep-learning" },
    { skill: "Visualization", weight: 65, course: "Data Visualization with Python", url: "https://www.coursera.org/learn/python-for-data-visualization" },
    { skill: "Git", weight: 55, course: "Git for Data Scientists", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
  ],
  "devops engineer": [
    { skill: "Docker", weight: 95, course: "Docker Mastery", url: "https://www.udemy.com/course/docker-mastery/" },
    { skill: "Kubernetes", weight: 90, course: "Kubernetes Course", url: "https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/" },
    { skill: "AWS/Cloud", weight: 90, course: "AWS Solutions Architect", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
    { skill: "CI/CD", weight: 85, course: "GitHub Actions CI/CD", url: "https://docs.github.com/en/actions" },
    { skill: "Linux", weight: 85, course: "Linux Administration", url: "https://www.udemy.com/course/learn-linux-in-5-days/" },
    { skill: "Terraform", weight: 75, course: "Terraform Up & Running", url: "https://www.terraformupandrunning.com/" },
    { skill: "Monitoring", weight: 70, course: "Prometheus & Grafana", url: "https://prometheus.io/docs/introduction/overview/" },
    { skill: "Python/Bash", weight: 70, course: "Scripting for DevOps", url: "https://www.udemy.com/course/python-for-devops/" },
  ],
  "machine learning engineer": [
    { skill: "Python", weight: 95, course: "Python for ML", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
    { skill: "TensorFlow/PyTorch", weight: 90, course: "Deep Learning Specialization", url: "https://www.coursera.org/specializations/deep-learning" },
    { skill: "Mathematics", weight: 85, course: "Mathematics for ML", url: "https://www.coursera.org/specializations/mathematics-machine-learning" },
    { skill: "MLOps", weight: 80, course: "MLOps Specialization", url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops" },
    { skill: "Data Engineering", weight: 75, course: "Data Engineering on GCP", url: "https://www.coursera.org/professional-certificates/gcp-data-engineering" },
    { skill: "NLP/CV", weight: 70, course: "NLP with Transformers", url: "https://huggingface.co/course/chapter1" },
    { skill: "Cloud (AWS/GCP)", weight: 70, course: "AWS for ML", url: "https://aws.amazon.com/machine-learning/" },
    { skill: "Docker", weight: 60, course: "Docker for Data Science", url: "https://www.udemy.com/course/docker-mastery/" },
  ],
};

/* Default fallback skills for any role */
const DEFAULT_SKILLS = [
  { skill: "Programming", weight: 85, course: "CS50 by Harvard", url: "https://cs50.harvard.edu/" },
  { skill: "Problem Solving", weight: 80, course: "LeetCode Practice", url: "https://leetcode.com/" },
  { skill: "Communication", weight: 70, course: "Business Communication", url: "https://www.coursera.org/learn/wharton-communication" },
  { skill: "Git/Version Control", weight: 75, course: "Pro Git", url: "https://git-scm.com/book/en/v2" },
  { skill: "System Design", weight: 70, course: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
  { skill: "Databases", weight: 75, course: "SQL Complete", url: "https://www.w3schools.com/sql/" },
];

const QUIZ_DB: Record<string, { q: string; options: string[]; answer: number }[]> = {
  "React": [
    { q: "What hook manages local component state in React?", options: ["useEffect", "useState", "useContext", "useReducer"], answer: 1 },
    { q: "What does the Virtual DOM do?", options: ["Updates the browser DOM directly", "Acts as a lightweight copy of the real DOM for diffing", "Parses CSS modules", "Handles API requests"], answer: 1 },
    { q: "How do you pass data to a child component?", options: ["State", "Hooks", "Props", "Context only"], answer: 2 },
  ],
  "Node.js": [
    { q: "Which engine powers Node.js?", options: ["SpiderMonkey", "V8", "Chakra", "JavaScriptCore"], answer: 1 },
    { q: "What is the event loop in Node.js?", options: ["A UI rendering cycle", "A mechanism for handling async operations", "A database query optimizer", "A load balancer"], answer: 1 },
    { q: "Which module system does Node.js natively use?", options: ["AMD", "ES Modules only", "CommonJS", "SystemJS"], answer: 2 },
  ],
  "Python": [
    { q: "What is a Python decorator?", options: ["A design pattern for classes", "A function that modifies another function", "A type annotation", "A loop construct"], answer: 1 },
    { q: "What does 'pip' stand for?", options: ["Python Installation Package", "Pip Installs Packages", "Package In Python", "Python Is Perfect"], answer: 1 },
    { q: "Which data structure is immutable in Python?", options: ["List", "Dictionary", "Tuple", "Set"], answer: 2 },
  ],
  "SQL": [
    { q: "What does JOIN do in SQL?", options: ["Deletes duplicate rows", "Combines rows from two or more tables", "Sorts the result set", "Creates new tables"], answer: 1 },
    { q: "What is normalization?", options: ["Adding indexes", "Organizing data to reduce redundancy", "Encrypting data", "Adding foreign keys"], answer: 1 },
    { q: "Which clause filters groups in SQL?", options: ["WHERE", "FILTER", "HAVING", "GROUP"], answer: 2 },
  ],
  "Docker": [
    { q: "What command runs a Docker container?", options: ["docker start", "docker run", "docker launch", "docker exec"], answer: 1 },
    { q: "What is a Dockerfile used for?", options: ["Storing logs", "Monitoring containers", "Building container images", "Networking containers"], answer: 2 },
    { q: "Which tool orchestrates multiple containers?", options: ["Docker Compose / Kubernetes", "Jenkins", "Ansible", "Terraform"], answer: 0 },
  ],
  "System Design": [
    { q: "What does a load balancer do?", options: ["Stores data", "Distributes incoming traffic across servers", "Encrypts traffic", "Monitors latency"], answer: 1 },
    { q: "What is the CAP theorem?", options: ["Consistency, Automation, Partition", "Consistency, Availability, Partition tolerance", "Concurrency, Availability, Persistence", "Caching, Availability, Partition"], answer: 1 },
    { q: "What is database sharding?", options: ["Replicating data", "Normalizing tables", "Partitioning data across multiple machines", "Adding indexes"], answer: 2 },
  ],
  "AWS/Cloud": [
    { q: "Which AWS service provides scalable computing?", options: ["S3", "Lambda", "EC2", "RDS"], answer: 2 },
    { q: "What does S3 stand for?", options: ["Simple Storage System", "Standard Storage Service", "Simple Storage Service", "Secure Storage System"], answer: 2 },
    { q: "Which service is a managed NoSQL database?", options: ["RDS", "DynamoDB", "Aurora", "Redshift"], answer: 1 },
  ],
};

function getQuizForSkill(skill: string) {
  const keys = Object.keys(QUIZ_DB);
  const key = keys.find(k => skill.toLowerCase().includes(k.toLowerCase()));
  return QUIZ_DB[key || "System Design"];
}

function findBestJobMatch(targetJob: string): { skill: string; weight: number; course: string; url: string }[] {
  const lower = targetJob.toLowerCase();
  for (const [key, skills] of Object.entries(JOB_SKILL_DB)) {
    if (lower.includes(key) || key.includes(lower.replace('senior ', '').replace('junior ', '').replace('lead ', ''))) {
      return skills;
    }
  }
  // Partial match
  for (const [key, skills] of Object.entries(JOB_SKILL_DB)) {
    const keyWords = key.split(' ');
    if (keyWords.some(w => lower.includes(w))) return skills;
  }
  return DEFAULT_SKILLS;
}

const ICON_MAP: Record<string, any> = {
  "Swords": Swords, "Shield": Shield, "Gem": Gem, "Crown": Crown,
};

const QUEST_ICONS = ["Swords", "Shield", "Gem", "Crown"];
const QUEST_COLORS = [
  { iconColor: "text-indigo-400", iconBg: "from-indigo-400 to-indigo-600" },
  { iconColor: "text-amber-500", iconBg: "from-amber-400 to-amber-600" },
  { iconColor: "text-blue-400", iconBg: "from-blue-400 to-blue-600" },
  { iconColor: "text-purple-500", iconBg: "from-purple-400 to-purple-600" },
  { iconColor: "text-emerald-400", iconBg: "from-emerald-400 to-emerald-600" },
  { iconColor: "text-rose-400", iconBg: "from-rose-400 to-rose-600" },
];

export default function SkillAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetJob, setTargetJob] = useState("");

  const [skillData, setSkillData] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [matchPercentage, setMatchPercentage] = useState(0);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [targetXP, setTargetXP] = useState(1000);
  const [streakDays, setStreakDays] = useState(0);
  const [trophies, setTrophies] = useState<any[]>([]);

  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const savedStats = localStorage.getItem("skillStats");
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        if (parsed.currentLevel) setCurrentLevel(parsed.currentLevel);
        if (parsed.currentXP) setCurrentXP(parsed.currentXP);
        if (parsed.targetXP) setTargetXP(parsed.targetXP);
        if (parsed.streakDays !== undefined) setStreakDays(parsed.streakDays);
        if (parsed.trophies) setTrophies(parsed.trophies);
      } catch (e) { console.error("Failed to load stats:", e); }
    } else {
      setStreakDays(1);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("skillStats", JSON.stringify({ currentLevel, currentXP, targetXP, streakDays, trophies }));
  }, [currentLevel, currentXP, targetXP, streakDays, trophies]);

  const handleAnalyze = async () => {
    if (!targetJob.trim()) { toast.error("Enter a target job title"); return; }
    if (!currentSkills.trim()) { toast.error("Enter your current skills"); return; }
    setIsAnalyzing(true);
    setHasResults(false);

    try {
      const response = await fetch(`${API_URL}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: currentSkills,
          job: targetJob,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the backend");
      }

      const data = await response.json();
      
      const score = Math.round(data.match_score);
      const missing: string[] = data.missing_skills || [];

      setMatchPercentage(score);

      // Generate quests for missing skills using our AI response
      const gapQuests = missing.map((skillName, i) => {
        return {
          title: `Master ${skillName}`,
          skill: skillName,
          xp: 500,
          difficulty: "Epic",
          course: `Learn ${skillName}`,
          url: `https://google.com/search?q=learn+${encodeURIComponent(skillName)}`,
          iconName: QUEST_ICONS[i % QUEST_ICONS.length],
          ...QUEST_COLORS[i % QUEST_COLORS.length],
        };
      });

      setQuests(gapQuests);

      // Setup radar chart data
      const analyzedSkills = missing.map(m => ({ skill: m, current: 0, required: 100 }));
      const userSkills = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
      // Give the user credit for their first handful of existing skills on the radar chart
      userSkills.slice(0, 5).forEach(s => {
        analyzedSkills.push({ skill: s, current: 100, required: 100 });
      });

      setSkillData(analyzedSkills);
      setHasResults(true);
      toast.success("Skill analysis complete! Model inference successful.", { icon: "⚔️" });
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to AI backend. Make sure it is running on port 8000.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openQuiz = (quest: any) => {
    setSelectedQuest(quest);
    setQuizQuestions(getQuizForSkill(quest.skill));
    setAnswers({});
    setQuizSubmitted(false);
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (answers[idx] === q.answer) score++;
    });

    const xpEarned = selectedQuest.xp + (score * 100);
    let newXP = currentXP + xpEarned;
    let newLevel = currentLevel;
    let newTargetXP = targetXP;

    if (newXP >= newTargetXP) {
      newLevel++;
      newTargetXP = Math.floor(newTargetXP * 1.5);
      toast.success(`Level Up! You are now Level ${newLevel}!`, { icon: "👑" });
    }

    let newTrophies = [...trophies];
    if (!newTrophies.find(t => t.name.includes(selectedQuest.skill))) {
      newTrophies.push({ name: `${selectedQuest.skill} Conqueror`, icon: selectedQuest.iconName, color: selectedQuest.iconBg });
    }

    setCurrentXP(newXP);
    setCurrentLevel(newLevel);
    setTargetXP(newTargetXP);
    setTrophies(newTrophies);
    setStreakDays(prev => prev + 1);
    setQuests(quests.filter(q => q.title !== selectedQuest.title));
    setMatchPercentage(prev => Math.min(100, prev + Math.round(selectedQuest.xp / 50)));
    setQuizSubmitted(true);
    toast.success(`Quest Completed! Earned ${xpEarned} XP.`, { icon: "🌟" });
  };

  const closeQuiz = () => { setSelectedQuest(null); };
  const xpPercent = (currentXP / targetXP) * 100;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
             Skill <span className="gradient-text">Tracker</span> 
          </h1>
          <p className="text-muted-foreground mt-1">Level up your career. Complete quests, earn XP, and become job-ready.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-sidebar/80 border border-border p-3 rounded-2xl shadow-lg backdrop-blur-sm">
           <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center border-2 border-background shadow-inner shrink-0">
             <span className="font-bold text-primary-foreground">Lvl {currentLevel}</span>
           </div>
           <div className="w-48 space-y-1.5">
             <div className="flex justify-between text-xs font-bold font-display uppercase tracking-wider">
               <span className="text-primary flex items-center gap-1"><Star className="w-3 h-3 fill-primary" /> Tech Adept</span>
               <span className="text-muted-foreground">{currentXP} / {targetXP} XP</span>
             </div>
             <Progress value={xpPercent} className="h-2.5 bg-background shadow-inner" />
           </div>
           <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
             <div className="flex flex-col items-center justify-center">
               <Flame className={`w-5 h-5 text-orange-500 fill-orange-500 ${streakDays > 0 ? "animate-pulse" : "opacity-30"}`} />
               <span className="text-xs font-bold text-orange-500">{streakDays}d</span>
             </div>
             <div className="flex flex-col items-center justify-center text-yellow-500 ml-2">
               <Trophy className="w-5 h-5 text-yellow-500" />
               <span className="text-xs font-bold">{trophies.length}</span>
             </div>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div className="lg:col-span-4 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="glass-card border-primary/20 bg-gradient-to-br from-sidebar/50 to-sidebar/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Mission Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Current Skills (comma-separated)</Label>
                <Textarea rows={3} value={currentSkills} onChange={e => setCurrentSkills(e.target.value)} className="bg-background resize-none focus-visible:ring-primary/50" placeholder="e.g. React, JavaScript, HTML, CSS, Git, Python" />
              </div>
              <div className="space-y-2">
                <Label>Target Job Title</Label>
                <Input value={targetJob} onChange={e => setTargetJob(e.target.value)} className="bg-background focus-visible:ring-destructive/50" placeholder="e.g. Senior Full Stack Developer" />
              </div>
              <Button className="gradient-bg w-full group relative overflow-hidden" size="lg" onClick={handleAnalyze} disabled={isAnalyzing}>
                <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shimmerSlide_1.5s_ease-in-out_infinite]" />
                {isAnalyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Skills...</> : <><Zap className="w-5 h-5 mr-2" /> Analyze Skill Gaps</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card bg-sidebar/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {trophies.map((t, idx) => {
                  const Icon = ICON_MAP[t.icon] || Shield;
                  return (
                    <div key={idx} className={`aspect-square rounded-xl bg-gradient-to-br ${t.color} flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-transform cursor-help`} title={t.name}>
                       <Icon className="w-6 h-6 text-white" />
                    </div>
                  );
                })}
                {trophies.length === 0 && (
                  <div className="col-span-4 text-center text-xs text-muted-foreground py-4">
                    Complete quests to earn trophies!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-8 space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          {hasResults ? (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="glass-card overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Swords className="w-5 h-5 text-primary" /> Skill Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SkillRadarChart data={skillData} />
                    </CardContent>
                  </Card>

                  <Card className="glass-card flex flex-col justify-center items-center text-center p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2 z-10">
                      <CardTitle className="text-xl">Job Readiness</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 w-full flex flex-col items-center z-10">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="72" cy="72" r="64" fill="transparent" stroke="hsl(var(--muted))" strokeWidth="14" />
                          <circle cx="72" cy="72" r="64" fill="transparent" stroke="url(#gradient)" strokeWidth="14" strokeLinecap="round" strokeDasharray={402} strokeDashoffset={402 - (402 * matchPercentage) / 100} className="transition-all duration-1500 ease-out" />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--destructive))" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute text-4xl font-bold font-display tracking-tighter">{matchPercentage}<span className="text-xl text-muted-foreground">%</span></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {quests.length > 0 
                          ? <span>Complete <span className="text-foreground font-bold">{quests.length} skill quests</span> to improve readiness.</span>
                          : <span className="text-emerald-500 font-medium">You're highly job-ready! 🎉</span>
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="glass-card border-primary/20 bg-sidebar/30">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500/20" /> Active Quests
                    </CardTitle>
                    <CardDescription>Study the material, then claim XP by acing the quiz.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    {quests.length === 0 ? (
                      <div className="text-center p-6 text-muted-foreground">All quests complete! Job Readiness maximized. 🎉</div>
                    ) : quests.map((quest, index) => {
                      const QuestIcon = ICON_MAP[quest.iconName] || Swords;
                      return (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} key={index} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background border border-border hover:border-primary/50 rounded-xl gap-4 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
                          <div className={`absolute top-0 right-0 py-0.5 px-3 rounded-bl-lg text-[10px] font-bold uppercase tracking-widest text-white ${quest.difficulty === "Legendary" ? "bg-amber-500" : quest.difficulty === "Epic" ? "bg-purple-500" : "bg-blue-500"}`}>
                            {quest.difficulty}
                          </div>
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-sidebar border border-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                              <QuestIcon className={`w-5 h-5 ${quest.iconColor}`} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-lg leading-tight">{quest.title}</h4>
                              <p className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                                <BookOpen className="w-3 h-3" /> {quest.course}
                              </p>
                              <div className="flex gap-3 pt-1">
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">+{quest.xp} XP</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0 mt-2 sm:mt-0 w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto hover:bg-muted" onClick={() => window.open(quest.url, "_blank")}>
                              Study Material
                            </Button>
                            <Button className="gradient-bg gap-2 sm:w-auto w-full" onClick={() => openQuiz(quest)}>
                              Take Quiz <CheckCircle className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          ) : (
             <Card className="glass-card h-full min-h-[500px] flex items-center justify-center border-dashed border-2 relative overflow-hidden">
               <div className="text-center space-y-4 max-w-sm px-4">
                 <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                    <Swords className="w-10 h-10 text-primary" />
                 </motion.div>
                 <h3 className="text-2xl font-bold font-display">Ready for Analysis?</h3>
                 <p className="text-muted-foreground text-sm">
                   Enter your current skills and target job title to uncover skill gaps and generate personalized learning quests.
                 </p>
               </div>
             </Card>
          )}
        </motion.div>
      </div>

      {/* Quiz Dialog */}
      <Dialog open={!!selectedQuest} onOpenChange={(open) => !open && closeQuiz()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="w-5 h-5 text-primary" /> {selectedQuest?.skill} Assessment
            </DialogTitle>
            <DialogDescription>Answer correctly to earn bonus XP!</DialogDescription>
          </DialogHeader>
          {!quizSubmitted ? (
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {quizQuestions.map((q, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-semibold text-sm">Q{idx + 1}. {q.q}</h4>
                  <div className="space-y-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div key={optIdx} onClick={() => setAnswers({...answers, [idx]: optIdx})} className={`text-sm p-3 rounded-lg border cursor-pointer transition-colors ${answers[idx] === optIdx ? 'bg-primary/20 border-primary' : 'hover:bg-muted'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8" />
              </motion.div>
              <h3 className="text-2xl font-bold">Quest Complete!</h3>
              <p className="text-muted-foreground text-center">
                You scored {Object.values(answers).reduce((acc, ans, idx) => acc + (ans === quizQuestions[idx]?.answer ? 1 : 0), 0)}/{quizQuestions.length} correctly.
              </p>
            </div>
          )}
          <DialogFooter>
            {!quizSubmitted ? (
              <Button onClick={submitQuiz} className="w-full gradient-bg mt-4" disabled={Object.keys(answers).length < quizQuestions.length}>
                Submit & Claim XP
              </Button>
            ) : (
              <Button onClick={closeQuiz} className="w-full mt-4">Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
