import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ArrowRight, ArrowLeft, Brain, Map, Compass, HeartCrack, Lightbulb } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const PERSONALITY_TRAITS = [
  "Introverted", "Extroverted", "Analytical", "Creative", "Detail-Oriented", 
  "Big Picture Thinker", "Routine-Loving", "Spontaneous", "Independent", "Team Player"
];

const PREDEFINED_PAINS = [
  "I hate writing code",
  "I dislike constant meetings",
  "I don't want to manage people",
  "I hate unpredictable hours",
  "I don't want to talk to customers",
];

export default function Discovery() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [pains, setPains] = useState<string[]>([]);
  const [customPain, setCustomPain] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  
  // Results
  const [results, setResults] = useState<any[]>([]);

  const togglePain = (pain: string) => {
    setPains(prev => prev.includes(pain) ? prev.filter(p => p !== pain) : [...prev, pain]);
  };

  const toggleTrait = (trait: string) => {
    setTraits(prev => prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setStep(3); // Loading/Results step

    setTimeout(() => {
      setResults([
        {
          title: "Technical Writer",
          match: 95,
          reason: "You are analytical and detail-oriented but hate writing code and constant meetings. Technical writing lets you stay in tech independently.",
          salary: "$70k - $120k",
        },
        {
          title: "Data Analyst",
          match: 88,
          reason: "Since you prefer independent, routine-focused work and want to avoid customer interaction, analyzing data fits perfectly.",
          salary: "$65k - $110k",
        },
        {
          title: "UX Researcher",
          match: 82,
          reason: "Leverages your analytical mind without requiring programming. Usually involves structured, predictable hours.",
          salary: "$80k - $130k",
        }
      ]);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
        <h1 className="text-3xl font-bold font-display flex items-center justify-center gap-3">
          Career <span className="gradient-text">Discovery</span> Wizard
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          We use psychology to find your perfect job. Tell us what you hate doing and how you work, and our AI will find careers that actually fit you.
        </p>
      </motion.div>

      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-border rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="pt-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: PAIN POINTS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <HeartCrack className="w-5 h-5 text-destructive" /> Step 1: What do you want to avoid?
                    </CardTitle>
                    <CardDescription>Select absolute dealbreakers for your next job.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {PREDEFINED_PAINS.map(pain => (
                        <div 
                          key={pain}
                          onClick={() => togglePain(pain)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            pains.includes(pain) ? "border-destructive bg-destructive/5 text-destructive font-medium" : "border-border hover:border-destructive/30"
                          }`}
                        >
                          <Checkbox checked={pains.includes(pain)} className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive" />
                          <Label className="cursor-pointer">{pain}</Label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label>Other dealbreakers?</Label>
                      <Textarea 
                        placeholder="e.g., 'I get easily bored by repetitive tasks'" 
                        value={customPain}
                        onChange={e => setCustomPain(e.target.value)}
                        className="bg-background resize-none"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t border-border pt-6">
                    <Button onClick={() => setStep(2)} className="gradient-bg">
                      Next: Your Personality <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* STEP 2: PERSONALITY */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Brain className="w-5 h-5 text-primary" /> Step 2: How do you work best?
                    </CardTitle>
                    <CardDescription>Select 3-5 traits that describe you.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {PERSONALITY_TRAITS.map(trait => (
                        <Badge 
                          key={trait}
                          variant={traits.includes(trait) ? "default" : "outline"}
                          className={`text-sm py-1.5 px-4 cursor-pointer transition-all ${
                            traits.includes(trait) ? "bg-primary hover:bg-primary/90" : "hover:bg-primary/10"
                          }`}
                          onClick={() => toggleTrait(trait)}
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border pt-6">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={handleGenerate} className="gradient-bg" disabled={traits.length === 0}>
                      <Sparkles className="w-4 h-4 mr-2" /> Match Careers
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: RESULTS */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              >
                {isGenerating ? (
                  <Card className="glass-card h-[400px] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <h3 className="text-xl font-display font-medium">Scanning career profiles...</h3>
                    <p className="text-muted-foreground text-sm max-w-xs text-center">
                      Mapping your personality traits and pain points to 500+ job roles to find the perfect psychological fit.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-2xl font-display font-bold">Your Ideal Career Matches</h3>
                      <Button variant="outline" size="sm" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Retake</Button>
                    </div>
                    
                    {results.map((res, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i}
                      >
                        <Card className="glass-card overflow-hidden transition-all hover:border-primary/50 relative">
                          <div className="absolute top-0 right-0 p-4">
                            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-500 bg-emerald-500/10">
                              {res.match}%
                            </div>
                          </div>
                          <CardHeader className="pr-20">
                            <CardTitle className="text-xl">{res.title}</CardTitle>
                            <CardDescription className="font-medium text-emerald-500/80">{res.salary}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <h4 className="font-bold text-sm">Why this fits you:</h4>
                                <p className="text-sm text-foreground/80 leading-relaxed">{res.reason}</p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0 border-t border-border mt-4 px-6 py-4 bg-sidebar/50">
                            <Button variant="ghost" className="w-full justify-between group">
                              Create Roadmap for this <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
