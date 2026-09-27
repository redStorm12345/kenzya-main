import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Brain,
  ChevronRight,
  Send,
  HelpCircle,
  User,
} from "lucide-react";
import type { Job } from "@/data/kenzya";
import { type CandidateProfile } from "@/data/matching";
import { getUserProfile } from "@/lib/user-profile";
import { analyzeJobMatchWithBrev, type BrevMatchResponse } from "@/lib/brev-ai";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplyModal } from "@/components/ApplyModal";

interface BrevMatchCardProps {
  job: Job;
  initialProfile?: CandidateProfile;
}

export function BrevMatchCard({ job, initialProfile }: BrevMatchCardProps) {
  const [userProfile, setUserProfile] = useState<CandidateProfile>(() => getUserProfile());
  const selectedProfile = initialProfile || userProfile;
  const [matchData, setMatchData] = useState<BrevMatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);

  // Listen to profile updates from /profil page
  useEffect(() => {
    const handleUpdate = () => {
      const p = getUserProfile();
      setUserProfile(p);
    };
    window.addEventListener("kenzya_profile_updated", handleUpdate);
    return () => window.removeEventListener("kenzya_profile_updated", handleUpdate);
  }, []);

  const runAnalysis = async (profile: CandidateProfile) => {
    setIsLoading(true);
    setMatchData(null);
    try {
      const res = await analyzeJobMatchWithBrev({ job, profile });
      setMatchData(res);
    } catch (error) {
      console.error("Error analyzing match with Brev:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis(selectedProfile);
  }, [job.id, selectedProfile]);

  return (
    <section className="rounded-2xl border border-secondary/20 bg-card p-6 shadow-soft transition-all">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
            <Cpu className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
              Analyse des Compétences
              <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 text-[10px] font-bold text-secondary uppercase tracking-wider border border-secondary/30">
                Intelligence Artificielle
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Analyse sémantique personnalisée de vos compétences avec l'offre
            </p>
          </div>
        </div>

        {/* Candidate Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-muted-foreground">Profil analysé :</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 font-bold text-secondary">
            <User className="h-3.5 w-3.5" /> Mon Profil ({selectedProfile.name})
          </span>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <p className="text-center text-xs font-semibold text-secondary animate-pulse flex items-center justify-center gap-2">
            <Brain className="h-4 w-4 animate-spin" /> Calcul du score de compatibilité sémantique IA...
          </p>
        </div>
      ) : matchData ? (
        <div className="mt-6 space-y-6">
          {/* Top Row: Score + Verdict */}
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-secondary/5 via-primary/5 to-transparent p-5 border border-secondary/15">
            <div className="flex items-center gap-5">
              {/* Circular score gauge */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-background border-4 border-secondary shadow-medium">
                <span className="font-display text-2xl font-extrabold text-primary">
                  {matchData.score}%
                </span>
              </div>

              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-secondary">
                  <Sparkles className="h-3.5 w-3.5" /> Verdict IA KENZYA
                </span>
                <h4 className="font-display text-lg font-bold text-foreground">
                  {matchData.verdictTitle}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-lg">
                  {matchData.verdictSummary}
                </p>
              </div>
            </div>

            {/* Direct Apply Action Button */}
            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-soft transition-all hover:scale-105 ${
                  matchData.score >= 70
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 ring-2 ring-secondary/30"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <Send className="h-4 w-4" /> Postuler avec mon profil
              </button>
            </div>
          </div>

          {/* Criteria Progress Bars */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Détail des critères d'évaluation
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {matchData.criteria.map((c) => (
                <div key={c.key} className="rounded-xl border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{c.label}</span>
                    <span className="font-bold text-secondary">
                      {c.obtainedScore} / {c.maxScore} pts
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-secondary transition-all duration-500"
                      style={{ width: `${(c.obtainedScore / c.maxScore) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{c.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Matched vs Missing Skills Badges */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Matched */}
            <div className="rounded-xl border border-success/30 bg-success/5 p-4">
              <h5 className="flex items-center gap-2 text-xs font-bold text-success uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" /> Compétences validées ({matchData.matchedSkills.length})
              </h5>
              <div className="mt-3 flex flex-wrap gap-2">
                {matchData.matchedSkills.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1 text-xs font-semibold text-success-foreground border border-success/20"
                  >
                    <CheckCircle2 className="h-3 w-3 text-success" /> {s.name} ({s.level})
                  </span>
                ))}
                {matchData.matchedSkills.length === 0 && (
                  <p className="text-xs text-muted-foreground">Aucune compétence directement identifiée.</p>
                )}
              </div>
            </div>

            {/* Missing / Gap */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <h5 className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" /> Compétences recommandées ({matchData.missingSkills.length})
              </h5>
              <div className="mt-3 flex flex-wrap gap-2">
                {matchData.missingSkills.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-500/20"
                  >
                    • {s.name}
                  </span>
                ))}
                {matchData.missingSkills.length === 0 && (
                  <p className="text-xs text-success font-medium">Toutes les compétences demandées sont couvertes !</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Metadata Footer */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-secondary" /> {matchData.aiModel}
            </span>
            <span>Temps de réponse : {matchData.latencyMs} ms</span>
          </div>
        </div>
      ) : null}

      {/* Direct Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        candidateProfile={selectedProfile}
        matchScore={matchData?.score}
      />
    </section>
  );
}
