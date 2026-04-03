import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell,
} from "recharts";
import { Calculator, Sparkles, Loader2, TrendingUp, IndianRupee, Clock, AlertCircle, CheckCircle, Shield, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/* ===== Indian Tech Salary Database (₹ LPA by role and experience) ===== */
const SALARY_DB: Record<string, { fresher: number; mid: number; senior: number; lead: number }> = {
  "frontend developer": { fresher: 500000, mid: 1200000, senior: 2000000, lead: 3000000 },
  "backend developer": { fresher: 550000, mid: 1400000, senior: 2200000, lead: 3200000 },
  "full stack developer": { fresher: 600000, mid: 1500000, senior: 2400000, lead: 3500000 },
  "data scientist": { fresher: 700000, mid: 1800000, senior: 3000000, lead: 4500000 },
  "data analyst": { fresher: 400000, mid: 900000, senior: 1500000, lead: 2200000 },
  "machine learning engineer": { fresher: 800000, mid: 2000000, senior: 3500000, lead: 5000000 },
  "devops engineer": { fresher: 600000, mid: 1500000, senior: 2500000, lead: 3800000 },
  "cloud architect": { fresher: 900000, mid: 2200000, senior: 4000000, lead: 5500000 },
  "product manager": { fresher: 800000, mid: 1800000, senior: 3000000, lead: 4500000 },
  "ux designer": { fresher: 450000, mid: 1100000, senior: 1800000, lead: 2800000 },
  "ui designer": { fresher: 400000, mid: 1000000, senior: 1600000, lead: 2500000 },
  "mobile developer": { fresher: 500000, mid: 1400000, senior: 2200000, lead: 3000000 },
  "cybersecurity analyst": { fresher: 600000, mid: 1500000, senior: 2500000, lead: 4000000 },
  "blockchain developer": { fresher: 700000, mid: 1800000, senior: 3000000, lead: 4500000 },
  "qa engineer": { fresher: 400000, mid: 900000, senior: 1500000, lead: 2200000 },
  "technical writer": { fresher: 350000, mid: 800000, senior: 1300000, lead: 1800000 },
  "solutions architect": { fresher: 1000000, mid: 2500000, senior: 4500000, lead: 6000000 },
  "site reliability engineer": { fresher: 700000, mid: 1800000, senior: 3000000, lead: 4200000 },
  "ai engineer": { fresher: 900000, mid: 2200000, senior: 4000000, lead: 5500000 },
};

/* ===== Upskilling cost estimates ===== */
const TRANSITION_COSTS: Record<string, { courses: number; certs: number; bootcamp: number; months: number }> = {
  "frontend developer": { courses: 15000, certs: 10000, bootcamp: 50000, months: 4 },
  "backend developer": { courses: 18000, certs: 12000, bootcamp: 55000, months: 5 },
  "full stack developer": { courses: 25000, certs: 15000, bootcamp: 80000, months: 6 },
  "data scientist": { courses: 30000, certs: 25000, bootcamp: 100000, months: 8 },
  "machine learning engineer": { courses: 35000, certs: 30000, bootcamp: 120000, months: 10 },
  "devops engineer": { courses: 20000, certs: 30000, bootcamp: 70000, months: 6 },
  "cloud architect": { courses: 25000, certs: 40000, bootcamp: 90000, months: 8 },
  "product manager": { courses: 20000, certs: 15000, bootcamp: 60000, months: 4 },
  "cybersecurity analyst": { courses: 25000, certs: 35000, bootcamp: 80000, months: 7 },
};

function findSalary(role: string): { fresher: number; mid: number; senior: number; lead: number } {
  const lower = role.toLowerCase();
  for (const [key, data] of Object.entries(SALARY_DB)) {
    if (lower.includes(key) || key.includes(lower.replace('senior ', '').replace('junior ', '').replace('lead ', ''))) {
      return data;
    }
  }
  // Partial match
  for (const [key, data] of Object.entries(SALARY_DB)) {
    const keyWords = key.split(' ');
    if (keyWords.some(w => lower.includes(w))) return data;
  }
  return { fresher: 500000, mid: 1200000, senior: 2000000, lead: 3000000 };
}

function findTransitionCost(role: string) {
  const lower = role.toLowerCase();
  for (const [key, data] of Object.entries(TRANSITION_COSTS)) {
    if (lower.includes(key) || key.includes(lower.replace('senior ', '').replace('junior ', '').replace('lead ', ''))) {
      return data;
    }
  }
  return { courses: 20000, certs: 15000, bootcamp: 60000, months: 6 };
}

function formatINR(num: number) {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function Finance() {
  const [currentSalary, setCurrentSalary] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("fresher");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = () => {
    if (!currentSalary || !targetRole) return;
    setIsAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      const current = parseInt(currentSalary) * 100000 || 500000; // Convert LPA input to actual
      const targetSalaryDB = findSalary(targetRole);
      const expKey = experience as keyof typeof targetSalaryDB;
      const projectedSalary = targetSalaryDB[expKey] || targetSalaryDB.mid;
      const transitionInfo = findTransitionCost(targetRole);
      
      const totalTransitionCost = transitionInfo.courses + transitionInfo.certs + transitionInfo.bootcamp;
      const monthlyCurrentIncome = current / 12;
      const monthlyTargetIncome = projectedSalary / 12;
      const monthlyDiff = monthlyTargetIncome - monthlyCurrentIncome;
      
      // ROI = (5 year earnings gain - transition cost) / transition cost * 100
      const fiveYearGain = (projectedSalary - current) * 5;
      const roi = totalTransitionCost > 0 ? Math.round(((fiveYearGain - totalTransitionCost) / totalTransitionCost) * 100) : 0;
      
      // Break-even in months
      const breakEvenMonths = monthlyDiff > 0 ? Math.ceil(totalTransitionCost / monthlyDiff) : 999;
      
      // Monthly savings (50/30/20 rule: 20% savings)
      const monthlySavingsTarget = monthlyTargetIncome * 0.20;
      const monthlySavingsCurrent = monthlyCurrentIncome * 0.20;
      
      // Risk assessment
      let riskScore = 50;
      if (projectedSalary > current * 2) riskScore += 15; // High salary jump = more risk
      if (transitionInfo.months > 6) riskScore += 10;
      if (targetRole.toLowerCase().includes('ai') || targetRole.toLowerCase().includes('ml') || targetRole.toLowerCase().includes('cloud')) riskScore -= 15; // Hot market
      if (experience === 'fresher') riskScore += 5;
      riskScore = Math.max(10, Math.min(90, riskScore));
      
      // Salary progression over 5 years
      const salaryProjection = [];
      for (let yr = 0; yr <= 5; yr++) {
        const currentGrowth = current * Math.pow(1.08, yr); // 8% annual growth in current role
        const targetGrowth = yr === 0 ? current : projectedSalary * Math.pow(1.12, yr - 1); // 12% in new role after year 1
        salaryProjection.push({
          year: `Year ${yr}`,
          "Current Path": Math.round(currentGrowth),
          "New Path": Math.round(targetGrowth),
        });
      }
      
      // Cost breakdown
      const costBreakdown = [
        { name: "Online Courses", value: transitionInfo.courses, color: "#8b5cf6" },
        { name: "Certifications", value: transitionInfo.certs, color: "#ec4899" },
        { name: "Bootcamp/Training", value: transitionInfo.bootcamp, color: "#06b6d4" },
        { name: `Living (${transitionInfo.months} mo)`, value: transitionInfo.months * monthlyCurrentIncome * 0.3, color: "#f59e0b" },
      ];
      
      setResult({
        projectedSalary,
        totalTransitionCost,
        roi,
        breakEvenMonths,
        riskScore,
        monthlySavingsTarget,
        monthlySavingsCurrent,
        salaryProjection,
        costBreakdown,
        transitionMonths: transitionInfo.months,
        fiveYearGain,
        monthlyEMI: Math.round(totalTransitionCost / 12), // If financed
      });
      
      setIsAnalyzing(false);
    }, 2000);
  };

  const riskColor = (v: number) => v >= 70 ? "text-rose-500" : v >= 40 ? "text-amber-500" : "text-emerald-500";
  const riskLabel = (v: number) => v >= 70 ? "High Risk" : v >= 40 ? "Moderate Risk" : "Low Risk";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display">
          Financial <span className="gradient-text">Decision Engine</span>
        </h1>
        <p className="text-muted-foreground mt-1">Calculate the true financial impact of your next career move in ₹.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <motion.div className="lg:col-span-4 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" /> Financial Parameters
              </CardTitle>
              <CardDescription>Enter your current situation and target career</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Annual Salary (in LPA)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <Input type="number" value={currentSalary} onChange={e => setCurrentSalary(e.target.value)} className="bg-background pl-8" placeholder="e.g. 5 (for 5 LPA)" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">LPA</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Career Role</Label>
                <Input value={targetRole} onChange={e => setTargetRole(e.target.value)} className="bg-background" placeholder="e.g. Machine Learning Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Target Experience Level</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresher">Fresher (0-1 yr)</SelectItem>
                    <SelectItem value="mid">Mid-Level (2-5 yrs)</SelectItem>
                    <SelectItem value="senior">Senior (5-10 yrs)</SelectItem>
                    <SelectItem value="lead">Lead/Principal (10+ yrs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="gradient-bg w-full" size="lg" onClick={handleAnalyze} disabled={isAnalyzing || !currentSalary || !targetRole}>
                {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating ROI...</> : <><Sparkles className="w-4 h-4 mr-2" /> Analyze Financial Impact</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div className="lg:col-span-8 space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card h-full min-h-[400px] flex items-center justify-center border-dashed border-2">
                <div className="text-center space-y-4 max-w-sm px-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <IndianRupee className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-display">Awaiting Analysis</h3>
                  <p className="text-muted-foreground text-sm">Enter your current salary and target role to see a complete financial projection.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Projected Salary</p>
                      <p className="text-xl font-bold text-emerald-500 font-display">{formatINR(result.projectedSalary)}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card bg-blue-500/5 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                      <IndianRupee className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">5-Year ROI</p>
                      <p className="text-xl font-bold text-blue-500 font-display">{result.roi}%</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card bg-amber-500/5 border-amber-500/20">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Break-Even</p>
                      <p className="text-xl font-bold text-amber-500 font-display">{result.breakEvenMonths} mo</p>
                    </CardContent>
                  </Card>
                  <Card className={`glass-card ${result.riskScore < 40 ? 'bg-emerald-500/5 border-emerald-500/20' : result.riskScore < 70 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                    <CardContent className="p-4 text-center">
                      <Shield className={`w-5 h-5 ${riskColor(result.riskScore)} mx-auto mb-1`} />
                      <p className="text-xs text-muted-foreground">Risk Level</p>
                      <p className={`text-xl font-bold font-display ${riskColor(result.riskScore)}`}>{riskLabel(result.riskScore)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Salary Comparison Chart */}
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">5-Year Salary Trajectory</CardTitle>
                    <CardDescription>Current path vs new career path</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.salaryProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatINR(v)} />
                          <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                          <Legend />
                          <Line type="monotone" dataKey="Current Path" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="New Path" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Transition Cost Breakdown */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Transition Investment</CardTitle>
                      <CardDescription>Total: {formatINR(result.totalTransitionCost)} over {result.transitionMonths} months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.costBreakdown.map((item: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">{item.name}</span>
                              <span className="font-medium">{formatINR(item.value)}</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(item.value / result.costBreakdown.reduce((s: number, c: any) => s + c.value, 0)) * 100}%`, backgroundColor: item.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Summary */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Monthly Salary (New)</span>
                        <span className="font-bold text-emerald-500">{formatINR(Math.round(result.projectedSalary / 12))}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Monthly Savings (50/30/20)</span>
                        <span className="font-bold">{formatINR(Math.round(result.monthlySavingsTarget))}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">5-Year Earnings Gain</span>
                        <span className="font-bold text-primary">{formatINR(result.fiveYearGain)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Monthly EMI (if financed)</span>
                        <span className="font-medium">{formatINR(result.monthlyEMI)}/mo</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-muted-foreground">Transition Period</span>
                        <span className="font-medium">{result.transitionMonths} months</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
