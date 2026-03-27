import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Compass, LayoutDashboard, User, LogOut, Mic, FileEdit, Target, LineChart, MessageSquare, Eye, Map, ChevronRight, Route } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const AppLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Force dark mode globally for premium aesthetic
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 flex gap-1">
           <div className="w-2 h-full bg-primary animate-ping" />
           <div className="w-2 h-full bg-secondary animate-ping delay-75" />
           <div className="w-2 h-full bg-primary animate-ping delay-150" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Roadmap", url: "/roadmap", icon: Route },
    { title: "Resume Builder", url: "/resume-builder", icon: FileEdit },
    { title: "Skill Analyzer", url: "/skill-analyzer", icon: Target, isNew: true },
    { title: "Discovery", url: "/discovery", icon: Map, isNew: true },
    { title: "Trends", url: "/trends", icon: LineChart },
    { title: "Simulation", url: "/simulation", icon: Eye },
    { title: "Mock Interview", url: "/mock-interview", icon: Mic, isNew: true },
    { title: "Mentor Chat", url: "/career-chat", icon: MessageSquare },
    { title: "Profile", url: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-background w-full overflow-hidden">
      {/* Floating Premium Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] h-[calc(100vh-2rem)] my-4 ml-4 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden z-20">
        
        {/* Glow effect back */}
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/10 blur-3xl pointer-events-none" />

        <div className="p-8 pt-10">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black font-display tracking-tight text-white group-hover:text-primary transition-colors">
              CareerPilot
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-white/10 text-white shadow-inner border border-white/10" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-white/40 group-hover:text-white/70"}`} />
                  <span className={`text-sm font-medium ${isActive ? "font-bold" : ""}`}>{item.title}</span>
                </div>
                {item.isNew && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">New</span>
                )}
                {isActive && <motion.div layoutId="nav-indicator" className="w-1 h-5 rounded-full bg-primary absolute right-2" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all duration-300 font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto w-full relative h-[100vh]">
        {/* Universal Mesh gradient behind App Layout pages */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
           <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-secondary/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 w-full h-full lg:px-8 py-8 px-4">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between p-4 mb-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
             <Link to="/dashboard" className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                 <Compass className="w-4 h-4 text-white" />
               </div>
               <span className="font-bold font-display text-lg text-white">CareerPilot</span>
             </Link>
             <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white/50 hover:text-white hover:bg-white/10">
               <LogOut className="w-5 h-5" />
             </Button>
          </header>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="h-full">
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Floating Mentor Chat */}
      <Link
        to="/career-chat"
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all z-50 group"
        title="Talk to AI Mentor"
      >
        <MessageSquare className="w-6 h-6 group-hover:animate-bounce" />
      </Link>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-24 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-around p-2 z-40">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${
                  isActive ? "text-primary" : "text-white/40"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.title}</span>
              </Link>
            )
          })}
      </nav>
    </div>
  );
};

export default AppLayout;
