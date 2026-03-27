import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SkillRadarChart } from "@/components/SkillRadarChart";
import { Target, Zap, Loader2, BookOpen, ExternalLink, ArrowRight, Trophy, Flame, Swords, Shield, Star, Crown, Gem, Award } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function SkillAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  
  const [currentSkills, setCurrentSkills] = useState("React, JavaScript, HTML, CSS, Git");
  const [targetJob, setTargetJob] = useState("Senior Full Stack Developer");

  const [skillData, setSkillData] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [matchPercentage, setMatchPercentage] = useState(0);

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
          course: "Complete Node.js Developer Course (Udemy)",
          url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
          duration: "4 weeks",
          icon: <Swords className="w-5 h-5 text-indigo-400" />
        },
        {
          title: "Cloud Architect's Trial",
          skill: "AWS",
          xp: 1200,
          difficulty: "Legendary",
          course: "AWS Certified Developer Associate (Coursera)",
          url: "https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect",
          duration: "6 weeks",
          icon: <Shield className="w-5 h-5 text-amber-500" />
        },
        {
          title: "Master of Containers",
          skill: "Docker",
          xp: 450,
          difficulty: "Rare",
          course: "Docker Mastery: with Kubernetes (Udemy)",
          url: "https://www.udemy.com/course/docker-mastery/",
          duration: "3 weeks",
          icon: <Gem className="w-5 h-5 text-blue-400" />
        },
        {
          title: "Architect's Blueprint",
          skill: "System Design",
          xp: 900,
          difficulty: "Epic",
          course: "Grokking the System Design Interview",
          url: "https://www.educative.io/courses/grokking-the-system-design-interview",
          duration: "5 weeks",
          icon: <Crown className="w-5 h-5 text-purple-500" />
        }
      ]);
      
      setMatchPercentage(45);
      setHasResults(true);
      setIsAnalyzing(false);
      toast.success("Skill gap analysis complete! New quests unlocked.", { icon: "⚔️" });
    }, 2500);
  };

  const currentLevel = 12;
  const currentXP = 3450;
  const targetXP = 5000;
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
        
        {/* User Stats Bar */}
        <div className="flex items-center gap-4 bg-sidebar/80 border border-border p-3 rounded-2xl shadow-lg backdrop-blur-sm">
           <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center border-2 border-background shadow-inner shrink-0">
             <span className="font-bold text-primary-foreground">Lvl {currentLevel}</span>
           </div>
           <div className="w-48 space-y-1.5">
             <div className="flex justify-between text-xs font-bold font-display uppercase tracking-wider">
               <span className="text-primary flex items-center gap-1"><Star className="w-3 h-3 fill-primary" /> Frontend Mage</span>
               <span className="text-muted-foreground">{currentXP} / {targetXP} XP</span>
             </div>
             <Progress value={xpPercent} className="h-2.5 bg-background shadow-inner" />
           </div>
           <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
             <div className="flex flex-col items-center justify-center">
               <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
               <span className="text-xs font-bold text-orange-500">3 Day</span>
             </div>
             <div className="flex flex-col items-center justify-center">
               <Trophy className="w-5 h-5 text-yellow-500" />
               <span className="text-xs font-bold text-yellow-500">Rank: B</span>
             </div>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Inputs */}
        <motion.div 
          className="lg:col-span-4 space-y-6"
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="glass-card border-primary/20 bg-gradient-to-br from-sidebar/50 to-sidebar/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Mission Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Current Arsenal (Skills)</Label>
                <Textarea 
                  rows={3}
                  value={currentSkills} 
                  onChange={e => setCurrentSkills(e.target.value)} 
                  className="bg-background resize-none focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Boss (Job Title/Description)</Label>
                <Textarea 
                  rows={4}
                  value={targetJob} 
                  onChange={e => setTargetJob(e.target.value)} 
                  className="bg-background resize-none focus-visible:ring-destructive/50"
                  placeholder="e.g. Senior Full Stack Developer"
                />
              </div>
              
              <Button 
                className="gradient-bg w-full group relative overflow-hidden" 
                size="lg" 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
                {isAnalyzing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Scanning Enemy Intel...</>
                ) : (
                  <><Zap className="w-5 h-5 mr-2" /> Uncover Skill Gaps</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Badges / Trophies Showcase */}
          <Card className="glass-card bg-sidebar/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-transform cursor-help" title="CSS Master">
                   <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-transform cursor-help" title="React Champion">
                   <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-transform cursor-help opacity-50 grayscale" title="Docker Novice (Locked)">
                   <Gem className="w-6 h-6 text-white" />
                </div>
                <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                   <span className="text-xs font-bold text-muted-foreground">+5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Results */}
        <motion.div 
          className="lg:col-span-8 space-y-6"
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {hasResults ? (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Radar */}
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

                  {/* Readiness Score */}
                  <Card className="glass-card flex flex-col justify-center items-center text-center p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2 z-10">
                      <CardTitle className="text-xl">Job Readiness</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 w-full flex flex-col items-center z-10">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="72" cy="72" r="64" fill="transparent" stroke="hsl(var(--muted))" strokeWidth="14" />
                          <circle 
                            cx="72" cy="72" r="64" 
                            fill="transparent" 
                            stroke="url(#gradient)" 
                            strokeWidth="14" 
                            strokeLinecap="round"
                            strokeDasharray={402} 
                            strokeDashoffset={402 - (402 * matchPercentage) / 100} 
                            className="transition-all duration-1500 ease-out"
                          />
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

                {/* Quests */}
                <Card className="glass-card border-primary/20 bg-sidebar/30">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500/20" /> Active Quests
                    </CardTitle>
                    <CardDescription>
                      Complete these training modules to bridge your skill gap and earn massive XP.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    {quests.map((quest, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: index * 0.1 }}
                        key={index} 
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background border border-border hover:border-primary/50 rounded-xl gap-4 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
                      >
                        {/* Difficulty indicator ribbon */}
                        <div className={`absolute top-0 right-0 py-0.5 px-3 rounded-bl-lg text-[10px] font-bold uppercase tracking-widest text-white ${
                          quest.difficulty === "Legendary" ? "bg-amber-500" :
                          quest.difficulty === "Epic" ? "bg-purple-500" : "bg-blue-500"
                        }`}>
                          {quest.difficulty}
                        </div>

                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-sidebar border border-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                            {quest.icon}
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
                                +{quest.xp} XP
                              </span>
                              <span className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-yellow-500" /> Reward: {quest.skill}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0 mt-2 sm:mt-0">
                          <Button 
                            className="gradient-bg gap-2 sm:w-auto w-full group-hover:animate-pulse"
                            onClick={() => window.open(quest.url, "_blank")}
                          >
                            Accept Quest <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
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
    </div>
  );
}
