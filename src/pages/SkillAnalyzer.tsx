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

const MOCK_QUIZZES: Record<string, any[]> = {
  "React": [
    { q: "What hook is used to manage local state?", options: ["useEffect", "useState", "useContext", "useReducer"], answer: 1 },
    { q: "What does the Virtual DOM do?", options: ["Updates the browser DOM directly", "Acts as a lightweight copy of the real DOM", "Parses CSS modules", "Handles API requests"], answer: 1 },
    { q: "How do you pass data to a child component?", options: ["State", "Hooks", "Props", "Context"], answer: 2 },
  ],
  "Node.js": [
    { q: "Which engine powers Node.js?", options: ["SpiderMonkey", "V8", "Chakra", "JavaScriptCore"], answer: 1 },
    { q: "How do you import a module in CommonJS?", options: ["import module from 'module'", "require('module')", "load('module')", "include('module')"], answer: 1 },
    { q: "What is the global object in Node.js?", options: ["window", "document", "global", "process"], answer: 2 },
  ],
  "AWS": [
    { q: "Which service provides scalable cloud computing capacity?", options: ["S3", "Lambda", "EC2", "RDS"], answer: 2 },
    { q: "What does S3 stand for?", options: ["Simple Storage System", "Standard Storage Service", "Simple Storage Service", "Secure Storage System"], answer: 2 },
    { q: "Which service is a fully managed NoSQL database?", options: ["RDS", "DynamoDB", "Aurora", "Redshift"], answer: 1 },
  ],
  "Docker": [
    { q: "What command creates a Docker container?", options: ["docker start", "docker run", "docker launch", "docker exec"], answer: 1 },
    { q: "What is a Dockerfile used for?", options: ["Storing logs", "Monitoring containers", "Building images", "Networking containers"], answer: 2 },
    { q: "Which tool orchestrates multiple containers?", options: ["Docker Swarm / Kubernetes", "Jenkins", "Ansible", "Terraform"], answer: 0 },
  ],
  "System Design": [
    { q: "What does a load balancer do?", options: ["Stores data", "Distributes traffic", "Encrypts traffic", "Monitors latency"], answer: 1 },
    { q: "What is the CAP theorem?", options: ["Consistency, Automation, Partition tolerance", "Consistency, Availability, Partition tolerance", "Concurrency, Availability, Persistence", "Caching, Availability, Partition tolerance"], answer: 1 },
    { q: "What is database sharding?", options: ["Replicating data", "Normalizing tables", "Partitioning data across multiple machines", "Adding indexes"], answer: 2 },
  ]
};

function generateQuizForSkill(skill: string) {
  const keys = Object.keys(MOCK_QUIZZES);
  let key = keys.find(k => skill.toLowerCase().includes(k.toLowerCase()));
  if (!key) key = "React"; 
  return MOCK_QUIZZES[key];
}

const ICON_MAP: Record<string, any> = {
  "Swords": Swords,
  "Shield": Shield,
  "Gem": Gem,
  "Crown": Crown,
};

export default function SkillAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  
  const [currentSkills, setCurrentSkills] = useState("React, JavaScript, HTML, CSS, Git");
  const [targetJob, setTargetJob] = useState("Senior Full Stack Developer");

  const [skillData, setSkillData] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [matchPercentage, setMatchPercentage] = useState(0);

  // Gamification State
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [targetXP, setTargetXP] = useState(1000);
  const [streakDays, setStreakDays] = useState(0);
  const [trophies, setTrophies] = useState<any[]>([
    { name: "CSS Master", icon: "Shield", color: "from-slate-200 to-slate-400" },
    { name: "React Champion", icon: "Crown", color: "from-amber-300 to-amber-600" }
  ]);

  // Quiz Modal State
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
      } catch (e) {
        console.error("Failed to load skill stats:", e);
      }
    } else {
      setStreakDays(1); // Set initial streak
    }
  }, []);

  useEffect(() => {
    const statsToSave = { currentLevel, currentXP, targetXP, streakDays, trophies };
    localStorage.setItem("skillStats", JSON.stringify(statsToSave));
  }, [currentLevel, currentXP, targetXP, streakDays, trophies]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setHasResults(false);

    // Simulate AI API Call
    setTimeout(() => {
      setSkillData([
        { skill: "React", current: 85, required: 90 },
        { skill: "Node.js", current: 20, required: 80 },
        { skill: "AWS", current: 10, required: 75 },
        { skill: "Docker", current: 30, required: 70 },
        { skill: "System Design", current: 40, required: 85 },
        { skill: "Git", current: 90, required: 80 },
      ]);
      
      setQuests([
        {
          title: "The Node.js Awakening",
          skill: "Node.js",
          xp: 850,
          difficulty: "Epic",
          course: "Complete Node.js Developer Course",
          url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
          iconName: "Swords",
          iconColor: "text-indigo-400",
          iconBg: "from-indigo-400 to-indigo-600"
        },
        {
          title: "Cloud Architect's Trial",
          skill: "AWS",
          xp: 1200,
          difficulty: "Legendary",
          course: "AWS Certified Developer Associate",
          url: "https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect",
          iconName: "Shield",
          iconColor: "text-amber-500",
          iconBg: "from-amber-400 to-amber-600"
        },
        {
          title: "Master of Containers",
          skill: "Docker",
          xp: 450,
          difficulty: "Rare",
          course: "Docker Mastery: with Kubernetes",
          url: "https://www.udemy.com/course/docker-mastery/",
          iconName: "Gem",
          iconColor: "text-blue-400",
          iconBg: "from-blue-400 to-blue-600"
        },
        {
          title: "Architect's Blueprint",
          skill: "System Design",
          xp: 900,
          difficulty: "Epic",
          course: "Grokking the System Design Interview",
          url: "https://www.educative.io/courses/grokking-the-system-design-interview",
          iconName: "Crown",
          iconColor: "text-purple-500",
          iconBg: "from-purple-400 to-purple-600"
        }
      ]);
      
      setMatchPercentage(45);
      setHasResults(true);
      setIsAnalyzing(false);
      toast.success("Skill gap analysis complete! New quests unlocked.", { icon: "⚔️" });
    }, 2500);
  };

  const openQuiz = (quest: any) => {
    setSelectedQuest(quest);
    setQuizQuestions(generateQuizForSkill(quest.skill));
    setAnswers({});
    setQuizSubmitted(false);
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (answers[idx] === q.answer) score++;
    });

    const xpEarned = selectedQuest.xp + (score * 100);
    
    // Add XP
    let newXP = currentXP + xpEarned;
    let newLevel = currentLevel;
    let newTargetXP = targetXP;

    if (newXP >= newTargetXP) {
      newLevel++;
      newTargetXP = Math.floor(newTargetXP * 1.5);
      toast.success(`Level Up! You are now Level ${newLevel}!`, { icon: "👑" });
    }

    // Add Trophy
    let newTrophies = [...trophies];
    if (!newTrophies.find(t => t.name.includes(selectedQuest.skill))) {
      newTrophies.push({
        name: `${selectedQuest.skill} Conqueror`,
        icon: selectedQuest.iconName,
        color: selectedQuest.iconBg
      });
    }

    setCurrentXP(newXP);
    setCurrentLevel(newLevel);
    setTargetXP(newTargetXP);
    setTrophies(newTrophies);
    setStreakDays(prev => prev + 1); // Simple streak bump for demo

    // Remove Quest
    setQuests(quests.filter(q => q.title !== selectedQuest.title));
    setMatchPercentage(prev => Math.min(100, prev + 15));

    setQuizSubmitted(true);
    toast.success(`Quest Completed! Earned ${xpEarned} XP.`, { icon: "🌟" });
  };

  const closeQuiz = () => {
    setSelectedQuest(null);
  };

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
        
        {/* Gamification Stats Bar */}
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
               <span className="text-xs font-bold text-orange-500">{streakDays} Day</span>
             </div>
             <div className="flex flex-col items-center justify-center text-yellow-500 ml-2">
               <Trophy className="w-5 h-5 text-yellow-500" />
               <span className="text-xs font-bold">Rank: B</span>
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
                <Label>Your Current Arsenal (Skills)</Label>
                <Textarea rows={3} value={currentSkills} onChange={e => setCurrentSkills(e.target.value)} className="bg-background resize-none focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <Label>Target Boss (Job Title)</Label>
                <Textarea rows={4} value={targetJob} onChange={e => setTargetJob(e.target.value)} className="bg-background resize-none focus-visible:ring-destructive/50" placeholder="e.g. Senior Full Stack Developer" />
              </div>
              <Button className="gradient-bg w-full group relative overflow-hidden" size="lg" onClick={handleAnalyze} disabled={isAnalyzing}>
                <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
                {isAnalyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Scanning Enemy Intel...</> : <><Zap className="w-5 h-5 mr-2" /> Uncover Skill Gaps</>}
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
                <div className="aspect-square flex-col gap-1 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform cursor-help opacity-40 grayscale" title="Kubernetes God (Locked)">
                   <Gem className="w-5 h-5 text-white" />
                   <span className="text-[9px] font-bold text-white">Locked</span>
                </div>
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
                        <Swords className="w-5 h-5 text-primary" /> Combat Attributes
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
                        You must complete <span className="text-foreground font-bold">{quests.length} Active Quests</span> to challenge this boss.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="glass-card border-primary/20 bg-sidebar/30">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500/20" /> Active Quests
                    </CardTitle>
                    <CardDescription>
                      Study these topics, then claim your XP by completing the rigorous skill quiz.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    {quests.length === 0 ? (
                      <div className="text-center p-6 text-muted-foreground">All quests complete! Job Readiness maximized.</div>
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
                              <h4 className="font-bold text-lg leading-tight flex items-center gap-2">
                                {quest.title}
                              </h4>
                              <p className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                                <BookOpen className="w-3 h-3" /> {quest.course}
                              </p>
                              <div className="flex gap-3 pt-1">
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                  +{quest.xp} Base XP
                                </span>
                                <span className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                                  <Trophy className="w-3 h-3 text-yellow-500" /> Topic: {quest.skill}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 shrink-0 mt-2 sm:mt-0 w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto hover:bg-muted" onClick={() => window.open(quest.url, "_blank")}>
                              Review Material
                            </Button>
                            <Button className="gradient-bg gap-2 sm:w-auto w-full group-hover:animate-pulse" onClick={() => openQuiz(quest)}>
                              Take Quiz & Complete <CheckCircle className="w-4 h-4 ml-1" />
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
               <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
               <div className="text-center space-y-4 max-w-sm px-4">
                 <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                    <Swords className="w-10 h-10 text-primary" />
                 </motion.div>
                 <h3 className="text-2xl font-bold font-display">Ready for Battle?</h3>
                 <p className="text-muted-foreground text-sm">
                   Set your target on the left and scan for skill gaps. We'll generate a custom quest line to level you up.
                 </p>
               </div>
             </Card>
          )}
        </motion.div>
      </div>

      {/* Quiz Dialog Modal */}
      <Dialog open={!!selectedQuest} onOpenChange={(open) => !open && closeQuiz()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="w-5 h-5 text-primary" /> {selectedQuest?.skill} Final Assessment
            </DialogTitle>
            <DialogDescription>
              Answer the following questions correctly to earn bonus XP and complete the quest!
            </DialogDescription>
          </DialogHeader>

          {!quizSubmitted ? (
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {quizQuestions.map((q, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-semibold text-sm">Q{idx + 1}. {q.q}</h4>
                  <div className="space-y-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div 
                        key={optIdx} 
                        onClick={() => setAnswers({...answers, [idx]: optIdx})}
                        className={`text-sm p-3 rounded-lg border cursor-pointer transition-colors ${answers[idx] === optIdx ? 'bg-primary/20 border-primary' : 'hover:bg-muted'}`}
                      >
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
                You scored correctly on {Object.values(answers).reduce((acc, ans, idx) => acc + (ans === quizQuestions[idx].answer ? 1 : 0), 0)}/{quizQuestions.length} questions.
              </p>
            </div>
          )}

          <DialogFooter>
            {!quizSubmitted ? (
              <Button onClick={submitQuiz} className="w-full gradient-bg mt-4" disabled={Object.keys(answers).length < quizQuestions.length}>
                Submit Answers & Claim Rank
              </Button>
            ) : (
              <Button onClick={closeQuiz} className="w-full mt-4">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
