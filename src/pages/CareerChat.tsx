import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, Navigation, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const SUGGESTIONS = [
  "What skills do I need for a Product Management role?",
  "Can you review my recent Roadmap?",
  "How do I transition from QA to Developer?",
  "What are the highest paying tech jobs right now?",
];

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

    // Highly dynamic simulated AI response
    setTimeout(() => {
      let aiResponse = "";
      const lowerText = text.toLowerCase();
      
      // Intent mapping
      if (lowerText.includes("product management") || lowerText.includes("pm")) {
        aiResponse = "Product Management requires a mix of strategic thinking, user empathy, and technical understanding. I recommend focusing on Agile methodologies, Data Analytics, and UX principles first. Should we create a roadmap for this?";
      } else if (lowerText.includes("qa") && lowerText.includes("developer")) {
        aiResponse = "Transitioning from QA to Developer is a fantastic move! Since you already understand testing, you have a solid foundation. Start by learning JavaScript or Python, and build a few small web applications. Would you like a list of starter projects?";
      } else if (lowerText.includes("hi") || lowerText.includes("hello") || lowerText.includes("hey")) {
        aiResponse = "Hello again! How can I help you accelerate your career today? We can analyze skills, review interview practices, or explore entirely new paths.";
      } else if (lowerText.includes("salary") || lowerText.includes("pay") || lowerText.includes("money") || lowerText.includes("earning")) {
        aiResponse = "If maximizing salary is your primary goal, the current data points strongly towards AI/ML Engineering, Cloud Architecture, and specialized Cybersecurity roles. Based on the Trends dashboard, AI Engineers are seeing over $150k starting in major hubs. Should we identify the skills you need for one of those?";
      } else if (lowerText.includes("resume") || lowerText.includes("cv")) {
        aiResponse = "I can definitely help with your resume! You can use our AI Resume Builder to target specific job descriptions and instantly measure your ATS score. Shall I guide you to that feature?";
      } else if (lowerText.includes("roadmap") || lowerText.includes("future")) {
        aiResponse = "Career Pilot specializes in dynamic roadmaps. If you provide me with your target goal, I can break down the exact timeline, courses, and milestones you need to achieve it. What is your dream role?";
      } else if (lowerText.includes("interview") || lowerText.includes("prep")) {
        aiResponse = "Interview preparation is critical. We offer an AI Mock Interview module that simulates real industry questions and evaluates your spoken answers. Do you want to try a technical or behavioral interview simulation?";
      } else if (lowerText.includes("skill") || lowerText.includes("learn") || lowerText.includes("course")) {
        aiResponse = "Upskilling is the best investment you can make. It's often best to bridge obvious gaps first. Have you run the Skill Gap Analyzer recently to see what's missing for your target roles?";
      } else if (lowerText.includes("thank")) {
        aiResponse = "You're very welcome! I'm here 24/7 if you need any more guidance or a quick motivation boost.";
      } else if (lowerText.length < 15) {
        aiResponse = "I'm listening! Could you provide a bit more detail so I can give you the best specific advice?";
      } else {
        // Fallbacks that cycle or sound intelligent
        const fallbacks = [
          "That's a very interesting perspective. Have you considered how this aligns with the current market trends we're tracking?",
          "I hear you. Balancing those factors is tough. My suggestion would be to focus on small, actionable milestones first. What's the immediate next step you can take today?",
          "That makes sense. Many professionals in the tech industry navigate similar challenges. Would you like me to map out a few alternative paths based on what you just shared?",
          "Fascinating. If you pursue this, the compounding effect on your career over the next 5 years could be massive. Should we run this scenario through the Future Simulation engine?"
        ];
        aiResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", content: aiResponse }
      ]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // randomize typing delay slightly
  };

  return (
    <div className="p-4 md:p-6 lg:max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 pt-2">
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          AI Career <span className="gradient-text">Mentor</span> <Sparkles className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Get personalized guidance 24/7</p>
      </motion.div>

      <Card className="glass-card flex-1 flex flex-col overflow-hidden border-primary/20 shadow-lg shadow-primary/5">
        {/* Chat Area */}
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
                    {msg.content}
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

        {/* Input Area */}
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

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2 relative"
          >
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your career..."
              className="bg-background border-primary/20 focus-visible:ring-primary/50 pr-12 h-12 rounded-xl text-base"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 w-9 h-9 rounded-lg gradient-bg"
            >
              <Navigation className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
              <Bot className="w-3 h-3" /> CareerPilot AI Mentorship Model
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
