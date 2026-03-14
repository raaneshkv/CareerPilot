import { motion } from "framer-motion";
import { Briefcase, Building2, MapPin, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobMatch {
    title: string;
    company: string;
    location: string;
    salary: string;
    matchScore: number;
    matchReasons: string[];
}

export function JobMatchList({ roles }: { roles?: string[] }) {
    // Generate mock jobs based on the recommended roles
    const mockJobs: JobMatch[] = (roles || ["Software Engineer", "Frontend Developer"]).slice(0, 3).map((role, i) => {
        const scores = [92, 85, 78];
        const companies = ["Google", "Microsoft", "Amazon"];

        return {
            title: role,
            company: companies[i] || "Tech Co",
            location: "India (Remote)",
            salary: "₹12L - ₹20L",
            matchScore: scores[i] || 70,
            matchReasons: [
                "Strong React skills (+20%)",
                "Recent projects match requirements (+15%)",
                "Missing AWS certification (-5%)"
            ]
        };
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold font-display text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Recommended Job Matches
                </h3>
                <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full">
                    Based on your generated roadmap
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockJobs.map((job, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="glass-card p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors group relative overflow-hidden"
                    >
                        {/* Match Score Indicator */}
                        <div className="absolute top-0 right-0 p-3">
                            <div className={`text-xs font-bold px-2 py-1 rounded-full ${job.matchScore >= 90 ? "bg-success/20 text-success" :
                                job.matchScore >= 80 ? "bg-info/20 text-info" :
                                    "bg-warning/20 text-warning"
                                }`}>
                                {job.matchScore}% Match
                            </div>
                        </div>

                        <h4 className="font-bold text-base mt-1 pr-16">{job.title}</h4>

                        <div className="flex flex-col gap-1.5 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {job.company}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                            <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-success" /> {job.salary}</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/50">
                            <p className="text-xs font-medium mb-1.5">Why it's a match:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                {job.matchReasons.map((reason, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                        <span className="text-primary">•</span>
                                        <span className={reason.includes("-") ? "text-destructive/80" : "text-foreground/80"}>
                                            {reason}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button
                            asChild
                            className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                            variant="outline"
                            size="sm"
                        >
                            <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + " " + job.company)}&location=India`} target="_blank" rel="noopener noreferrer">
                                Easy Apply <ExternalLink className="w-3 h-3 ml-1.5" />
                            </a>
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
