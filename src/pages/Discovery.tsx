import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Map, ArrowLeft, ArrowRight, Compass, Sparkles, ThumbsUp, ThumbsDown,
  Briefcase, TrendingUp, MapPin, GraduationCap, Heart, Rocket, Loader2, Brain } from "lucide-react";
import { API_URL } from "@/lib/api";

/* ===== Career Database (21 careers with Indian market context) ===== */
const CAREERS = [
  { title: "Frontend Developer",         salary: "₹6L – ₹18L/yr",  growth: "High",       category: "Engineering",      traits: ["creative","detail-oriented","visual"],                     pains: ["meetings","legacy"],                environments: ["remote","startup"],              interests: ["technology","design"],           levels: ["fresher","mid"] },
  { title: "Backend Developer",          salary: "₹8L – ₹22L/yr",  growth: "High",       category: "Engineering",      traits: ["analytical","systematic","autonomous"],                    pains: ["communication-heavy","legacy"],      environments: ["remote","corporate"],           interests: ["technology"],                    levels: ["fresher","mid","senior"] },
  { title: "Full Stack Developer",       salary: "₹7L – ₹24L/yr",  growth: "Very High",  category: "Engineering",      traits: ["versatile","fast-learner","autonomous"],                   pains: ["narrow-scope"],                     environments: ["remote","startup","hybrid"],     interests: ["technology"],                    levels: ["fresher","mid","senior"] },
  { title: "Data Scientist",             salary: "₹10L – ₹30L/yr", growth: "Very High",  category: "Data & AI",        traits: ["analytical","curious","detail-oriented"],                  pains: ["repetitive","no-growth"],           environments: ["corporate","hybrid"],            interests: ["science","technology"],          levels: ["mid","senior"] },
  { title: "Machine Learning Engineer",  salary: "₹12L – ₹40L/yr", growth: "Explosive",  category: "Data & AI",        traits: ["analytical","research-minded","systematic"],               pains: ["no-growth","legacy"],               environments: ["corporate","remote"],            interests: ["science","technology"],          levels: ["mid","senior"] },
  { title: "DevOps Engineer",            salary: "₹8L – ₹28L/yr",  growth: "High",       category: "Infrastructure",   traits: ["systematic","autonomous","organized"],                     pains: ["meetings","repetitive"],            environments: ["remote","corporate"],           interests: ["technology"],                    levels: ["mid","senior"] },
  { title: "Cloud Architect",            salary: "₹18L – ₹50L/yr", growth: "Very High",  category: "Infrastructure",   traits: ["strategic","systematic","leadership"],                     pains: ["narrow-scope","no-growth"],         environments: ["corporate","hybrid"],            interests: ["technology","business"],         levels: ["senior"] },
  { title: "Product Manager",            salary: "₹12L – ₹35L/yr", growth: "High",       category: "Product",          traits: ["strategic","communicative","leadership","empathetic"],     pains: ["repetitive","no-growth"],           environments: ["hybrid","corporate","startup"],  interests: ["business","technology","design"],levels: ["mid","senior"] },
  { title: "UX/UI Designer",             salary: "₹6L – ₹20L/yr",  growth: "High",       category: "Design",           traits: ["creative","empathetic","visual","detail-oriented"],        pains: ["meetings","legacy"],                environments: ["remote","startup"],              interests: ["design","technology"],           levels: ["fresher","mid"] },
  { title: "Mobile App Developer",       salary: "₹7L – ₹22L/yr",  growth: "High",       category: "Engineering",      traits: ["creative","detail-oriented","versatile"],                  pains: ["narrow-scope"],                     environments: ["remote","startup","hybrid"],     interests: ["technology","design"],           levels: ["fresher","mid"] },
  { title: "Cybersecurity Analyst",      salary: "₹8L – ₹25L/yr",  growth: "Very High",  category: "Security",         traits: ["analytical","detail-oriented","systematic"],               pains: ["no-growth","repetitive"],           environments: ["corporate","remote"],            interests: ["technology","science"],          levels: ["mid","senior"] },
  { title: "Data Analyst",               salary: "₹5L – ₹15L/yr",  growth: "High",       category: "Data & AI",        traits: ["analytical","organized","detail-oriented"],                pains: ["communication-heavy"],              environments: ["corporate","hybrid"],            interests: ["business","science"],            levels: ["fresher","mid"] },
  { title: "Blockchain Developer",       salary: "₹10L – ₹35L/yr", growth: "Growing",    category: "Emerging Tech",    traits: ["research-minded","autonomous","curious"],                  pains: ["legacy","narrow-scope"],            environments: ["remote","startup"],              interests: ["technology","business"],         levels: ["mid","senior"] },
  { title: "QA/Test Engineer",           salary: "₹5L – ₹16L/yr",  growth: "Moderate",   category: "Engineering",      traits: ["detail-oriented","systematic","organized"],                pains: ["no-growth"],                        environments: ["hybrid","corporate"],            interests: ["technology"],                    levels: ["fresher","mid"] },
  { title: "Technical Writer",           salary: "₹5L – ₹14L/yr",  growth: "Moderate",   category: "Content",          traits: ["communicative","organized","detail-oriented"],             pains: ["meetings","repetitive"],            environments: ["remote","hybrid"],               interests: ["communication","technology"],    levels: ["fresher","mid"] },
  { title: "Game Developer",             salary: "₹6L – ₹20L/yr",  growth: "Growing",    category: "Creative Tech",    traits: ["creative","visual","curious","fast-learner"],              pains: ["meetings","legacy"],                environments: ["startup","remote"],              interests: ["design","technology"],           levels: ["fresher","mid"] },
  { title: "AI Prompt Engineer",         salary: "₹8L – ₹25L/yr",  growth: "Explosive",  category: "Data & AI",        traits: ["creative","curious","communicative"],                      pains: ["repetitive","narrow-scope"],        environments: ["remote","startup"],              interests: ["technology","communication"],    levels: ["fresher","mid"] },
  { title: "Solutions Architect",        salary: "₹20L – ₹50L+/yr",growth: "Very High",  category: "Infrastructure",   traits: ["strategic","leadership","systematic","communicative"],     pains: ["narrow-scope","no-growth"],         environments: ["corporate","hybrid"],            interests: ["technology","business"],         levels: ["senior"] },
  { title: "Digital Marketing Analyst",  salary: "₹4L – ₹14L/yr",  growth: "Moderate",   category: "Marketing",        traits: ["creative","communicative","analytical"],                   pains: ["legacy","meetings"],               environments: ["hybrid","startup","remote"],      interests: ["business","communication","design"],levels: ["fresher","mid"] },
  { title: "Embedded Systems Engineer",  salary: "₹6L – ₹20L/yr",  growth: "Moderate",   category: "Hardware",         traits: ["analytical","systematic","detail-oriented"],               pains: ["communication-heavy"],              environments: ["corporate","hybrid"],            interests: ["science","technology"],          levels: ["mid","senior"] },
  { title: "Site Reliability Engineer",  salary: "₹12L – ₹35L/yr", growth: "Very High",  category: "Infrastructure",   traits: ["systematic","analytical","autonomous"],                    pains: ["repetitive","narrow-scope"],        environments: ["remote","corporate"],            interests: ["technology"],                    levels: ["mid","senior"] },
];

/* ===== Wizard Steps ===== */
const STEPS = [
  { id: "pains",       title: "Pain Points",          subtitle: "What drains you?",       icon: ThumbsDown,
    options: [
      { value: "meetings",            label: "Too many meetings",         emoji: "📅" },
      { value: "repetitive",          label: "Repetitive tasks",          emoji: "🔁" },
      { value: "no-growth",           label: "No growth opportunities",   emoji: "📉" },
      { value: "legacy",              label: "Outdated tech/tools",       emoji: "🦕" },
      { value: "communication-heavy", label: "Excessive communication",   emoji: "💬" },
      { value: "narrow-scope",        label: "Too narrow in scope",       emoji: "🔍" },
    ],
  },
  { id: "traits",      title: "Your Strengths",        subtitle: "What defines you?",      icon: ThumbsUp,
    options: [
      { value: "analytical",     label: "Analytical thinker",    emoji: "🧠" },
      { value: "creative",       label: "Creative mind",         emoji: "🎨" },
      { value: "leadership",     label: "Leadership skills",     emoji: "👑" },
      { value: "detail-oriented",label: "Detail-oriented",       emoji: "🔬" },
      { value: "strategic",      label: "Strategic planner",     emoji: "♟️" },
      { value: "communicative",  label: "Strong communicator",   emoji: "🎤" },
      { value: "autonomous",     label: "Self-driven",           emoji: "🚀" },
      { value: "visual",         label: "Visual thinker",        emoji: "👁️" },
      { value: "versatile",      label: "Jack of all trades",    emoji: "🃏" },
      { value: "curious",        label: "Deeply curious",        emoji: "🔭" },
    ],
  },
  { id: "environment", title: "Work Environment",      subtitle: "Where do you thrive?",   icon: MapPin,
    options: [
      { value: "remote",    label: "Fully Remote",    emoji: "🏠" },
      { value: "hybrid",    label: "Hybrid Model",    emoji: "🔄" },
      { value: "corporate", label: "Large Corporate", emoji: "🏢" },
      { value: "startup",   label: "Fast Startup",    emoji: "⚡" },
    ],
  },
  { id: "interests",   title: "Interests & Passions",  subtitle: "What excites you?",      icon: Heart,
    options: [
      { value: "technology",    label: "Technology & Code",       emoji: "💻" },
      { value: "design",        label: "Design & Aesthetics",     emoji: "🎨" },
      { value: "business",      label: "Business & Strategy",     emoji: "📊" },
      { value: "science",       label: "Science & Research",      emoji: "🔬" },
      { value: "communication", label: "Writing & Communication", emoji: "✍️" },
    ],
  },
  { id: "level",       title: "Experience Level",      subtitle: "Where are you now?",     icon: GraduationCap,
    options: [
      { value: "fresher", label: "Fresher (0–1 yr)",  emoji: "🌱" },
      { value: "mid",     label: "Mid-Level (2–5 yrs)",emoji: "🌿" },
      { value: "senior",  label: "Senior (5+ yrs)",   emoji: "🌳" },
    ],
  },
];

const GROWTH_COLOR: Record<string, string> = {
  "Explosive": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Very High": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "High":      "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Growing":   "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Moderate":  "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function Discovery() {
  const navigate    = useNavigate();
  const [step, setStep]           = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [matches,  setMatches]    = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [modelPowered, setModelPowered]   = useState(false);

  const current   = STEPS[step];
  const selected  = selections[current.id] || [];
  const totalSteps = STEPS.length;

  const toggle = (value: string) =>
    setSelections(prev => {
      const cur = prev[current.id] || [];
      return { ...prev, [current.id]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] };
    });

  const next = () => {
    if (!selected.length) return;
    if (step < totalSteps - 1) setStep(s => s + 1);
    else calculateMatches();
  };
  const prev = () => { if (step > 0) setStep(s => s - 1); };

  // ── Calculation: heuristic + /career/match model ───────────
  const calculateMatches = async () => {
    setIsCalculating(true);

    const userPains     = selections.pains       || [];
    const userTraits    = selections.traits      || [];
    const userEnv       = selections.environment || [];
    const userInterests = selections.interests   || [];
    const userLevel     = selections.level       || [];

    // Step 1 — Rule-based scoring
    const scored = CAREERS.map(career => {
      let score = 0; let maxScore = 0; const reasons: string[] = [];

      maxScore += 15;
      const painsAvoided = userPains.filter(p => !career.pains.includes(p)).length;
      const painScore = userPains.length > 0 ? Math.round((painsAvoided / userPains.length) * 15) : 10;
      score += painScore;
      if (painScore >= 12) reasons.push("Avoids your key pain points");

      maxScore += 30;
      const traitMatches = userTraits.filter(t => career.traits.includes(t)).length;
      const traitScore = userTraits.length > 0 ? Math.round((traitMatches / userTraits.length) * 30) : 15;
      score += traitScore;
      if (traitMatches > 0) reasons.push(`Matches ${traitMatches} of your strengths (${userTraits.filter(t => career.traits.includes(t)).join(", ")})`);

      maxScore += 20;
      const envMatches = userEnv.filter(e => career.environments.includes(e)).length;
      const envScore = userEnv.length > 0 ? Math.round((envMatches / userEnv.length) * 20) : 10;
      score += envScore;
      if (envMatches > 0) reasons.push(`Available in ${userEnv.filter(e => career.environments.includes(e)).join(" & ")} settings`);

      maxScore += 25;
      const intMatches = userInterests.filter(i => career.interests.includes(i)).length;
      const intScore = userInterests.length > 0 ? Math.round((intMatches / userInterests.length) * 25) : 12;
      score += intScore;
      if (intMatches > 0) reasons.push(`Aligns with: ${userInterests.filter(i => career.interests.includes(i)).join(", ")}`);

      maxScore += 10;
      const levelMatch = userLevel.some(l => career.levels.includes(l));
      score += levelMatch ? 10 : 3;
      if (levelMatch) reasons.push("Suitable for your experience level");

      return { ...career, heuristicScore: Math.round((score / maxScore) * 100), modelScore: null as number | null, matchScore: 0, reasons };
    });

    scored.sort((a, b) => b.heuristicScore - a.heuristicScore);
    const top8 = scored.slice(0, 8);

    // Step 2 — /career/match model scoring
    const profileText = [
      userTraits.join(", "),
      userInterests.map(i => `interested in ${i}`).join(", "),
      userEnv.map(e => `prefers ${e} work`).join(", "),
      userPains.map(p => `dislikes ${p}`).join(", "),
      userLevel[0] ? `${userLevel[0]} level professional` : "",
    ].filter(Boolean).join(". ");

    let modelMap: Record<string, number> = {};
    let powered = false;
    try {
      const res = await fetch(`${API_URL}/career/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_text: profileText, career_titles: top8.map(c => c.title) }),
      });
      if (res.ok) {
        const data = await res.json();
        (data.matches || []).forEach((m: any) => { modelMap[m.career] = m.model_score; });
        powered = true;
      }
    } catch (_) { /* graceful offline fallback */ }

    // Step 3 — Blend: 60% heuristic + 40% model (or 100% heuristic if offline)
    const blended = top8.map(c => {
      const ms = modelMap[c.title];
      const blended = ms !== undefined
        ? Math.round(c.heuristicScore * 0.60 + ms * 0.40)
        : c.heuristicScore;
      return { ...c, modelScore: ms ?? null, matchScore: blended };
    });
    blended.sort((a, b) => b.matchScore - a.matchScore);

    setModelPowered(powered);
    setMatches(blended);
    setShowResults(true);
    setIsCalculating(false);
  };

  const reset = () => { setStep(0); setSelections({}); setShowResults(false); setMatches([]); setModelPowered(false); };
  const handleRoadmap = (title: string) => navigate("/roadmap", { state: { targetRole: title } });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display flex items-center gap-2">
          <Compass className="w-8 h-8 text-primary" />
          Career <span className="gradient-text">Discovery</span>
        </h1>
        <p className="text-muted-foreground mt-1">Answer 5 questions — AI finds your best career matches.</p>
      </motion.div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i < step ? "bg-primary" : i === step && !showResults ? "bg-primary/50" : "bg-border"}`} />
        ))}
      </div>
      {!showResults && <p className="text-xs text-muted-foreground">Step {step + 1} of {totalSteps}</p>}

      {/* Wizard */}
      {!showResults && !isCalculating && (
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
            <Card className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <current.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">{current.title}</h2>
                  <p className="text-muted-foreground text-sm">{current.subtitle}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.options.map(opt => {
                  const sel = selected.includes(opt.value);
                  return (
                    <motion.div key={opt.value} whileTap={{ scale: 0.97 }} onClick={() => toggle(opt.value)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${sel ? "border-primary bg-primary/10 shadow-md shadow-primary/10" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}>
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className={`font-medium ${sel ? "text-primary" : ""}`}>{opt.label}</span>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-8">
                <Button variant="ghost" onClick={prev} disabled={step === 0}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button onClick={next} disabled={!selected.length} className="gradient-bg text-primary-foreground">
                  {step === totalSteps - 1 ? <><Sparkles className="w-4 h-4 mr-2" /> Find My Careers</> : <>Next <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Loading */}
      {isCalculating && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-16 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            <div className="absolute inset-2 rounded-full border-r-2 border-secondary animate-spin" style={{ animationDirection: "reverse" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold font-display">Analyzing your profile…</h3>
          <p className="text-sm text-muted-foreground mt-2">Matching across {CAREERS.length} career paths + AI semantic ranking</p>
        </motion.div>
      )}

      {/* Results */}
      {showResults && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Your Career Matches
              </h2>
              {modelPowered && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-violet-400">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Ranked by trained AI model + preference rules</span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={reset}><ArrowLeft className="w-4 h-4 mr-2" /> Retake Quiz</Button>
          </div>

          <div className="grid gap-4">
            {matches.map((career, i) => (
              <motion.div key={career.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-card p-6 hover:border-primary/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div className={`text-xl font-bold font-display w-10 h-10 flex items-center justify-center rounded-lg shrink-0 ${
                        i === 0 ? "bg-yellow-500/20 text-yellow-500" :
                        i === 1 ? "bg-slate-300/20 text-slate-300" :
                        i === 2 ? "bg-amber-700/20 text-amber-600" : "bg-muted text-muted-foreground"
                      }`}>{i + 1}</div>
                      <div>
                        <h3 className="text-lg font-bold font-display">{career.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{career.salary}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${GROWTH_COLOR[career.growth] || GROWTH_COLOR["Moderate"]}`}>{career.growth} Growth</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">{career.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 pl-1">
                      {career.reasons.slice(0, 3).map((r: string, j: number) => (
                        <p key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />{r}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Score column */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-center">
                      <div className={`text-3xl font-bold font-display ${career.matchScore >= 80 ? "text-emerald-500" : career.matchScore >= 60 ? "text-blue-500" : career.matchScore >= 40 ? "text-amber-500" : "text-muted-foreground"}`}>
                        {career.matchScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>

                    {/* 🧠 Model Score badge */}
                    {career.modelScore !== null && (
                      <div className="flex items-center gap-1 text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg px-2.5 py-1.5 font-medium">
                        <Brain className="w-3 h-3" />
                        <span>🧠 Model: {Math.round(career.modelScore)}%</span>
                      </div>
                    )}

                    <Button className="gradient-bg text-primary-foreground" size="sm" onClick={() => handleRoadmap(career.title)}>
                      <Rocket className="w-4 h-4 mr-1" /> Create Roadmap
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
