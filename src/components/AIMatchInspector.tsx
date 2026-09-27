import { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, X, Send, ArrowRight, Lightbulb } from "lucide-react";
import { formatSalary, type Job } from "@/data/kenzya";
import { computeMatch, type CandidateProfile } from "@/data/matching";
import { getBrevMatchAnalysis, type BrevMatchResult } from "@/lib/brev-ai";

interface AIMatchInspectorProps {
  job: Job | null;
  profile: CandidateProfile;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: Job) => void;
}

export function AIMatchInspector({ job, profile, isOpen, onClose, onApply }: AIMatchInspectorProps) {
  const [aiAnalysis, setAiAnalysis] = useState<BrevMatchResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!isOpen || !job) return null;

  const match = computeMatch(profile, job);

  const fetchAiAdvice = async () => {
    setIsLoadingAi(true);
    try {
      const res = await getBrevMatchAnalysis(job, profile);
      setAiAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hero-gradient text-primary-foreground font-extrabold text-xl shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Analyse sémantique IA KENZYA
              </span>
              <h2 className="font-display text-xl font-bold text-primary">{job.title}</h2>
              <p className="text-xs text-muted-foreground">{job.company} • {job.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Score Banner */}
        <div className="rounded-2xl border border-secondary/30 bg-gradient-to-r from-secondary/10 via-accent/10 to-primary/10 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-secondary bg-background font-display text-xl font-extrabold text-secondary shadow-inner">
              {match.score}%
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Score de Correspondance</p>
              <h3 className="font-display text-lg font-extrabold text-foreground">
                {match.score >= 85
                  ? "Profil Fortement Recommandé !"
                  : match.score >= 70
                  ? "Excellente Adéquation"
                  : match.score >= 50
                  ? "Adéquation Modérée"
                  : "Des compétences clés à développer"}
              </h3>
              <p className="text-xs text-muted-foreground">Calculé pour : <span className="font-bold text-foreground">{profile.name}</span></p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-xs">
            <span className="font-semibold text-foreground">Rémunération : {formatSalary(job.salaryMin, job.salaryMax)}</span>
            <span className="rounded-md bg-secondary/15 px-2.5 py-1 font-bold text-secondary">{job.contract}</span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Matched Skills */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-success font-bold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Compétences validées ({match.matchedSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {match.matchedSkills.length > 0 ? (
                match.matchedSkills.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2.5 py-1 text-xs font-semibold text-success border border-success/20"
                  >
                    ✓ {s.name}
                  </span>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">Aucune compétence directement identifiée.</p>
              )}
            </div>
          </div>

          {/* Gap Skills */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>À perfectionner ({match.gapSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {match.gapSkills.length > 0 ? (
                match.gapSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-500/20"
                  >
                    + {s}
                  </span>
                ))
              ) : (
                <p className="text-xs text-success font-semibold">Toutes les compétences requises sont couvertes !</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Recommendations & Advice section */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>Conseils de l'Intelligence Artificielle pour cette offre</span>
            </div>
            {!aiAnalysis && !isLoadingAi && (
              <button
                onClick={fetchAiAdvice}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground shadow-sm hover:opacity-90 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" /> Obtenir l'avis détaillé IA
              </button>
            )}
          </div>

          {isLoadingAi && (
            <div className="py-4 text-center text-xs text-muted-foreground space-y-2">
              <Sparkles className="mx-auto h-5 w-5 animate-spin text-secondary" />
              <p>Génération de l'analyse personnalisée par l'Intelligence Artificielle...</p>
            </div>
          )}

          {aiAnalysis && (
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed animate-in fade-in">
              <p className="font-medium text-foreground">{aiAnalysis.recommendationAction}</p>
              <div className="pt-2 border-t border-border/60">
                <span className="font-bold text-primary block mb-1">Points forts identifiés :</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {aiAnalysis.matchedSkills.map((s) => (
                    <li key={s.name}>{s.name} ({s.level})</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!aiAnalysis && !isLoadingAi && (
            <p className="text-xs text-muted-foreground">
              Cliquez ci-dessus pour générer des conseils sur mesure pour optimiser votre profil et votre accroche pour <strong>{job.company}</strong>.
            </p>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            Fermer
          </button>

          <button
            onClick={() => {
              onClose();
              onApply(job);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-2.5 text-xs font-bold text-secondary-foreground shadow-medium hover:scale-105 transition-all"
          >
            <Send className="h-4 w-4" /> Postuler avec ce Profil <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
