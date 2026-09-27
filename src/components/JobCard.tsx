import { Link } from "@tanstack/react-router";
import { MapPin, Building2, Clock, Sparkles, Send } from "lucide-react";
import { formatSalary, type Job } from "@/data/kenzya";
import { computeMatch, type CandidateProfile } from "@/data/matching";
import { getUserProfile } from "@/lib/user-profile";

interface JobCardProps {
  job: Job;
  candidateProfile?: CandidateProfile;
  onApplyDirectly?: (job: Job) => void;
}

export function JobCard({ job, candidateProfile, onApplyDirectly }: JobCardProps) {
  const profile = candidateProfile || getUserProfile();
  const match = profile ? computeMatch(profile, job) : null;

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium">
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link
            to="/offres/$jobId"
            params={{ jobId: job.id }}
            className="font-display text-lg font-bold text-primary group-hover:text-secondary transition-colors"
          >
            {job.title}
          </Link>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {job.contract}
            </span>
            {match && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  match.score >= 75
                    ? "bg-success/15 text-success border border-success/30"
                    : match.score >= 50
                      ? "bg-secondary/15 text-secondary border border-secondary/30"
                      : "bg-accent/20 text-amber-700 dark:text-amber-300"
                }`}
              >
                <Sparkles className="h-3 w-3" /> {match.score}% Match
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Building2 className="h-4 w-4 text-secondary" /> {job.company}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {new Date(job.postedAt).toLocaleDateString("fr-FR")}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          {job.description}
        </p>

        {/* Skills Preview */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {s}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-[11px] text-muted-foreground font-medium self-center">
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold text-foreground">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
        
        <div className="flex items-center gap-2">
          {onApplyDirectly && (
            <button
              onClick={() => onApplyDirectly(job)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/15 px-3 py-1.5 text-xs font-bold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <Send className="h-3.5 w-3.5" /> Postuler
            </button>
          )}

          <Link
            to="/offres/$jobId"
            params={{ jobId: job.id }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-muted"
          >
            Voir fiche
          </Link>
        </div>
      </div>
    </div>
  );
}
