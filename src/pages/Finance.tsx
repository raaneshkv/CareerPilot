import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calculator, Briefcase, IndianRupee, Target, TrendingUp, AlertTriangle, CheckCircle2, AlertCircle, TrendingDown, Sparkles, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

const Finance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  // Inputs
  const [currentIncome, setCurrentIncome] = useState("60000");
  const [targetRole, setTargetRole] = useState("");
  const [interests, setInterests] = useState("");
  const [transitionCost, setTransitionCost] = useState("15000");
  
  // Outputs
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnalyzed(false);

    // AI Simulation Delay
    setTimeout(() => {
      const incomeStr = parseInt(currentIncome.replace(/[^0-9]/g, "")) || 0;
      const costStr = parseInt(transitionCost.replace(/[^0-9]/g, "")) || 0;
      const role = targetRole.toLowerCase();
      
      let baseMultiplier = 1.1;
      let flatBump = 10000;
      let riskLevel = "NOT ADVISED";
      let score = 55;
      let breakEven = 3.5;
      let affordability = 40;

      if (role.includes("engineer") || role.includes("developer") || role.includes("data") || role.includes("ai")) {
        baseMultiplier = 1.6;
        flatBump = 35000;
        riskLevel = "GO";
        score = 94;
        breakEven = 0.8;
        affordability = 85;
      } else if (role.includes("manager") || role.includes("director") || role.includes("lead")) {
        baseMultiplier = 1.35;
        flatBump = 20000;
        riskLevel = "RISKY";
        score = 76;
        breakEven = 1.8;
        affordability = 60;
      } else if (role.length > 3) {
        baseMultiplier = 1.2;
        flatBump = 15000;
        riskLevel = "STEADY";
        score = 82;
        breakEven = 2.1;
        affordability = 70;
      }

      const predictedIncome = Math.round((incomeStr * baseMultiplier) + flatBump);
      const monthlyAffordability = Math.round((incomeStr / 12) * (affordability / 100));

      // Generate projection data
      const chartData = Array.from({ length: 6 }).map((_, i) => ({
        year: `Year ${i}`,
        currentStatus: Math.round(incomeStr * Math.pow(1.03, i)),
        targetStatus: i === 0 ? incomeStr : Math.round(predictedIncome * Math.pow(1.05, i - 1) - (i === 1 ? costStr : 0)),
      }));

      setResult({
        score,
        riskLevel,
        predictedIncome,
        breakEven,
        monthlyAffordability,
        affordabilityPercentage: affordability,
        chartData
      });

      setLoading(false);
      setAnalyzed(true);
    }, 2500);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "GO": return "text-emerald-400 border-emerald-400/20 bg-emerald-400/10";
      case "STEADY": return "text-blue-400 border-blue-400/20 bg-blue-400/10";
      case "RISKY": return "text-amber-400 border-amber-400/20 bg-amber-400/10";
      default: return "text-rose-400 border-rose-400/20 bg-rose-400/10";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "GO": return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case "STEADY": return <TrendingUp className="w-6 h-6 text-blue-400" />;
      case "RISKY": return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      default: return <AlertCircle className="w-6 h-6 text-rose-400" />;
    }
  };

  return (
    <div className="relative w-full h-full pb-20">
      <div className="flex flex-col mb-8 mt-2">
        <h1 className="text-4xl font-black font-display tracking-tight text-white mb-2 flex items-center gap-3">
          <Calculator className="w-10 h-10 text-primary" />
          Financial Decision <span className="gradient-text bg-300% animate-[shine_6s_linear_infinite]">Engine</span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl">
          Quantify the ROI of your next career move. Input your transition parameters to forecast constraints, calculate break-even timelines, and receive an AI-driven risk assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 shadow-[0_0_80px_rgba(139,92,246,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            
            <form onSubmit={handleAnalyze} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="income" className="text-white/70 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary" /> Current Annual Net Income
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="60000"
                    value={currentIncome}
                    onChange={(e) => setCurrentIncome(e.target.value)}
                    required
                    className="bg-black/50 border-white/10 focus-visible:ring-primary text-white h-12 rounded-xl text-lg font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetRole" className="text-white/70 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Target Role
                  </Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g. Senior Machine Learning Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    required
                    className="bg-black/50 border-white/10 focus-visible:ring-primary text-white h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests" className="text-white/70 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Core Interests / Skills
                  </Label>
                  <Input
                    id="interests"
                    placeholder="e.g. Python, AI, Problem Solving"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="bg-black/50 border-white/10 focus-visible:ring-primary text-white h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost" className="text-white/70 flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4 text-primary" /> Estimated Transition Cost (₹)
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="15000"
                    value={transitionCost}
                    onChange={(e) => setTransitionCost(e.target.value)}
                    required
                    className="bg-black/50 border-white/10 focus-visible:ring-primary text-white h-12 rounded-xl text-lg font-mono"
                  />
                  <p className="text-xs text-white/40">Includes bootcamps, courses, relocation, etc.</p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-xl gradient-bg text-white font-bold text-sm sm:text-base md:text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all uppercase tracking-wide relative overflow-hidden group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Analyzing Data...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Execute Matrix Simulation
                  </span>
                )}
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Right Column - Results Dashboard */}
        <div className="lg:col-span-2 relative min-h-[500px]">
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center glass-card rounded-3xl z-20 border border-white/5"
            >
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                <div className="absolute inset-2 rounded-full border-r-2 border-secondary animate-spin reverse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-xl font-display font-medium text-white/80 animate-pulse">Computing Risk Vectors...</p>
              <p className="text-sm text-white/40 mt-2 font-mono">Assessing ROI against market trends</p>
            </motion.div>
          )}

          {!analyzed && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <TrendingDown className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/40 text-lg font-medium">Awaiting Matrix Parameters</p>
              <p className="text-white/30 text-sm mt-2 max-w-sm text-center">Execute the simulation to generate a customized financial forecast and risk assessment.</p>
            </div>
          )}

          {analyzed && !loading && result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Top Row Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Career Score */}
                <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)]">
                  <p className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-4">AI Matrix Score</p>
                  
                  {/* Custom SVG Score Gauge */}
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 377 }}
                        animate={{ strokeDashoffset: 377 - (377 * result.score) / 100 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="377" 
                        className={`text-${result.score > 80 ? 'emerald' : result.score > 60 ? 'amber' : 'rose'}-400 drop-shadow-[0_0_10px_rgba(var(--color-${result.score > 80 ? 'emerald' : result.score > 60 ? 'amber' : 'rose'}-400),0.8))]`} 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black font-display text-white">{result.score}</span>
                      <span className="text-xs text-white/50">/100</span>
                    </div>
                  </div>
                </div>

                {/* Risk Level */}
                <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center col-span-1 md:col-span-2">
                  <p className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-2">Algorithm Assessment</p>
                  <div className={`mt-2 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border ${getRiskColor(result.riskLevel)}`}>
                    {getRiskIcon(result.riskLevel)}
                    <span className="text-3xl font-black font-display tracking-wide">{result.riskLevel}</span>
                  </div>
                  <div className="mt-6 w-full grid grid-cols-2 gap-4">
                     <div className="bg-black/30 p-4 rounded-2xl flex flex-col items-center">
                       <span className="text-white/40 text-xs mb-1">Time to Break Even</span>
                       <span className="text-2xl font-bold font-mono text-white">{result.breakEven} <span className="text-sm text-white/50">Yrs</span></span>
                     </div>
                     <div className="bg-black/30 p-4 rounded-2xl flex flex-col items-center">
                       <span className="text-white/40 text-xs mb-1">Predicted Base</span>
                       <span className="text-2xl font-bold font-mono text-emerald-400">₹{result.predictedIncome.toLocaleString()}</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-display font-medium text-white">5-Year Financial Projection</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-white/20" />
                      <span className="text-xs text-white/50">Current Trajectory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-xs text-white/50">Simulated Path</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="year" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000000dd', borderColor: '#ffffff20', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                      />
                      <Area type="monotone" dataKey="currentStatus" name="Current Path" stroke="#ffffff40" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={2} />
                      <Area type="monotone" dataKey="targetStatus" name="Simulated Path" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTarget)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Metrics */}
              <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5">
                 <div className="flex justify-between items-end mb-4">
                   <div>
                     <h3 className="text-lg font-display font-medium text-white">Monthly Transition Affordability</h3>
                     <p className="text-sm text-white/40 mt-1">Estimated buffer available during transition period</p>
                   </div>
                   <div className="text-right">
                     <span className="text-2xl font-bold text-white">₹{result.monthlyAffordability.toLocaleString()}</span>
                     <span className="text-xs text-white/40 block">/ month</span>
                   </div>
                 </div>
                 <Progress value={result.affordabilityPercentage} className="h-3 bg-black/50" />
                 <div className="flex justify-between mt-2">
                   <span className="text-xs text-white/30">High Constraint</span>
                   <span className="text-xs text-white/30">Comfortable</span>
                 </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finance;
