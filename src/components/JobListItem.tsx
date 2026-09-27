import { Link } from "@tanstack/react-router";
import { MapPin, Building2, Clock, Sparkles, Send, Bookmark, Eye, Check, ChevronRight } from "lucide-react";
import { formatSalary, type Job } from "@/data/kenzya";
import { computeMatch, type CandidateProfile, type MatchResult } from "@/data/matching";

interface JobListItemProps {
  job: Job;
  candidateProfile?: CandidateProfile;
  match?: MatchResult | null;
  viewMode?: "grid" | "list" | "compact";
  onApplyDirectly?: (job: Job) => void;
  onInspectMatch?: (job: Job) => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
}

export function JobListItem({
  job,
  candidateProfile,
  match: matchProp,
  viewMode = "list",
  onApplyDirectly,
  onInspectMatch,
  isSaved = false,
  onToggleSave,
}: JobListItemProps) {
  const match = matchProp !== undefined ? matchProp : (candidateProfile ? computeMatch(candidateProfile, job) : null);

  // COMPACT VIEW (High-density Table-like row)
  if (viewMode === "compact") {
    return (
      <div className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-xs transition-all hover:bg-muted/40 hover:border-secondary/40">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 font-bold text-secondary text-sm">
            {job.company.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/offres/$jobId"
                params={{ jobId: job.id }}
                className="font-display text-sm font-bold text-primary truncate hover:text-secondary transition-colors"
              >
                {job.title}
              </Link>
              <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {job.contract}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {job.company} • {job.location}
            </p>
          </div>
        </div>

        {/* AI Score Badge */}
        {match && (
          <button
            onClick={() => onInspectMatch?.(job)}
            className="hidden sm:flex items-center gap-1 shrink-0 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-bold text-secondary border border-secondary/20 hover:scale-105 transition-transform"
            title="Inspecter l'adéquation IA"
          >
            <Sparkles className="h-3 w-3" /> {match.score}%
          </button>
        )}

        {/* Salary */}
        <div className="hidden md:block text-right text-xs font-bold text-foreground shrink-0 w-32">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(job.id)}
              className={`rounded-lg p-1.5 transition-colors ${
                isSaved ? "text-secondary fill-secondary bg-secondary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Favoris"
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
          )}

          {onApplyDirectly && (
            <button
              onClick={() => onApplyDirectly(job)}
              className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground hover:opacity-90 transition-all shadow-xs"
            >
              <Send className="h-3 w-3" /> Postuler
            </button>
          )}
        </div>
      </div>
    );
  }

  // DETAILED LIST VIEW (Horizontal rich row)
  if (viewMode === "list") {
    return (
      <div className="group flex flex-col md:flex-row items-stretch justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium hover:border-secondary/30 gap-5">
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="rounded-lg bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                  {job.sector}
                </span>
                <span className="rounded-lg bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {job.contract}
                </span>
                {job.remote && (
                  <span className="rounded-lg bg-success/15 px-2.5 py-0.5 text-xs font-bold text-success border border-success/30">
                    Télétravail
                  </span>
                )}
              </div>
              <Link
                to="/offres/$jobId"
                params={{ jobId: job.id }}
                className="font-display text-lg font-bold text-primary group-hover:text-secondary transition-colors"
              >
                {job.title}
              </Link>
            </div>

            {match && (
              <button
                onClick={() => onInspectMatch?.(job)}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1 text-xs font-bold transition-transform hover:scale-105 cursor-pointer ${
                  match.score >= 75
                    ? "bg-success/15 text-success border border-success/30"
                    : match.score >= 50
                    ? "bg-secondary/15 text-secondary border border-secondary/30"
                    : "bg-accent/20 text-amber-700 dark:text-amber-300"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" /> Match IA : {match.score}%
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
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

          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {job.description}
          </p>

          {/* Matched skills preview bar */}
          {match && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground">Compétences :</span>
              {match.matchedSkills.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success"
                >
                  <Check className="h-3 w-3" /> {s.name}
                </span>
              ))}
              {match.gapSkills.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side Actions & Salary */}
        <div className="flex md:flex-col justify-between items-end gap-3 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-5 shrink-0 min-w-[160px]">
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rémunération</p>
            <p className="font-display text-sm font-extrabold text-primary">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(job.id)}
                className={`rounded-xl p-2 border transition-colors ${
                  isSaved
                    ? "border-secondary bg-secondary/10 text-secondary fill-secondary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title="Favoris"
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              </button>
            )}

            {onInspectMatch && (
              <button
                onClick={() => onInspectMatch(job)}
                className="hidden lg:inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-muted transition-colors"
                title="Détails du matching IA"
              >
                <Eye className="h-3.5 w-3.5" /> IA Fit
              </button>
            )}

            {onApplyDirectly && (
              <button
                onClick={() => onApplyDirectly(job)}
                className="inline-flex flex-1 md:flex-none items-center justify-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground shadow-soft hover:opacity-90 transition-all"
              >
                <Send className="h-3.5 w-3.5" /> Postuler
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard GRID CARD (delegates layout to JobCard format with action hooks)
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium hover:border-secondary/30">
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link
            to="/offres/$jobId"
            params={{ jobId: job.id }}
            className="font-display text-lg font-bold text-primary group-hover:text-secondary transition-colors"
          >
            {job.title}
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(job.id)}
                className={`rounded-lg p-1.5 transition-colors ${
                  isSaved ? "text-secondary fill-secondary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              </button>
            )}
            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {job.contract}
            </span>
          </div>
        </div>

        {match && (
          <div className="mt-2">
            <button
              onClick={() => onInspectMatch?.(job)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold cursor-pointer transition-transform hover:scale-105 ${
                match.score >= 75
                  ? "bg-success/15 text-success border border-success/30"
                  : match.score >= 50
                  ? "bg-secondary/15 text-secondary border border-secondary/30"
                  : "bg-accent/20 text-amber-700 dark:text-amber-300"
              }`}
            >
              <Sparkles className="h-3 w-3" /> {match.score}% Match IA
            </button>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
            <Building2 className="h-4 w-4 text-secondary" /> {job.company}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {job.location}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {job.description}
        </p>

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

      <div className="mt-5 border-t border-border pt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold text-foreground">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>

        <div className="flex items-center gap-2">
          {onInspectMatch && (
            <button
              onClick={() => onInspectMatch(job)}
              className="rounded-lg border border-border p-1.5 text-xs text-primary hover:bg-muted"
              title="Inspecter le Match"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}

          {onApplyDirectly && (
            <button
              onClick={() => onApplyDirectly(job)}
              className="inline-flex items-center gap-1 rounded-lg bg-secondary/15 px-3 py-1.5 text-xs font-bold text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <Send className="h-3.5 w-3.5" /> Postuler
            </button>
          )}

          <Link
            to="/offres/$jobId"
            params={{ jobId: job.id }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-muted"
          >
            Fiche
          </Link>
        </div>
      </div>
    </div>
  );
}
