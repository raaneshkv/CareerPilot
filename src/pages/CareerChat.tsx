import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, Navigation, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const SUGGESTIONS = [
  "What skills do I need for a Product Management role?",
  "How do I transition from QA to Developer?",
  "What are the highest paying tech jobs in India?",
  "Help me plan a 6-month upskilling roadmap",
];

/* Fallback response generator (used when AI call fails) */
function generateFallbackResponse(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes("salary") || lower.includes("pay") || lower.includes("package") || lower.includes("ctc")) {
    return "Based on current Indian tech market data (2025-2026):\n\n• **Fresher (0-1yr):** ₹4L-10L depending on role and company\n• **Mid-level (2-5yr):** ₹10L-25L for most engineering/data roles\n• **Senior (5+yr):** ₹20L-50L+ for specialized roles (ML/Cloud/Architecture)\n\nThe highest-paying niches right now are GenAI/LLM engineering, cloud architecture, and cybersecurity. Would you like a detailed breakdown for a specific role?";
  }
  if (lower.includes("resume") || lower.includes("cv")) {
    return "Great question about resumes! Here are my top recommendations:\n\n1. **Quantify everything** — 'Improved load time by 40%' beats 'Improved load time'\n2. **Tailor per application** — Match keywords from the job description\n3. **ATS-friendly format** — Use our Resume Builder to check your ATS score\n4. **Keep it to 1-2 pages** — Recruiters spend 7 seconds on first scan\n\nWant me to guide you to our AI Resume Builder?";
  }
  if (lower.includes("interview") || lower.includes("prep")) {
    return "Interview preparation is a game-changer. Here's a structured plan:\n\n1. **Technical:** Practice 2-3 coding problems daily on LeetCode (focus on patterns, not quantity)\n2. **System Design:** Study Gaurav Sen's YouTube channel — it's excellent for Indian tech interviews\n3. **Behavioral:** Prepare 5-6 STAR stories covering leadership, conflict, and failure\n4. **Mock Practice:** Use our AI Mock Interview to simulate real conditions\n\nWhat role are you targeting? I can give more specific advice.";
  }
  if (lower.includes("roadmap") || lower.includes("path") || lower.includes("plan")) {
    return "A structured career roadmap is essential. Here's my recommended approach:\n\n1. **Define your target** — Pick 2-3 roles you're interested in\n2. **Gap analysis** — Use our Skill Analyzer to identify what's missing\n3. **Timeline** — Set 3-month milestones with specific deliverables\n4. **Projects** — Build 2-3 showcase projects that demonstrate your target skills\n5. **Network** — Engage on LinkedIn and attend tech meetups\n\nWould you like to upload your resume so I can create a personalized roadmap?";
  }
  if (lower.includes("switch") || lower.includes("transition") || lower.includes("change")) {
    return "Career transitions are more common than you think in tech! Here's what I recommend:\n\n1. **Identify transferable skills** — Your existing experience has more value than you realize\n2. **Bridge the gap** — Focus on the 2-3 skills that are unique to your target role\n3. **Start small** — Take on side projects or freelance gigs in your target domain\n4. **Financial planning** — Use our Financial Engine to plan the transition costs\n5. **Timeline** — Most transitions take 6-12 months of dedicated effort\n\nWhat specific transition are you considering?";
  }
  if (lower.includes("skill") || lower.includes("learn") || lower.includes("course")) {
    return "Smart question! Here are the most in-demand skills for 2025-2026:\n\n🔥 **Explosive Growth:** GenAI/LLMs, Prompt Engineering, MLOps\n📈 **High Demand:** React/Next.js, Python, AWS, Kubernetes\n💰 **Highest Paying:** Cloud Architecture, ML Engineering, Cybersecurity\n\nI recommend focusing on depth over breadth. Master 2-3 core skills rather than spreading thin across 10. Our Skill Analyzer can identify your specific gaps.\n\nWhat's your current tech stack?";
  }
  if (lower.includes("thank")) {
    return "You're welcome! Remember, consistent small steps lead to massive career growth. I'm here 24/7 if you need any more guidance. Keep pushing! 🚀";
  }
  
  return "That's a great topic to explore. Based on current market trends, I'd suggest breaking this down into actionable steps:\n\n1. **Research** — Look at what top professionals in this area are doing\n2. **Identify gaps** — Use our tools to find what you need to improve\n3. **Take action** — Start with the highest-impact, lowest-effort items first\n4. **Iterate** — Track progress monthly and adjust your approach\n\nCould you give me a bit more detail about your specific situation? The more context I have, the more targeted my advice can be.";
}

export default function CareerChat() {
  const { user, profile } = useAuth();
  const displayName = profile?.full_name?.split(" ")[0] || "there";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: `Hi ${displayName}! I'm your AI Career Mentor. I can help you plan your roadmap, analyze skills, prepare for interviews, or just chat about your career goals. What's on your mind today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user context from latest roadmap
  const { data: latestRoadmap } = useQuery({
    queryKey: ["chat-context", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("roadmaps")
        .select("roadmap_data, resume_file_name")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const userContext = latestRoadmap ? (() => {
    const rd = latestRoadmap.roadmap_data as any;
    const skills = rd?.current_skills?.join(', ') || '';
    const roles = rd?.career_roles?.join(', ') || '';
    return `Resume: ${latestRoadmap.resume_file_name || 'uploaded'}. Skills: ${skills}. Target roles: ${roles}.`;
  })() : '';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationHistory, userContext }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      if (data?.error) throw new Error(data.error);

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", content: data.response }
      ]);
    } catch (err: any) {
      console.warn("AI chat failed, using fallback:", err.message);
      // Use intelligent fallback
      const fallbackResponse = generateFallbackResponse(text);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", content: fallbackResponse }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 pt-2">
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          AI Career <span className="gradient-text">Mentor</span> <Sparkles className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Get personalized, AI-powered guidance 24/7</p>
      </motion.div>

      <Card className="glass-card flex-1 flex flex-col overflow-hidden border-primary/20 shadow-lg shadow-primary/5">
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="space-y-6 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-sidebar border border-border text-foreground"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5 text-primary" />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/20" 
                      : "bg-sidebar border border-border text-sidebar-foreground rounded-tl-none"
                  }`}>
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-sidebar border border-border flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="p-4 rounded-2xl bg-sidebar border border-border rounded-tl-none flex items-center gap-1.5 h-[52px]">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-primary/60 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-primary/60 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-primary/60 rounded-full" />
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-sidebar/50 border-t border-border backdrop-blur-sm">
          {messages.length < 3 && !isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="text-xs bg-background hover:bg-primary/10 border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-primary" /> {sug}
                </button>
              ))}
            </motion.div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2 relative">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your career..."
              className="bg-background border-primary/20 focus-visible:ring-primary/50 pr-12 h-12 rounded-xl text-base"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="absolute right-1.5 w-9 h-9 rounded-lg gradient-bg">
              <Navigation className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
              <Bot className="w-3 h-3" /> Powered by AI · Falls back to curated responses
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
