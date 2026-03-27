import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, AlertTriangle } from "lucide-react";

// Mock Data
const demandData = [
  { role: "AI Engineer", demand: 95, supply: 40 },
  { role: "Data Scientist", demand: 85, supply: 60 },
  { role: "Cloud Architect", demand: 80, supply: 45 },
  { role: "Full Stack Dev", demand: 75, supply: 80 },
  { role: "Cybersecurity", demand: 90, supply: 35 },
];

const salaryTrendsData = [
  { year: "2022", ai: 120000, web: 100000 },
  { year: "2023", ai: 135000, web: 105000 },
  { year: "2024", ai: 160000, web: 110000 },
  { year: "2025", ai: 190000, web: 115000 },
  { year: "2026", ai: 220000, web: 120000 },
];

const decliningJobs = [
  { role: "Manual QA Tester", drop: "-35%", reason: "AI Automation tools" },
  { role: "Basic Copywriter", drop: "-45%", reason: "LLMs generating first drafts" },
  { role: "Data Entry Clerk", drop: "-60%", reason: "OCR and NLP advancements" },
];

export default function Trends() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
          Real-Time <span className="gradient-text">Career Trends</span> Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Data-driven insights to help you avoid outdated career choices and maximize earning potential.</p>
      </motion.div>

      {/* Top Metrics Row */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Top Growth Sector</p>
              <h3 className="text-xl font-bold">Generative AI</h3>
              <p className="text-xs text-emerald-500 font-medium">+124% YoY</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Highest Avg Salary</p>
              <h3 className="text-xl font-bold">$185k</h3>
              <p className="text-xs text-muted-foreground">AI / ML Engineers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Most Openings</p>
              <h3 className="text-xl font-bold">Cloud Architect</h3>
              <p className="text-xs text-blue-500 font-medium">45k+ active jobs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-destructive/80">High Risk Sector</p>
              <h3 className="text-xl font-bold text-destructive">Manual QA</h3>
              <p className="text-xs text-destructive/80 font-medium">-35% Demand</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Charts */}
        <motion.div 
          className="lg:col-span-2 space-y-8"
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Talent Demand vs Supply (2026)</CardTitle>
              <CardDescription>Roles where demand significantly outpaces available talent.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demandData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="role" tick={{fill: "hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: "hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Bar dataKey="demand" name="Market Demand" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="supply" name="Talent Supply" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Salary Trajectory: AI vs Traditional Web Dev</CardTitle>
              <CardDescription>Historical and projected average salaries.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salaryTrendsData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" tick={{fill: "hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} />
                    <YAxis 
                      tick={{fill: "hsl(var(--muted-foreground))"}} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="ai" name="AI/ML Engineer" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAi)" />
                    <Area type="monotone" dataKey="web" name="Web Developer" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorWeb)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Sidebar - Warnings */}
        <motion.div 
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="glass-card border-destructive/20 bg-gradient-to-b from-background to-destructive/5 text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <TrendingDown className="w-5 h-5" /> Outdated Career Warnings
              </CardTitle>
              <CardDescription>
                AI predicts these roles will see severe decline in the next 3 years. Avoid transitioning into these.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {decliningJobs.map((job, idx) => (
                <div key={idx} className="p-4 bg-background border border-border rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold">{job.role}</h4>
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                      {job.drop}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    {job.reason}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="text-primary-foreground flex items-center gap-2">
                <Users className="w-5 h-5" /> Need Advice?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-primary-foreground/90 leading-relaxed">
                Not sure how to pivot your career given these trends? Talk to our AI Career Mentor to build a transition strategy.
              </p>
              <Link to="/career-chat" className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-background text-primary hover:bg-background/90 font-bold">
                Talk to AI Mentor
              </Link>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
