import { Link } from "react-router-dom";
import { Compass, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const PublicNavbar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const logoDestination = user ? "/dashboard" : "/";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/30"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          to={logoDestination}
          className="group flex items-center gap-2.5 transition-transform duration-300 hover:scale-105"
        >
          <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display relative">
            CareerPilot
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors duration-300" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-border/80 hover:scale-105 transition-all duration-300"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Logout
              </Button>
            </>
          ) : !loading ? (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors duration-300" asChild>
                <Link to="/auth?mode=login">Login</Link>
              </Button>
              <Button className="gradient-bg text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300" asChild>
                <Link to="/auth?mode=signup">Sign Up</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </motion.header>
  );
};

export default PublicNavbar;
