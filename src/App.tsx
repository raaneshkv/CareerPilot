import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import Profile from "./pages/Profile";
import MockInterview from "./pages/MockInterview";
import ResumeBuilder from "./pages/ResumeBuilder";
import SkillAnalyzer from "./pages/SkillAnalyzer";
import Trends from "./pages/Trends";
import CareerChat from "./pages/CareerChat";
import Simulation from "./pages/Simulation";
import Discovery from "./pages/Discovery";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/skill-analyzer" element={<SkillAnalyzer />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/career-chat" element={<CareerChat />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/mock-interview" element={<MockInterview />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
