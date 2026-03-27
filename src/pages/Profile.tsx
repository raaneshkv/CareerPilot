import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, FileText, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

const Profile = () => {
  const { user, profile, refetchProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const { data: roadmaps } = useQuery({
    queryKey: ["roadmaps-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("id, resume_file_name, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("user_id", user.id);
      if (error) throw error;
      
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.info("A confirmation link has been sent to your email.");
      }

      refetchProfile();
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-display">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">{profile?.full_name || "Student"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </Label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Your email address" 
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="gradient-bg text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>

      {/* Resume History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold font-display">Resume History</h2>
        {roadmaps && roadmaps.length > 0 ? (
          <div className="space-y-3">
            {roadmaps.map((rm: any) => (
              <div
                key={rm.id}
                className="glass-card p-4 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/roadmap?id=${rm.id}`)}
              >
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{rm.resume_file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(rm.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No resumes uploaded yet</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
