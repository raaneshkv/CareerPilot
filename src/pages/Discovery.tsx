import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Map, ArrowLeft, ArrowRight, Compass, Sparkles, ThumbsUp, ThumbsDown, Briefcase, TrendingUp, MapPin, GraduationCap, Heart, Rocket, Loader2 } from "lucide-react";

/* ===== Career Database (20+ careers with Indian market context) ===== */
const CAREERS = [
  { title: "Frontend Developer", salary: "₹6L – ₹18L/yr", growth: "High", category: "Engineering", traits: ["creative", "detail-oriented", "visual"], pains: ["meetings", "legacy"], environments: ["remote", "startup"], interests: ["technology", "design"], levels: ["fresher", "mid"] },
  { title: "Backend Developer", salary: "₹8L – ₹22L/yr", growth: "High", category: "Engineering", traits: ["analytical", "systematic", "autonomous"], pains: ["communication-heavy", "legacy"], environments: ["remote", "corporate"], interests: ["technology"], levels: ["fresher", "mid", "senior"] },
  { title: "Full Stack Developer", salary: "₹7L – ₹24L/yr", growth: "Very High", category: "Engineering", traits: ["versatile", "fast-learner", "autonomous"], pains: ["narrow-scope"], environments: ["remote", "startup", "hybrid"], interests: ["technology"], levels: ["fresher", "mid", "senior"] },
  { title: "Data Scientist", salary: "₹10L – ₹30L/yr", growth: "Very High", category: "Data & AI", traits: ["analytical", "curious", "detail-oriented"], pains: ["repetitive", "no-growth"], environments: ["corporate", "hybrid"], interests: ["science", "technology"], levels: ["mid", "senior"] },
  { title: "Machine Learning Engineer", salary: "₹12L – ₹40L/yr", growth: "Explosive", category: "Data & AI", traits: ["analytical", "research-minded", "systematic"], pains: ["no-growth", "legacy"], environments: ["corporate", "remote"], interests: ["science", "technology"], levels: ["mid", "senior"] },
  { title: "DevOps Engineer", salary: "₹8L – ₹28L/yr", growth: "High", category: "Infrastructure", traits: ["systematic", "autonomous", "organized"], pains: ["meetings", "repetitive"], environments: ["remote", "corporate"], interests: ["technology"], levels: ["mid", "senior"] },
  { title: "Cloud Architect", salary: "₹18L – ₹50L/yr", growth: "Very High", category: "Infrastructure", traits: ["strategic", "systematic", "leadership"], pains: ["narrow-scope", "no-growth"], environments: ["corporate", "hybrid"], interests: ["technology", "business"], levels: ["senior"] },
  { title: "Product Manager", salary: "₹12L – ₹35L/yr", growth: "High", category: "Product", traits: ["strategic", "communicative", "leadership", "empathetic"], pains: ["repetitive", "no-growth"], environments: ["hybrid", "corporate", "startup"], interests: ["business", "technology", "design"], levels: ["mid", "senior"] },
  { title: "UX/UI Designer", salary: "₹6L – ₹20L/yr", growth: "High", category: "Design", traits: ["creative", "empathetic", "visual", "detail-oriented"], pains: ["meetings", "legacy"], environments: ["remote", "startup"], interests: ["design", "technology"], levels: ["fresher", "mid"] },
  { title: "Mobile App Developer", salary: "₹7L – ₹22L/yr", growth: "High", category: "Engineering", traits: ["creative", "detail-oriented", "versatile"], pains: ["narrow-scope"], environments: ["remote", "startup", "hybrid"], interests: ["technology", "design"], levels: ["fresher", "mid"] },
  { title: "Cybersecurity Analyst", salary: "₹8L – ₹25L/yr", growth: "Very High", category: "Security", traits: ["analytical", "detail-oriented", "systematic"], pains: ["no-growth", "repetitive"], environments: ["corporate", "remote"], interests: ["technology", "science"], levels: ["mid", "senior"] },
  { title: "Data Analyst", salary: "₹5L – ₹15L/yr", growth: "High", category: "Data & AI", traits: ["analytical", "organized", "detail-oriented"], pains: ["communication-heavy"], environments: ["corporate", "hybrid"], interests: ["business", "science"], levels: ["fresher", "mid"] },
  { title: "Blockchain Developer", salary: "₹10L – ₹35L/yr", growth: "Growing", category: "Emerging Tech", traits: ["research-minded", "autonomous", "curious"], pains: ["legacy", "narrow-scope"], environments: ["remote", "startup"], interests: ["technology", "business"], levels: ["mid", "senior"] },
  { title: "QA/Test Engineer", salary: "₹5L – ₹16L/yr", growth: "Moderate", category: "Engineering", traits: ["detail-oriented", "systematic", "organized"], pains: ["no-growth"], environments: ["hybrid", "corporate"], interests: ["technology"], levels: ["fresher", "mid"] },
  { title: "Technical Writer", salary: "₹5L – ₹14L/yr", growth: "Moderate", category: "Content", traits: ["communicative", "organized", "detail-oriented"], pains: ["meetings", "repetitive"], environments: ["remote", "hybrid"], interests: ["communication", "technology"], levels: ["fresher", "mid"] },
  { title: "Game Developer", salary: "₹6L – ₹20L/yr", growth: "Growing", category: "Creative Tech", traits: ["creative", "visual", "curious", "fast-learner"], pains: ["meetings", "legacy"], environments: ["startup", "remote"], interests: ["design", "technology"], levels: ["fresher", "mid"] },
  { title: "AI Prompt Engineer", salary: "₹8L – ₹25L/yr", growth: "Explosive", category: "Data & AI", traits: ["creative", "curious", "communicative"], pains: ["repetitive", "narrow-scope"], environments: ["remote", "startup"], interests: ["technology", "communication"], levels: ["fresher", "mid"] },
  { title: "Solutions Architect", salary: "₹20L – ₹50L+/yr", growth: "Very High", category: "Infrastructure", traits: ["strategic", "leadership", "systematic", "communicative"], pains: ["narrow-scope", "no-growth"], environments: ["corporate", "hybrid"], interests: ["technology", "business"], levels: ["senior"] },
  { title: "Digital Marketing Analyst", salary: "₹4L – ₹14L/yr", growth: "Moderate", category: "Marketing", traits: ["creative", "communicative", "analytical"], pains: ["legacy", "meetings"], environments: ["hybrid", "startup", "remote"], interests: ["business", "communication", "design"], levels: ["fresher", "mid"] },
  { title: "Embedded Systems Engineer", salary: "₹6L – ₹20L/yr", growth: "Moderate", category: "Hardware", traits: ["analytical", "systematic", "detail-oriented"], pains: ["communication-heavy"], environments: ["corporate", "hybrid"], interests: ["science", "technology"], levels: ["mid", "senior"] },
  { title: "Site Reliability Engineer", salary: "₹12L – ₹35L/yr", growth: "Very High", category: "Infrastructure", traits: ["systematic", "analytical", "autonomous"], pains: ["repetitive", "narrow-scope"], environments: ["remote", "corporate"], interests: ["technology"], levels: ["mid", "senior"] },
];

/* ===== Wizard Steps ===== */
const STEPS = [
  {
    id: "pains",
    title: "Pain Points",
    subtitle: "What drains you?",
    icon: ThumbsDown,
    options: [
      { value: "meetings", label: "Too many meetings", emoji: "📅" },
      { value: "repetitive", label: "Repetitive tasks", emoji: "🔁" },
      { value: "no-growth", label: "No growth opportunities", emoji: "📉" },
      { value: "legacy", label: "Outdated tech/tools", emoji: "🦕" },
      { value: "communication-heavy", label: "Excessive communication", emoji: "💬" },
      { value: "narrow-scope", label: "Too narrow in scope", emoji: "🔍" },
    ],
  },
  {
    id: "traits",
    title: "Your Strengths",
    subtitle: "What defines you?",
    icon: ThumbsUp,
    options: [
      { value: "analytical", label: "Analytical thinker", emoji: "🧠" },
      { value: "creative", label: "Creative mind", emoji: "🎨" },
      { value: "leadership", label: "Leadership skills", emoji: "👑" },
      { value: "detail-oriented", label: "Detail-oriented", emoji: "🔬" },
      { value: "strategic", label: "Strategic planner", emoji: "♟️" },
      { value: "communicative", label: "Strong communicator", emoji: "🎤" },
      { value: "autonomous", label: "Self-driven", emoji: "🚀" },
      { value: "visual", label: "Visual thinker", emoji: "👁️" },
      { value: "versatile", label: "Jack of all trades", emoji: "🃏" },
      { value: "curious", label: "Deeply curious", emoji: "🔭" },
    ],
  },
  {
    id: "environment",
    title: "Work Environment",
    subtitle: "Where do you thrive?",
    icon: MapPin,
    options: [
      { value: "remote", label: "Fully Remote", emoji: "🏠" },
      { value: "hybrid", label: "Hybrid Model", emoji: "🔄" },
      { value: "corporate", label: "Large Corporate", emoji: "🏢" },
      { value: "startup", label: "Fast Startup", emoji: "⚡" },
    ],
  },
  {
    id: "interests",
    title: "Interests & Passions",
    subtitle: "What excites you?",
    icon: Heart,
    options: [
      { value: "technology", label: "Technology & Code", emoji: "💻" },
      { value: "design", label: "Design & Aesthetics", emoji: "🎨" },
      { value: "business", label: "Business & Strategy", emoji: "📊" },
      { value: "science", label: "Science & Research", emoji: "🔬" },
      { value: "communication", label: "Writing & Communication", emoji: "✍️" },
    ],
  },
  {
    id: "level",
    title: "Experience Level",
    subtitle: "Where are you now?",
    icon: GraduationCap,
    options: [
      { value: "fresher", label: "Fresher (0–1 yr)", emoji: "🌱" },
      { value: "mid", label: "Mid-Level (2–5 yrs)", emoji: "🌿" },
      { value: "senior", label: "Senior (5+ yrs)", emoji: "🌳" },
    ],
  },
];

export default function Discovery() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [matches, setMatches] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const step = STEPS[currentStep];
  const selected = selections[step.id] || [];
  const totalSteps = STEPS.length;

  const toggleOption = (value: string) => {
    setSelections(prev => {
      const current = prev[step.id] || [];
      return {
        ...prev,
        [step.id]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
      };
    });
  };

  const nextStep = () => {
    if (selected.length === 0) {
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateMatches();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const calculateMatches = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const userPains = selections.pains || [];
      const userTraits = selections.traits || [];
      const userEnv = selections.environment || [];
      const userInterests = selections.interests || [];
      const userLevel = selections.level || [];

      const scored = CAREERS.map(career => {
        let score = 0;
        let maxScore = 0;
        const reasons: string[] = [];

        // Pains avoidance (weight: 15%)
        maxScore += 15;
        const painsAvoided = userPains.filter(p => !career.pains.includes(p)).length;
        const painScore = userPains.length > 0 ? Math.round((painsAvoided / userPains.length) * 15) : 10;
        score += painScore;
        if (painScore >= 12) reasons.push("Avoids your key pain points");

        // Traits match (weight: 30%)
        maxScore += 30;
        const traitMatches = userTraits.filter(t => career.traits.includes(t)).length;
        const traitScore = userTraits.length > 0 ? Math.round((traitMatches / userTraits.length) * 30) : 15;
        score += traitScore;
        if (traitMatches > 0) reasons.push(`Matches ${traitMatches} of your strengths (${userTraits.filter(t => career.traits.includes(t)).join(', ')})`);

        // Environment match (weight: 20%)
        maxScore += 20;
        const envMatches = userEnv.filter(e => career.environments.includes(e)).length;
        const envScore = userEnv.length > 0 ? Math.round((envMatches / userEnv.length) * 20) : 10;
        score += envScore;
        if (envMatches > 0) reasons.push(`Available in ${userEnv.filter(e => career.environments.includes(e)).join(' & ')} settings`);

        // Interests match (weight: 25%)
        maxScore += 25;
        const interestMatches = userInterests.filter(i => career.interests.includes(i)).length;
        const interestScore = userInterests.length > 0 ? Math.round((interestMatches / userInterests.length) * 25) : 12;
        score += interestScore;
        if (interestMatches > 0) reasons.push(`Aligns with your interests: ${userInterests.filter(i => career.interests.includes(i)).join(', ')}`);

        // Experience level match (weight: 10%)
        maxScore += 10;
        const levelMatch = userLevel.some(l => career.levels.includes(l));
        const levelScore = levelMatch ? 10 : 3;
        score += levelScore;
        if (levelMatch) reasons.push(`Suitable for your experience level`);

        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        return {
          ...career,
          matchScore: percentage,
          reasons,
        };
      });

      scored.sort((a, b) => b.matchScore - a.matchScore);
      setMatches(scored.slice(0, 8));
      setShowResults(true);
      setIsCalculating(false);
    }, 2000);
  };

  const handleCreateRoadmap = (careerTitle: string) => {
    navigate("/roadmap", { state: { targetRole: careerTitle } });
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setSelections({});
    setShowResults(false);
    setMatches([]);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display flex items-center gap-2">
          <Compass className="w-8 h-8 text-primary" />
          Career <span className="gradient-text">Discovery</span>
        </h1>
        <p className="text-muted-foreground mt-1">Answer 5 questions and let AI find your best career matches.</p>
      </motion.div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              i < currentStep ? 'bg-primary' : i === currentStep && !showResults ? 'bg-primary/50' : 'bg-border'
            }`}
          />
        ))}
      </div>
      {!showResults && (
        <p className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </p>
      )}

      {/* Wizard Steps */}
      {!showResults && !isCalculating && (
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">{step.title}</h2>
                  <p className="text-muted-foreground text-sm">{step.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {step.options.map(opt => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <motion.div
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleOption(opt.value)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{opt.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-8">
                <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={nextStep} disabled={selected.length === 0} className="gradient-bg text-primary-foreground">
                  {currentStep === totalSteps - 1 ? (
                    <><Sparkles className="w-4 h-4 mr-2" /> Find My Careers</>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Calculating State */}
      {isCalculating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-16 text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            <div className="absolute inset-2 rounded-full border-r-2 border-secondary animate-spin" style={{ animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold font-display">Analyzing your profile...</h3>
          <p className="text-sm text-muted-foreground mt-2">Matching across {CAREERS.length} career paths and 5 dimensions</p>
        </motion.div>
      )}

      {/* Results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Your Career Matches
            </h2>
            <Button variant="outline" onClick={resetWizard}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Retake Quiz
            </Button>
          </div>

          <div className="grid gap-4">
            {matches.map((career, i) => (
              <motion.div
                key={career.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6 hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold font-display w-10 h-10 flex items-center justify-center rounded-lg ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        i === 1 ? 'bg-slate-300/20 text-slate-300' :
                        i === 2 ? 'bg-amber-700/20 text-amber-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-display">{career.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{career.salary}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">{career.growth} Growth</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">{career.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Match reasons */}
                    <div className="space-y-1 pl-13">
                      {career.reasons.slice(0, 3).map((reason: string, j: number) => (
                        <p key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {reason}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="text-center">
                      <div className={`text-3xl font-bold font-display ${
                        career.matchScore >= 80 ? 'text-emerald-500' :
                        career.matchScore >= 60 ? 'text-blue-500' :
                        career.matchScore >= 40 ? 'text-amber-500' :
                        'text-muted-foreground'
                      }`}>
                        {career.matchScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                    <Button 
                      className="gradient-bg text-primary-foreground"
                      size="sm"
                      onClick={() => handleCreateRoadmap(career.title)}
                    >
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
