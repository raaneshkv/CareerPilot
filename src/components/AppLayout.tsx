import { useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Compass, LayoutDashboard, User, LogOut, Moon, Sun, Mic } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const AppLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Logout error:", error);
    } catch (error) {
      console.error("Unexpected error during logout:", error);
    } finally {
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Mock Interview", url: "/mock-interview", icon: Mic },
    { title: "Profile", url: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <Link to="/dashboard" className="group flex items-center gap-2.5 transition-transform duration-300 hover:scale-105">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display text-sidebar-primary-foreground relative">
              CareerPilot
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-sidebar-border">
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <Link to="/dashboard" className="group flex items-center gap-2 transition-transform duration-300 hover:scale-105">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Compass className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold font-display relative">
              CareerPilot
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex border-b border-border bg-background">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary border-b-2 border-primary font-medium"
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
