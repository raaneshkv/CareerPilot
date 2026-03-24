import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";
import { Sparkles, Loader2, ArrowRight, Brain, ShieldCheck, Clock, TrendingUp } from "lucide-react";

export default function Simulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  
  const [currentRole, setCurrentRole] = useState("Junior Web Developer");
  const [targetRole, setTargetRole] = useState("Cloud Solutions Architect");
  const [timeframe, setTimeframe] = useState("5");

  const [simulationData, setSimulationData] = useState<any>(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    setHasResult(false);

    setTimeout(() => {
      setSimulationData({
        salaryProjection: [
          { year: "Year 1", salary: 75000 },
          { year: "Year 2", salary: 95000 },
          { year: "Year 3", salary: 125000 },
          { year: "Year 4", salary: 150000 },
          { year: "Year 5", salary: 180000 },
        ],
        effort: "High - Requires 15hrs/week of studying AWS/Azure certifications.",
        stability: "Very High - 92% projected job retention rate.",
        workLifeBalance: "Moderate - High stress initially during transition, normalizes by Year 3.",
        milestones: [
          "Month 6: AWS Solutions Architect Associate Cert",
          "Year 1.5: Transition to Mid-Level DevOps or Cloud Native Dev",
          "Year 3: First Lead Architect Role",
          "Year 5: Senior Cloud Solutions Architect"
        ]
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
        {/* Input Form */}
        <motion.div 
          className="lg:col-span-4 space-y-6"
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="glass-card bg-sidebar/50 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" /> Setup Simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <Input value={currentRole} onChange={e => setCurrentRole(e.target.value)} className="bg-background"/>
              </div>
              <div className="space-y-2">
                 <Label>What if I become a...</Label>
                 <Input value={targetRole} onChange={e => setTargetRole(e.target.value)} className="bg-background border-primary/50 shadow-sm shadow-primary/20"/>
              </div>
              <div className="space-y-2">
                 <Label>Timeframe (Years)</Label>
                 <Select value={timeframe} onValueChange={setTimeframe}>
                   <SelectTrigger className="bg-background">
                     <SelectValue placeholder="Select timeframe" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="3">3 Years</SelectItem>
                     <SelectItem value="5">5 Years</SelectItem>
                     <SelectItem value="10">10 Years</SelectItem>
                   </SelectContent>
                 </Select>
              </div>

              <Button 
                className="gradient-bg w-full mt-4" 
                size="lg"
                onClick={handleSimulate}
                disabled={isSimulating || !currentRole || !targetRole}
              >
                {isSimulating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running Multiverse Scan...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Run Simulation</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Output Visualization */}
        <motion.div 
          className="lg:col-span-8 space-y-6"
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {!hasResult ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card h-full min-h-[400px] flex items-center justify-center border-dashed border-2"
              >
                <div className="text-center space-y-4 max-w-sm px-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                     <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-display">Awaiting Simulation</h3>
                  <p className="text-muted-foreground text-sm">
                    Enter your target role and hit "Run Simulation" to see your predicted future, including effort vs reward analysis.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="glass-card bg-rose-500/5 border-rose-500/20">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm text-rose-500 flex items-center gap-2">
                         <Clock className="w-4 h-4" /> Required Effort
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">{simulationData.effort}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm text-emerald-500 flex items-center gap-2">
                         <ShieldCheck className="w-4 h-4" /> Job Stability
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">{simulationData.stability}</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card bg-blue-500/5 border-blue-500/20">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm text-blue-500 flex items-center gap-2">
                         <Brain className="w-4 h-4" /> Work-Life Balance
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">{simulationData.workLifeBalance}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Salary Chart */}
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <CardTitle>Predicted Salary Trajectory</CardTitle>
                    <CardDescription>{currentRole} → {targetRole}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simulationData.salaryProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="year" tick={{fill: "hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} />
                          <YAxis 
                            tick={{fill: "hsl(var(--muted-foreground))"}} 
                            axisLine={false} 
                            tickLine={false}
                            tickFormatter={(value) => `$${value/1000}k`}
                          />
                          <Tooltip 
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                          />
                          <Line type="monotone" dataKey="salary" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Milestones timeline */}
                <Card className="glass-card">
                   <CardHeader>
                     <CardTitle className="text-lg">Key Milestones</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="space-y-4">
                        {simulationData.milestones.map((milestone: string, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-primary mt-1.5 shrink-0" />
                              {idx !== simulationData.milestones.length - 1 && (
                                <div className="w-0.5 h-full bg-border my-1" />
                              )}
                            </div>
                            <div className="pb-4">
                              <p className="font-medium">{milestone.split(": ")[1]}</p>
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
