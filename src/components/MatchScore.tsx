import { AlertCircle, BadgeCheck, CheckCircle2, Info, Target } from "lucide-react";
import type { Job } from "@/data/kenzya";
import {
  SKILL_LEVEL_LABEL,
  computeMatch,
  matchWording,
  type CandidateProfile,
  type MatchWeights,
} from "@/data/matching";

export function MatchScore({
  profile,
  job,
  weights,
  compact = false,
}: {
  profile: CandidateProfile;
  job: Job;
  weights?: MatchWeights;
  compact?: boolean;
}) {
  const match = computeMatch(profile, job, weights);
  const wording = matchWording(match.score);

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
        <Target className="h-3.5 w-3.5" /> KENZYA Match {match.score} %
      </span>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            KENZYA Match — {profile.name}
          </p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">{match.score} %</p>
          <p className="mt-1 font-semibold text-foreground">{wording.title}</p>
          <p className="text-sm text-muted-foreground">{wording.body}</p>
        </div>
        <p className="max-w-xs rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
          <Info className="mr-1 inline h-3.5 w-3.5 text-secondary" />
          Ce score est une aide à la décision, pas une décision de recrutement. Il compare des
          éléments renseignés et vérifiables, pas la valeur d'une personne.
        </p>
      </div>

      <h3 className="mt-6 font-display text-sm font-semibold text-primary">
        Comment ce score est obtenu
      </h3>
      <ul className="mt-3 space-y-3">
        {match.criteria.map((c) => (
          <li key={c.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">
                {c.label} <span className="text-muted-foreground">· poids {c.weight} %</span>
              </span>
              <span className="font-semibold text-primary">
                {c.points} / {c.weight}
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-secondary"
                style={{ width: `${Math.round(c.ratio * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4 text-success" /> Compétences correspondantes
          </p>
          {match.matchedSkills.length ? (
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {match.matchedSkills.map((s) => (
                <li key={s.name}>
                  <span className="font-medium text-foreground">{s.name}</span> —{" "}
                  {SKILL_LEVEL_LABEL[s.level]}
                  {s.evidence ? ` · ${s.evidence}` : ""}
                  {s.testScore ? ` (${s.testScore}/100)` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Aucune des compétences demandées n'est encore renseignée dans le profil.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <AlertCircle className="h-4 w-4 text-secondary" /> Compétences à démontrer
          </p>
          {match.gapSkills.length || match.declaredOnly.length ? (
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {match.gapSkills.map((s) => (
                <li key={s}>
                  <span className="font-medium text-foreground">{s}</span> — cette offre la demande,
                  le profil ne permet pas encore de la démontrer.
                </li>
              ))}
              {match.declaredOnly.map((s) => (
                <li key={s.name}>
                  <span className="font-medium text-foreground">{s.name}</span> — déclarée, à
                  confirmer par un test, un projet ou une certification.
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Toutes les compétences demandées sont déjà appuyées par une preuve.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border p-4">
          <p className="text-sm font-semibold text-primary">Expérience et projets pris en compte</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {match.relevantExperiences.map((e) => (
              <li key={e.role + e.company}>
                {e.role} — {e.company} ({e.years} an{e.years > 1 ? "s" : ""})
              </li>
            ))}
            {match.relevantProjects.map((p) => (
              <li key={p.name}>Projet : {p.name}</li>
            ))}
            {!match.relevantExperiences.length && !match.relevantProjects.length && (
              <li>Aucun élément d'expérience ou de projet rattaché à cette offre.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <BadgeCheck className="h-4 w-4 text-secondary" /> Certifications et autres signaux
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {match.relevantCertifications.map((c) => (
              <li key={c.name}>
                {c.name} — {c.issuer} ({c.year}){c.verified ? " · vérifiée" : " · non vérifiée"}
              </li>
            ))}
            {profile.referrals.map((r) => (
              <li key={r.from}>
                Recommandation de {r.from} ({r.relation}) — signal complémentaire, ne remplace pas
                une compétence évaluée.
              </li>
            ))}
            {!match.relevantCertifications.length && !profile.referrals.length && (
              <li>Aucune certification ni recommandation enregistrée.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
