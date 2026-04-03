import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Sparkles, Loader2, Brain, ShieldCheck, Clock, TrendingUp, Zap, IndianRupee } from "lucide-react";

/* ===== Role Database for Simulation ===== */
const ROLE_DB: Record<string, { baseSalary: number; growthRate: number; stability: number; effortHrsWeek: number; stressPattern: string; milestoneTemplate: string[] }> = {
  "frontend developer": { baseSalary: 600000, growthRate: 0.15, stability: 85, effortHrsWeek: 10, stressPattern: "Low initially, moderate at mid-level", milestoneTemplate: ["Learn React/Next.js deeply", "Build 3 portfolio projects", "Land mid-level role", "Specialize in performance/architecture", "Reach senior position"] },
  "backend developer": { baseSalary: 700000, growthRate: 0.14, stability: 88, effortHrsWeek: 12, stressPattern: "Moderate throughout", milestoneTemplate: ["Master Node.js/Python + SQL", "Build production APIs", "Get comfortable with system design", "Lead backend of a product", "Architect distributed systems"] },
  "full stack developer": { baseSalary: 650000, growthRate: 0.16, stability: 87, effortHrsWeek: 14, stressPattern: "High initially, normalizes by Year 2", milestoneTemplate: ["Full-stack bootcamp completion", "Ship first full product", "Transition to mid-level", "Lead a team of 3-5", "Become tech lead"] },
  "data scientist": { baseSalary: 800000, growthRate: 0.18, stability: 82, effortHrsWeek: 15, stressPattern: "High - requires constant learning", milestoneTemplate: ["Complete ML specialization", "Kaggle top 10% project", "First industry data pipeline", "Lead analytics team", "Principal data scientist"] },
  "machine learning engineer": { baseSalary: 1000000, growthRate: 0.20, stability: 80, effortHrsWeek: 18, stressPattern: "Very High - continuous research", milestoneTemplate: ["Deep Learning & MLOps course", "Deploy first production model", "Build end-to-end ML pipeline", "Lead ML team/product", "Become ML architect"] },
  "devops engineer": { baseSalary: 700000, growthRate: 0.17, stability: 90, effortHrsWeek: 12, stressPattern: "Moderate - on-call stress", milestoneTemplate: ["AWS/GCP certification", "Docker & K8s mastery", "Build CI/CD pipelines", "Lead infrastructure team", "Platform engineering lead"] },
  "cloud architect": { baseSalary: 1200000, growthRate: 0.15, stability: 92, effortHrsWeek: 15, stressPattern: "Moderate - high responsibility", milestoneTemplate: ["Multi-cloud certification", "Design first cloud migration", "Lead enterprise migration", "CTO advisory role", "Chief architect position"] },
  "product manager": { baseSalary: 900000, growthRate: 0.16, stability: 85, effortHrsWeek: 10, stressPattern: "High - stakeholder management", milestoneTemplate: ["PM bootcamp/certification", "Ship first feature end-to-end", "Own a product vertical", "Group PM role", "VP of Product"] },
  "cybersecurity analyst": { baseSalary: 700000, growthRate: 0.18, stability: 93, effortHrsWeek: 14, stressPattern: "Moderate - incident-driven stress", milestoneTemplate: ["Security certifications (CEH/CISSP)", "First vulnerability assessment", "Lead security audit", "Security architect role", "CISO track"] },
};

function findRole(target: string) {
  const lower = target.toLowerCase();
  for (const [key, data] of Object.entries(ROLE_DB)) {
    if (lower.includes(key)) return data;
  }
  for (const [key, data] of Object.entries(ROLE_DB)) {
    if (key.split(' ').some(w => lower.includes(w))) return data;
  }
  return { baseSalary: 700000, growthRate: 0.15, stability: 85, effortHrsWeek: 12, stressPattern: "Moderate", milestoneTemplate: ["Complete foundational courses", "Build portfolio", "Land first role", "Grow to mid-level", "Reach senior/lead position"] };
}

function formatINR(num: number) {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

export default function Simulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("india");
  const [timeframe, setTimeframe] = useState("5");
  const [simulationData, setSimulationData] = useState<any>(null);

  const handleSimulate = () => {
    if (!currentRole || !targetRole) return;
    setIsSimulating(true);
    setHasResult(false);

    setTimeout(() => {
      const currentData = findRole(currentRole);
      const targetData = findRole(targetRole);
      const years = parseInt(timeframe);

      // Generate salary projection
      const salaryProjection = [];
      for (let yr = 0; yr <= years; yr++) {
        const currentSal = currentData.baseSalary * Math.pow(1 + currentData.growthRate * 0.6, yr);
        const targetSal = yr === 0 ? currentData.baseSalary : targetData.baseSalary * Math.pow(1 + targetData.growthRate, yr - 1);
        salaryProjection.push({
          year: `Year ${yr}`,
          "Stay Current": Math.round(currentSal),
          "Switch Path": Math.round(targetSal),
        });
      }

      // Generate milestones
      const milestones = targetData.milestoneTemplate.slice(0, years).map((m, i) => {
        const timeLabel = i === 0 ? "Month 6" : `Year ${i + (i > 0 ? 0.5 : 0)}`;
        return `${timeLabel}: ${m}`;
      });

      const totalEarningsCurrent = salaryProjection.reduce((s, d) => s + d["Stay Current"], 0);
      const totalEarningsNew = salaryProjection.reduce((s, d) => s + d["Switch Path"], 0);

      setSimulationData({
        salaryProjection,
        effort: `${targetData.effortHrsWeek > 15 ? "Very High" : targetData.effortHrsWeek > 10 ? "High" : "Moderate"} — Requires ~${targetData.effortHrsWeek}hrs/week of focused upskilling.`,
        stability: `${targetData.stability >= 90 ? "Very High" : targetData.stability >= 80 ? "High" : "Moderate"} — ${targetData.stability}% projected job retention rate.`,
        workLifeBalance: targetData.stressPattern,
        milestones,
        totalGain: totalEarningsNew - totalEarningsCurrent,
        finalSalary: salaryProjection[salaryProjection.length - 1]["Switch Path"],
      });
      
      setHasResult(true);
      setIsSimulating(false);
    }, 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display">
           <span className="gradient-text">What-If</span> Career Engine
        </h1>
        <p className="text-muted-foreground mt-1">Simulate your future. Predict salary growth, effort required, and job stability.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div className="lg:col-span-4 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="glass-card bg-sidebar/50 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> Setup Simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <Input value={currentRole} onChange={e => setCurrentRole(e.target.value)} className="bg-background" placeholder="e.g. Junior Web Developer" />
              </div>
              <div className="space-y-2">
                 <Label>What if I become a...</Label>
                 <Input value={targetRole} onChange={e => setTargetRole(e.target.value)} className="bg-background border-primary/50 shadow-sm shadow-primary/20" placeholder="e.g. Machine Learning Engineer" />
              </div>
              <div className="space-y-2">
                 <Label>Timeframe</Label>
                 <Select value={timeframe} onValueChange={setTimeframe}>
                   <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="3">3 Years</SelectItem>
                     <SelectItem value="5">5 Years</SelectItem>
                     <SelectItem value="10">10 Years</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              <Button className="gradient-bg w-full mt-4" size="lg" onClick={handleSimulate} disabled={isSimulating || !currentRole || !targetRole}>
                {isSimulating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running Simulation...</> : <><Sparkles className="w-4 h-4 mr-2" /> Run Simulation</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-8 space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <AnimatePresence mode="wait">
            {!hasResult ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card h-full min-h-[400px] flex items-center justify-center border-dashed border-2">
                <div className="text-center space-y-4 max-w-sm px-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2"><TrendingUp className="w-8 h-8 text-primary" /></div>
                  <h3 className="text-xl font-semibold font-display">Awaiting Simulation</h3>
                  <p className="text-muted-foreground text-sm">Enter your current and target role, then run the simulation to see your predicted future.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="glass-card bg-rose-500/5 border-rose-500/20">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm text-rose-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Required Effort</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm font-medium">{simulationData.effort}</p></CardContent>
                  </Card>
                  <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm text-emerald-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Job Stability</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm font-medium">{simulationData.stability}</p></CardContent>
                  </Card>
                  <Card className="glass-card bg-blue-500/5 border-blue-500/20">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm text-blue-500 flex items-center gap-2"><Brain className="w-4 h-4" /> Work-Life Balance</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm font-medium">{simulationData.workLifeBalance}</p></CardContent>
                  </Card>
                </div>

                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <CardTitle>Predicted Salary Trajectory</CardTitle>
                    <CardDescription>{currentRole} → {targetRole} · Total gain: <span className="text-emerald-500 font-bold">{formatINR(simulationData.totalGain)}</span></CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simulationData.salaryProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatINR(v)} />
                          <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                          <Legend />
                          <Line type="monotone" dataKey="Stay Current" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="Switch Path" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                   <CardHeader><CardTitle className="text-lg">Key Milestones</CardTitle></CardHeader>
                   <CardContent>
                      <div className="space-y-4">
                        {simulationData.milestones.map((milestone: string, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-primary mt-1.5 shrink-0" />
                              {idx !== simulationData.milestones.length - 1 && <div className="w-0.5 h-full bg-border my-1" />}
                            </div>
                            <div className="pb-4">
                              <p className="font-medium">{milestone.split(": ").slice(1).join(": ")}</p>
                              <p className="text-sm text-muted-foreground">{milestone.split(": ")[0]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                   </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
