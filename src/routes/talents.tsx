import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Clock, Search, ShieldCheck, Users, User, Sparkles, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SKILL_LEVEL_LABEL, computeMatch, type CandidateProfile } from "@/data/matching";
import { getUserProfile } from "@/lib/user-profile";

type Job = Parameters<typeof computeMatch>[1];

function getAllJobs(): Job[] {
  if (typeof window === "undefined") return [];

  try {
    const storedJobs = window.localStorage.getItem("kenzya_jobs");
    return storedJobs ? (JSON.parse(storedJobs) as Job[]) : [];
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/talents")({
  head: () => ({
    meta: [
      { title: "Rechercher des talents par compétences | KENZYA" },
      {
        name: "description",
        content:
          "Recherchez des profils par compétence vérifiée, comparez-les sur les mêmes critères et voyez sur quelles preuves repose chaque correspondance.",
      },
      { property: "og:title", content: "Rechercher des talents par compétences | KENZYA" },
    ],
  }),
  component: TalentsPage,
});

function TalentsPage() {
  const [query, setQuery] = useState("");
  const [onlyProven, setOnlyProven] = useState(false);
  const [allJobs, setAllJobs] = useState(() => getAllJobs());
  const [jobId, setJobId] = useState(allJobs[0]?.id || "");
  const [userProfile, setUserProfile] = useState<CandidateProfile>(() => getUserProfile());

  useEffect(() => {
    const handleProfileUpdate = () => setUserProfile(getUserProfile());
    const handleJobsUpdate = () => setAllJobs(getAllJobs());

    window.addEventListener("kenzya_profile_updated", handleProfileUpdate);
    window.addEventListener("kenzya_jobs_updated", handleJobsUpdate);

    return () => {
      window.removeEventListener("kenzya_profile_updated", handleProfileUpdate);
      window.removeEventListener("kenzya_jobs_updated", handleJobsUpdate);
    };
  }, []);

  const job = allJobs.find((j) => j.id === jobId) || allJobs[0]!;

  const allCandidateProfiles: CandidateProfile[] = [userProfile];

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allCandidateProfiles
      .filter((c) =>
        c.skills.some(
          (s) =>
            (!needle || s.name.toLowerCase().includes(needle) || c.name.toLowerCase().includes(needle) || c.headline.toLowerCase().includes(needle)) &&
            (!onlyProven || s.level !== "declaree"),
        ),
      )
      .map((c) => ({ candidate: c, match: job ? computeMatch(c, job) : { score: 75, criteria: [], matchedSkills: [], gapSkills: [] } }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [query, onlyProven, job, userProfile]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-hero-gradient">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
            Base de données & CVthèque Recruteur
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-primary-foreground md:text-4xl">
            Rechercher des talents par compétences certifiées
          </h1>
          <p className="mt-3 max-w-2xl text-primary-foreground/85 text-sm leading-relaxed">
            Consultez les profils enregistrés sur KENZYA, comparables sur les mêmes critères et évalués par le moteur de matching IA.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Value icon={<Users className="h-4 w-4" />} title="Profils Actifs">
              Recherchez des candidats qualifiés à Abidjan et en région.
            </Value>
            <Value icon={<ShieldCheck className="h-4 w-4" />} title="Preuves de compétences">
              Tests, projets et certifications associés à chaque profil.
            </Value>
            <Value icon={<Clock className="h-4 w-4" />} title="Matching Rapide">
              Comparaison automatique avec vos offres d'emploi.
            </Value>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Compétence (React, SQL, HACCP) ou nom..."
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold focus:border-secondary focus:outline-none"
            >
              {allJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  Comparer pour : {j.title}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={onlyProven}
                onChange={(e) => setOnlyProven(e.target.checked)}
                className="rounded text-secondary"
              />
              Compétences évaluées uniquement
            </label>
          </div>
        </section>

        <section className="space-y-4">
          {results.map(({ candidate, match }) => (
            <article key={candidate.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-primary">{candidate.name}</h2>
                    {candidate.id === "my-profile" && (
                      <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 text-[10px] font-extrabold text-secondary">
                        Mon Profil Actif
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">{candidate.headline}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-secondary" /> {candidate.location}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-secondary" /> {candidate.availability}</span>
                  </div>
                </div>

                {job && (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-3 py-1 text-sm font-extrabold text-secondary">
                      <Sparkles className="h-4 w-4" /> {match.score} % Match
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">pour {job.title}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((s) => (
                  <span
                    key={s.name}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      s.level === "declaree"
                        ? "border border-dashed border-border text-muted-foreground"
                        : "bg-success/15 text-success border border-success/30"
                    }`}
                  >
                    {s.name} • {SKILL_LEVEL_LABEL[s.level]}
                  </span>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Link
                  to="/profil"
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-primary hover:bg-muted"
                >
                  Voir fiche candidat complète
                </Link>
              </div>
            </article>
          ))}

          {!results.length && (
            <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">
              Aucun candidat ne correspond à cette recherche dans la base de données.
            </p>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

function Value({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-primary-foreground/10 p-4 text-primary-foreground">
      <p className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </p>
      <p className="mt-1 text-xs opacity-80">{children}</p>
    </div>
  );
}
