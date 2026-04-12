import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp, TrendingDown, Zap, Briefcase, BarChart3,
  ArrowUpRight, Flame, IndianRupee, Brain, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/api";

/* ===== Real-ish Market Data (2025-2026 India + Global) ===== */
const MARKET_DATA: Record<string, {
  demand: number; avgSalaryINR: string; avgSalaryUSD: string;
  yoyGrowth: number; openRoles: number;
}> = {
  "React":           { demand: 95, avgSalaryINR: "₹14L", avgSalaryUSD: "$105K", yoyGrowth: 12,  openRoles: 45000 },
  "Python":          { demand: 98, avgSalaryINR: "₹16L", avgSalaryUSD: "$120K", yoyGrowth: 18,  openRoles: 62000 },
  "JavaScript":      { demand: 92, avgSalaryINR: "₹12L", avgSalaryUSD: "$100K", yoyGrowth: 8,   openRoles: 55000 },
  "TypeScript":      { demand: 90, avgSalaryINR: "₹15L", avgSalaryUSD: "$110K", yoyGrowth: 25,  openRoles: 32000 },
  "Node.js":         { demand: 85, avgSalaryINR: "₹13L", avgSalaryUSD: "$105K", yoyGrowth: 10,  openRoles: 28000 },
  "AWS":             { demand: 92, avgSalaryINR: "₹18L", avgSalaryUSD: "$130K", yoyGrowth: 22,  openRoles: 38000 },
  "Docker":          { demand: 88, avgSalaryINR: "₹16L", avgSalaryUSD: "$120K", yoyGrowth: 15,  openRoles: 25000 },
  "Kubernetes":      { demand: 86, avgSalaryINR: "₹20L", avgSalaryUSD: "$135K", yoyGrowth: 28,  openRoles: 18000 },
  "Machine Learning":{ demand: 94, avgSalaryINR: "₹22L", avgSalaryUSD: "$150K", yoyGrowth: 35,  openRoles: 22000 },
  "TensorFlow":      { demand: 80, avgSalaryINR: "₹20L", avgSalaryUSD: "$140K", yoyGrowth: 15,  openRoles: 12000 },
  "SQL":             { demand: 90, avgSalaryINR: "₹10L", avgSalaryUSD: "$90K",  yoyGrowth: 5,   openRoles: 50000 },
  "Java":            { demand: 82, avgSalaryINR: "₹14L", avgSalaryUSD: "$110K", yoyGrowth: 3,   openRoles: 40000 },
  "Go":              { demand: 78, avgSalaryINR: "₹18L", avgSalaryUSD: "$130K", yoyGrowth: 30,  openRoles: 8000  },
  "Rust":            { demand: 65, avgSalaryINR: "₹22L", avgSalaryUSD: "$145K", yoyGrowth: 45,  openRoles: 3000  },
  "Flutter":         { demand: 72, avgSalaryINR: "₹12L", avgSalaryUSD: "$100K", yoyGrowth: 20,  openRoles: 10000 },
  "Vue.js":          { demand: 68, avgSalaryINR: "₹12L", avgSalaryUSD: "$95K",  yoyGrowth: 8,   openRoles: 8000  },
  "Angular":         { demand: 70, avgSalaryINR: "₹13L", avgSalaryUSD: "$100K", yoyGrowth: -5,  openRoles: 15000 },
  "MongoDB":         { demand: 75, avgSalaryINR: "₹13L", avgSalaryUSD: "$105K", yoyGrowth: 10,  openRoles: 12000 },
  "GraphQL":         { demand: 70, avgSalaryINR: "₹15L", avgSalaryUSD: "$115K", yoyGrowth: 18,  openRoles: 6000  },
  "Next.js":         { demand: 85, avgSalaryINR: "₹16L", avgSalaryUSD: "$115K", yoyGrowth: 40,  openRoles: 15000 },
  "Figma":           { demand: 82, avgSalaryINR: "₹10L", avgSalaryUSD: "$85K",  yoyGrowth: 12,  openRoles: 12000 },
  "CI/CD":           { demand: 85, avgSalaryINR: "₹16L", avgSalaryUSD: "$120K", yoyGrowth: 15,  openRoles: 20000 },
  "System Design":   { demand: 80, avgSalaryINR: "₹20L", avgSalaryUSD: "$140K", yoyGrowth: 12,  openRoles: 10000 },
  "Deep Learning":   { demand: 88, avgSalaryINR: "₹25L", avgSalaryUSD: "$155K", yoyGrowth: 38,  openRoles: 8000  },
  "GenAI":           { demand: 97, avgSalaryINR: "₹28L", avgSalaryUSD: "$165K", yoyGrowth: 120, openRoles: 15000 },
  "LLMs":            { demand: 95, avgSalaryINR: "₹30L", avgSalaryUSD: "$170K", yoyGrowth: 200, openRoles: 10000 },
};

const ALL_SKILL_NAMES = Object.keys(MARKET_DATA);

const TOP_RISING   = [
  { skill: "GenAI / LLMs",   change: "+200%", color: "text-emerald-500" },
  { skill: "Rust",           change: "+45%",  color: "text-emerald-500" },
  { skill: "Next.js",        change: "+40%",  color: "text-emerald-500" },
  { skill: "Deep Learning",  change: "+38%",  color: "text-emerald-500" },
  { skill: "Kubernetes",     change: "+28%",  color: "text-emerald-500" },
];
const TOP_DECLINING = [
  { skill: "Angular",       change: "-5%",  color: "text-rose-500" },
  { skill: "jQuery",        change: "-15%", color: "text-rose-500" },
  { skill: "PHP (legacy)",  change: "-8%",  color: "text-rose-500" },
];

export default function Trends() {
  const { user } = useAuth();

  // Model relevance state
  const [modelRelevance, setModelRelevance] = useState<Record<string, number>>({});
  const [modelLoading, setModelLoading]     = useState(false);
  const [modelPowered, setModelPowered]     = useState(false);

  const { data: latestRoadmap } = useQuery({
    queryKey: ["latest-roadmap-trends", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("roadmaps")
        .select("roadmap_data")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Extract user skills from latest roadmap
  const userSkills: string[] = [];
  if (latestRoadmap?.roadmap_data) {
    const rd = latestRoadmap.roadmap_data as any;
    if (rd.current_skills) userSkills.push(...rd.current_skills);
    if (rd.nodes) rd.nodes.forEach((n: any) => { if (n.title) userSkills.push(n.title); });
  }

  // Call /skills/rank whenever userSkills are available
  useEffect(() => {
    if (!userSkills.length) return;
    const userText = userSkills.join(", ");
    setModelLoading(true);
    fetch(`${API_URL}/skills/rank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_skills_text: userText, market_skills: ALL_SKILL_NAMES }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.ranked_skills) {
          const map: Record<string, number> = {};
          data.ranked_skills.forEach((r: any) => { map[r.skill] = r.relevance_score; });
          setModelRelevance(map);
          setModelPowered(true);
        }
      })
      .catch(() => {})
      .finally(() => setModelLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userSkills)]);

  // Heuristic match
  const userMarketData = userSkills.length > 0
    ? Object.entries(MARKET_DATA)
        .filter(([skill]) => userSkills.some(us =>
          us.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(us.toLowerCase())))
        .map(([skill, data]) => ({ skill, ...data }))
    : [];

  // If no user skills — show top 8 by demand
  const displaySkills = userMarketData.length > 0
    ? userMarketData
    : Object.entries(MARKET_DATA).sort((a, b) => b[1].demand - a[1].demand).slice(0, 8).map(([skill, data]) => ({ skill, ...data }));

  // All-skills table (model-ranked when available, else demand-sorted)
  const allSkillsTable = modelPowered
    ? Object.entries(MARKET_DATA)
        .map(([skill, data]) => ({ skill, ...data, relevanceScore: modelRelevance[skill] ?? 0 }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
    : Object.entries(MARKET_DATA)
        .map(([skill, data]) => ({ skill, ...data, relevanceScore: null }))
        .sort((a, b) => b.demand - a.demand);

  const demandChart = displaySkills.slice(0, 8).map(s => ({ name: s.skill, Demand: s.demand }));
  const growthChart = displaySkills.slice(0, 8).map(s => ({ name: s.skill, Growth: s.yoyGrowth }));

  // Top-3 most relevant to user by model
  const top3Relevant = modelPowered
    ? allSkillsTable.filter(s => !userSkills.some(us => us.toLowerCase().includes(s.skill.toLowerCase()))).slice(0, 3)
    : [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display">
          Market <span className="gradient-text">Trends</span>
          <span className="text-sm text-muted-foreground font-normal ml-2">2025-2026</span>
        </h1>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-muted-foreground">
            {userMarketData.length > 0
              ? `Showing trends for ${userMarketData.length} skills from your roadmap.`
              : "Generate a roadmap to see trends relevant to your skills. Showing top trending."}
          </p>
          {modelLoading && (
            <span className="flex items-center gap-1 text-xs text-violet-400">
              <Loader2 className="w-3 h-3 animate-spin" /> AI ranking skills…
            </span>
          )}
          {modelPowered && !modelLoading && (
            <span className="flex items-center gap-1 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2.5 py-0.5">
              <Brain className="w-3 h-3" /> Relevance powered by trained model
            </span>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame,        label: "Hottest Skill",    value: "GenAI / LLMs",  color: "emerald" },
          { icon: IndianRupee,  label: "Highest Paying",   value: "LLMs · ₹30L",   color: "blue"    },
          { icon: Briefcase,    label: "Most Open Roles",  value: "Python · 62K+", color: "purple"  },
          { icon: TrendingUp,   label: "Fastest Growing",  value: "LLMs +200%",    color: "amber"   },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={`glass-card bg-${s.color}-500/5 border-${s.color}-500/20`}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 text-${s.color}-500`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`font-bold text-${s.color}-500`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Model-recommended skills for user */}
      {top3Relevant.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-violet-500/20 bg-violet-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                <span>Skills to Learn Next</span>
                <span className="text-[10px] bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded px-1.5 py-0.5 font-bold">AI RANKED</span>
              </CardTitle>
              <CardDescription>Most semantically relevant to your existing skill set</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {top3Relevant.map((s, i) => (
                  <motion.div key={s.skill} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between rounded-xl border border-violet-500/20 bg-card/60 px-4 py-3">
                    <div>
                      <p className="font-semibold text-sm">{s.skill}</p>
                      <p className="text-xs text-emerald-500">{s.avgSalaryINR} avg</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-violet-400">{Math.round(s.relevanceScore)}%</div>
                      <p className="text-[10px] text-muted-foreground">relevance</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Demand Index</CardTitle>
            <CardDescription>{userMarketData.length > 0 ? "Your skills" : "Top trending skills"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demandChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="Demand" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> YoY Growth %</CardTitle>
            <CardDescription>Year-over-year demand growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="Growth" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Table — model-ranked w/ Relevance column */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {modelPowered && userSkills.length > 0 ? "Skills Ranked by AI Relevance" : (userMarketData.length > 0 ? "Your Skills vs Market" : "Top Skills Market Data")}
            {modelPowered && userSkills.length > 0 && (
              <span className="text-[10px] bg-violet-500/15 text-violet-400 border border-violet-500/30 rounded px-1.5 py-0.5 font-bold ml-1">MODEL SORTED</span>
            )}
          </CardTitle>
          {modelPowered && userSkills.length > 0 && (
            <CardDescription>Sorted by how semantically relevant each market skill is to your existing skill set</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left border-b border-border">
                  <th className="py-3 px-2 font-medium">Skill</th>
                  <th className="py-3 px-2 font-medium">Demand</th>
                  <th className="py-3 px-2 font-medium">Avg Salary (IN)</th>
                  <th className="py-3 px-2 font-medium">Avg Salary (US)</th>
                  <th className="py-3 px-2 font-medium">YoY Growth</th>
                  <th className="py-3 px-2 font-medium">Open Roles</th>
                  {(modelPowered && userSkills.length > 0) && (
                    <th className="py-3 px-2 font-medium">
                      <span className="flex items-center gap-1 text-violet-400">
                        <Brain className="w-3.5 h-3.5" /> Relevance
                      </span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {allSkillsTable.map((s, i) => {
                  const isHighRelevance = s.relevanceScore !== null && s.relevanceScore >= 60;
                  return (
                    <motion.tr key={s.skill} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className={`border-b border-border/50 hover:bg-muted/30 ${isHighRelevance ? "bg-violet-500/5" : ""}`}>
                      <td className="py-3 px-2 font-semibold flex items-center gap-2">
                        {s.skill}
                        {isHighRelevance && <span className="text-[9px] bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded px-1 py-0.5 font-bold">YOU</span>}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${s.demand}%` }} />
                          </div>
                          <span className="text-xs">{s.demand}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium text-emerald-500">{s.avgSalaryINR}</td>
                      <td className="py-3 px-2 text-muted-foreground">{s.avgSalaryUSD}</td>
                      <td className={`py-3 px-2 font-medium ${s.yoyGrowth >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {s.yoyGrowth >= 0 ? "+" : ""}{s.yoyGrowth}%
                      </td>
                      <td className="py-3 px-2">{s.openRoles.toLocaleString()}</td>
                      {(modelPowered && userSkills.length > 0) && (
                        <td className="py-3 px-2">
                          {s.relevanceScore !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div className="h-full rounded-full bg-violet-500" style={{ width: `${s.relevanceScore}%` }} />
                              </div>
                              <span className={`text-xs font-semibold ${isHighRelevance ? "text-violet-400" : "text-muted-foreground"}`}>
                                {Math.round(s.relevanceScore)}%
                              </span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rising & Declining */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-emerald-500" /> Rising Stars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {TOP_RISING.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <span className="font-medium">{s.skill}</span>
                <span className={`font-bold ${s.color}`}>{s.change}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="glass-card bg-rose-500/5 border-rose-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><TrendingDown className="w-5 h-5 text-rose-500" /> Declining</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {TOP_DECLINING.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <span className="font-medium">{s.skill}</span>
                <span className={`font-bold ${s.color}`}>{s.change}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
