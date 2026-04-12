import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, ArrowRight, GraduationCap, Briefcase, BarChart3,
  TrendingUp, CheckCircle2, AlertTriangle, XCircle, Sparkles,
  IndianRupee, Calendar, Target, Lightbulb, Loader2, RotateCcw,
  Brain, DollarSign, Clock, Award, Zap, Shield, Users, Activity,
  PieChart, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

/* ─── Types matching the new ML-backed API response ──────────── */
interface SkillAnalysis {
  skills_score: number;
  matched_skills: number;
  total_required_skills: number;
}

interface SalaryPrediction {
  monthly_salary: number;
  annual_salary: number;
  location_used: string;
}

interface ROIAnalysis {
  roi_value: number;
  payback_period_months: number;
  opportunity_cost: number;
  future_salary_3y: number;
}

interface Decision {
  verdict: "good" | "moderate" | "risky";
  confidence: number;
  reason: string;
}

interface MarketInsights {
  demand_level: number;
  competition_level: number;
  trend_growth_rate: number;
  interpretation: string;
}

interface FinancialAnalysisResult {
  skill_analysis: SkillAnalysis;
  salary_prediction: SalaryPrediction;
  roi_analysis: ROIAnalysis;
  decision: Decision;
  market_insights: MarketInsights;
  recommendations: string[];
}

/* ─── Wizard step config (3 steps now — no manual market data) ── */
const STEPS = [
  { id: "profile",    title: "Your Profile",   subtitle: "Tell us about yourself",            icon: Briefcase    },
  { id: "job",        title: "Target Role",     subtitle: "The career you're aiming for",      icon: Target       },
  { id: "education",  title: "Education Plan",  subtitle: "The investment you're evaluating",   icon: GraduationCap },
];

/* ─── Helpers ────────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const fmtNum = (n: number, dec = 2) => Number(n).toFixed(dec);

const pct = (n: number) => `${Math.round(n * 100)}%`;

const VERDICT_CONFIG = {
  good:     { label: "Strong Investment",  icon: CheckCircle2,  bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", bar: "bg-emerald-500", glow: "shadow-emerald-500/20" },
  moderate: { label: "Moderate Bet",       icon: AlertTriangle, bg: "bg-amber-500/10 border-amber-500/30",    text: "text-amber-400",  bar: "bg-amber-500",  glow: "shadow-amber-500/20"   },
  risky:    { label: "High Risk",          icon: XCircle,       bg: "bg-rose-500/10 border-rose-500/30",      text: "text-rose-400",   bar: "bg-rose-500",   glow: "shadow-rose-500/20"    },
};

/* ─── Circular gauge component ───────────────────────────────── */
function CircularGauge({ value, label, color, size = 80 }: { value: number; label: string; color: string; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value * circumference);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={5} fill="none" className="text-muted/30" />
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          stroke="currentColor" strokeWidth={5} fill="none" strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="text-center -mt-[calc(50%+8px)] mb-4">
        <p className={`text-sm font-bold font-display ${color}`}>{pct(value)}</p>
      </div>
      <p className="text-[11px] text-muted-foreground text-center leading-tight">{label}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function Finance() {
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<FinancialAnalysisResult | null>(null);

  /* ── Form state ─────────────────────────────────────────────── */
  const [profile, setProfile] = useState({
    current_status:     "",
    skills:             "",   // comma-separated → split on submit
    preferred_location: "",
  });
  const [jobRole, setJobRole] = useState("");
  const [education, setEducation] = useState({
    type:            "",
    name:            "",
    cost:            "",
    duration_months: "",
  });

  /* ── Validation ─────────────────────────────────────────────── */
  const stepValid = [
    !!profile.current_status,
    !!jobRole.trim(),
    education.type && education.name && education.cost && education.duration_months,
  ];

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleAnalyze = async () => {
    setLoading(true);
    const payload = {
      user_profile: {
        current_status:     profile.current_status,
        skills:             profile.skills.split(",").map(s => s.trim()).filter(Boolean),
        preferred_location: profile.preferred_location === "india_average" ? "" : (profile.preferred_location || ""),
      },
      career_choice: { job_role: jobRole },
      education_plan: {
        type:            education.type,
        name:            education.name,
        cost:            parseFloat(education.cost),
        duration_months: parseInt(education.duration_months),
      },
    };

    try {
      const res = await fetch(`${API_URL}/career/financial-analysis`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: FinancialAnalysisResult = await res.json();
      setResult(data);
      toast.success("ML-backed analysis complete!");
    } catch (err: any) {
      toast.error("Analysis failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStep(0); setResult(null); };

  /* ══════════════════════════════════════════════════════════════
     RESULT VIEW
  ═══════════════════════════════════════════════════════════════ */
  if (result) {
    const vc  = VERDICT_CONFIG[result.decision.verdict];
    const roi = result.roi_analysis;
    const sal = result.salary_prediction;
    const skill = result.skill_analysis;
    const mkt = result.market_insights;
    const roiPct = Math.min(100, Math.round((roi.roi_value / 3) * 100));
    const confPct = Math.round(result.decision.confidence * 100);

    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold font-display flex items-center gap-2">
                <IndianRupee className="w-8 h-8 text-primary" />
                Investment <span className="gradient-text">Analysis</span>
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                {education.name} · {education.type}
                <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 rounded px-1.5 py-0.5 font-bold uppercase tracking-wide">ML Model</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" /> New Analysis
            </Button>
          </div>
        </motion.div>

        {/* ── Verdict banner ── */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className={`glass-card border-2 ${vc.bg} ${vc.glow} shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${vc.bg}`}>
                  <vc.icon className={`w-8 h-8 ${vc.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-2xl font-bold font-display ${vc.text}`}>{vc.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border font-bold uppercase tracking-wide ${vc.bg} ${vc.text}`}>
                      {result.decision.verdict}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full border font-bold bg-primary/10 border-primary/30 text-primary">
                      {confPct}% confidence
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{result.decision.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-4xl font-bold font-display ${vc.text}`}>{fmtNum(roi.roi_value)}×</div>
                  <p className="text-xs text-muted-foreground">ROI</p>
                </div>
              </div>
              {/* ROI progress bar */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>ROI Progress (target: 1.5×)</span>
                  <span>{fmtNum(roi.roi_value, 2)}×</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${vc.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${roiPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Skill Analysis Card ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card bg-cyan-500/5 border-cyan-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" /> Skill Analysis
                <span className="text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded px-1.5 py-0.5 font-bold ml-1">AI</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {/* Circular skill score gauge */}
                <div className="shrink-0">
                  <CircularGauge value={skill.skills_score} label="Skills Match" color="text-cyan-400" size={90} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Matched Skills</span>
                    <span className="font-bold text-cyan-400">{skill.matched_skills} / {skill.total_required_skills}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.skills_score * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {skill.skills_score >= 0.8
                      ? "🎯 Excellent skill match — you're well-prepared for this role"
                      : skill.skills_score >= 0.5
                        ? "📊 Decent overlap — some upskilling recommended"
                        : "⚠️ Low match — significant skill development needed"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Key Metrics Grid ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: IndianRupee, label: "Est. Monthly Salary",
                value: fmt(sal.monthly_salary),
                sub: `${fmt(sal.annual_salary)}/yr · ${sal.location_used}`,
                color: "emerald",
              },
              {
                icon: TrendingUp, label: "3-Year Projection",
                value: fmt(roi.future_salary_3y),
                sub: `+${fmtNum(mkt.trend_growth_rate)}%/yr growth`,
                color: "blue",
              },
              {
                icon: Clock, label: "Payback Period",
                value: `${fmtNum(roi.payback_period_months, 1)} mo`,
                sub: roi.payback_period_months > 36 ? "⚠ Long payback" : "✓ Healthy",
                color: roi.payback_period_months > 36 ? "amber" : "emerald",
              },
              {
                icon: DollarSign, label: "Opportunity Cost",
                value: fmt(roi.opportunity_cost),
                sub: `${education.duration_months} mo of potential earnings`,
                color: "purple",
              },
            ].map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
                <Card className={`glass-card bg-${m.color}-500/5 border-${m.color}-500/20`}>
                  <CardContent className="p-4">
                    <m.icon className={`w-5 h-5 text-${m.color}-500 mb-2`} />
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className={`text-lg font-bold font-display text-${m.color}-500 leading-tight`}>{m.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── ROI Deep Dive ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4 text-primary" /> ROI Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Education Cost",     value: fmt(parseFloat(education.cost)), note: "Your investment",            bar: 100,                       color: "bg-rose-500"     },
                  { label: "Annual Salary",       value: fmt(sal.annual_salary),          note: "First year earnings",         bar: Math.min(100, Math.round((sal.annual_salary / (parseFloat(education.cost) * 3)) * 100)), color: "bg-blue-500"     },
                  { label: "3-Year Sal. (proj.)", value: fmt(roi.future_salary_3y),       note: "After growth",                bar: Math.min(100, Math.round((roi.future_salary_3y / (parseFloat(education.cost) * 4)) * 100)), color: "bg-emerald-500"  },
                  { label: "Opportunity Cost",    value: fmt(roi.opportunity_cost),       note: "Earnings foregone in training",bar: Math.min(100, Math.round((roi.opportunity_cost / (parseFloat(education.cost) * 2)) * 100)), color: "bg-amber-500"    },
                ].map((r, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <div className="text-right">
                        <span className="font-semibold">{r.value}</span>
                        <span className="text-xs text-muted-foreground ml-2">({r.note})</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div className={`h-full rounded-full ${r.color}`} initial={{ width: 0 }} animate={{ width: `${r.bar}%` }} transition={{ delay: 0.4 + i * 0.1, duration: 0.7, ease: "easeOut" }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Market Insights + Recommendations ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Market insights — numeric gauges */}
          <Card className="glass-card bg-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-around">
                <CircularGauge value={mkt.demand_level} label="Demand" color="text-emerald-400" />
                <CircularGauge value={mkt.competition_level} label="Competition" color="text-amber-400" />
              </div>
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Growth Rate
                </span>
                <span className="font-bold text-blue-400">{mkt.trend_growth_rate}% / yr</span>
              </div>
              <div className="pt-2 border-t border-border text-xs text-muted-foreground leading-relaxed">
                {mkt.interpretation}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="glass-card bg-violet-500/5 border-violet-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400" /> AI Recommendations
                <span className="text-[9px] bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded px-1.5 py-0.5 font-bold ml-1">ML</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.map((r, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
                    className="flex items-start gap-2.5 text-sm">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-muted-foreground leading-snug">{r}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Summary comparison bar ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-xl bg-muted/40">
                  <p className="text-xs text-muted-foreground">Education Cost</p>
                  <p className="font-bold text-rose-400">{fmt(parseFloat(education.cost))}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40">
                  <p className="text-xs text-muted-foreground">Break-Even</p>
                  <p className="font-bold text-amber-400">{fmtNum(roi.payback_period_months, 0)} months</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40">
                  <p className="text-xs text-muted-foreground">Skill Match</p>
                  <p className="font-bold text-cyan-400">{pct(skill.skills_score)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40">
                  <p className="text-xs text-muted-foreground">3-Year Earnings</p>
                  <p className="font-bold text-emerald-400">{fmt(roi.future_salary_3y)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     WIZARD (3 steps)
  ══════════════════════════════════════════════════════════════ */
  const currentStep = STEPS[step];

  const inputCls = "bg-background/60 border-border focus:border-primary transition-colors";
  const labelCls = "text-sm font-medium";
  const sectionCls = "space-y-2";

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-display flex items-center gap-2">
          <IndianRupee className="w-8 h-8 text-primary" />
          Career Financial <span className="gradient-text">Engine</span>
        </h1>
        <p className="text-muted-foreground mt-1">ML-powered evaluation of your educational investment's financial worth.</p>
      </motion.div>

      {/* Step progress */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i < step ? "bg-primary" : i === step ? "bg-primary/50" : "bg-border"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length} — {currentStep.subtitle}</p>
      </div>

      {/* Loading overlay */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            <div className="absolute inset-2 rounded-full border-r-2 border-secondary animate-spin" style={{ animationDirection: "reverse" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-7 h-7 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold font-display">Running ML Analysis…</h3>
          <p className="text-sm text-muted-foreground">Salary model · Skill matching · ROI calculation · Market estimation</p>
        </motion.div>
      )}

      {/* Form card */}
      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.28 }}>
            <Card className="glass-card">
              {/* Step header */}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                    <currentStep.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                    <CardDescription>{currentStep.subtitle}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">

                {/* ── STEP 0: Profile ── */}
                {step === 0 && (
                  <>
                    <div className={sectionCls}>
                      <Label className={labelCls}>Current Status</Label>
                      <Select value={profile.current_status} onValueChange={v => setProfile(p => ({ ...p, current_status: v }))}>
                        <SelectTrigger className={inputCls}><SelectValue placeholder="Select your status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">🎓 Student</SelectItem>
                          <SelectItem value="intern">💼 Intern</SelectItem>
                          <SelectItem value="working">🧑‍💻 Working Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={sectionCls}>
                      <Label className={labelCls}>Your Skills <span className="text-muted-foreground font-normal">(comma separated)</span></Label>
                      <Input className={inputCls} placeholder="e.g. Python, SQL, Machine Learning, React" value={profile.skills} onChange={e => setProfile(p => ({ ...p, skills: e.target.value }))} />
                      <p className="text-xs text-muted-foreground">The AI will match these against the role's required skills.</p>
                    </div>
                    <div className={sectionCls}>
                      <Label className={labelCls}>Preferred Location <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Select value={profile.preferred_location} onValueChange={v => setProfile(p => ({ ...p, preferred_location: v }))}>
                        <SelectTrigger className={inputCls}><SelectValue placeholder="Select city (or leave for India average)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="india_average">🇮🇳 India Average</SelectItem>
                          <SelectItem value="Bangalore">🏙️ Bangalore</SelectItem>
                          <SelectItem value="Mumbai">🏙️ Mumbai</SelectItem>
                          <SelectItem value="Delhi">🏙️ Delhi</SelectItem>
                          <SelectItem value="Hyderabad">🏙️ Hyderabad</SelectItem>
                          <SelectItem value="Chennai">🏙️ Chennai</SelectItem>
                          <SelectItem value="Pune">🏙️ Pune</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* ── STEP 1: Target Job ── */}
                {step === 1 && (
                  <div className={sectionCls}>
                    <Label className={labelCls}>Target Job Role</Label>
                    <Input className={inputCls} placeholder="e.g. Data Scientist, Backend Developer, ML Engineer" value={jobRole} onChange={e => setJobRole(e.target.value)} />
                    <p className="text-xs text-muted-foreground">The ML model will predict your expected salary and auto-estimate market conditions for this role.</p>

                    {/* Role suggestions */}
                    <div className="pt-3 space-y-1.5">
                      <p className="text-xs text-muted-foreground font-medium">Popular roles:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["Data Scientist", "ML Engineer", "Full Stack Developer", "Backend Developer", "Frontend Developer", "DevOps Engineer", "Product Manager", "UI/UX Designer"].map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setJobRole(role)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                              jobRole === role
                                ? "bg-primary/20 border-primary/50 text-primary"
                                : "bg-muted/40 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Education Plan ── */}
                {step === 2 && (
                  <>
                    <div className={sectionCls}>
                      <Label className={labelCls}>Education Type</Label>
                      <Select value={education.type} onValueChange={v => setEducation(p => ({ ...p, type: v }))}>
                        <SelectTrigger className={inputCls}><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="course">📚 Online Course</SelectItem>
                          <SelectItem value="degree">🎓 Degree Programme</SelectItem>
                          <SelectItem value="certification">🏅 Certification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={sectionCls}>
                      <Label className={labelCls}>Program Name</Label>
                      <Input className={inputCls} placeholder="e.g. PG Diploma in Data Science, AWS Solutions Architect" value={education.name} onChange={e => setEducation(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={sectionCls}>
                        <Label className={labelCls}>Total Cost (₹)</Label>
                        <Input type="number" className={inputCls} placeholder="e.g. 150000" value={education.cost} onChange={e => setEducation(p => ({ ...p, cost: e.target.value }))} />
                      </div>
                      <div className={sectionCls}>
                        <Label className={labelCls}>Duration (months)</Label>
                        <Input type="number" className={inputCls} placeholder="e.g. 12" value={education.duration_months} onChange={e => setEducation(p => ({ ...p, duration_months: e.target.value }))} />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>

              {/* Nav buttons */}
              <div className="flex items-center justify-between px-6 pb-6">
                <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep(s => s + 1)} disabled={!stepValid[step]} className="gradient-bg text-primary-foreground">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleAnalyze} disabled={!stepValid[step] || loading} className="gradient-bg text-primary-foreground">
                    <Sparkles className="w-4 h-4 mr-2" /> Analyze Investment
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Preview summary pill */}
      {step > 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {profile.current_status && <span className="bg-muted/60 border border-border px-2 py-1 rounded-full capitalize">{profile.current_status}</span>}
          {jobRole && <span className="bg-muted/60 border border-border px-2 py-1 rounded-full flex items-center gap-1"><ChevronRight className="w-3 h-3" />{jobRole}</span>}
          {education.name && <span className="bg-muted/60 border border-border px-2 py-1 rounded-full">{education.name}</span>}
          {education.cost && <span className="bg-muted/60 border border-border px-2 py-1 rounded-full">₹{Number(education.cost).toLocaleString("en-IN")}</span>}
        </motion.div>
      )}
    </div>
  );
}
