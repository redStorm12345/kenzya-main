import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  Filter,
  User,
  LayoutGrid,
  List,
  AlignJustify,
  ArrowUpDown,
  Bookmark,
  Plus,
  Check,
  Zap,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobListItem } from "@/components/JobListItem";
import { ApplyModal } from "@/components/ApplyModal";
import { AIMatchInspector } from "@/components/AIMatchInspector";
import { SECTORS, type Job } from "@/data/kenzya";
import { computeMatch, type CandidateProfile } from "@/data/matching";
import { getUserProfile, saveUserProfile } from "@/lib/user-profile";
import { getAllJobs } from "@/lib/jobs-service";
import { toast } from "sonner";

const subscribeToRealtimeJobs = (callback: (jobs: Job[]) => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleJobsUpdate = () => callback(getAllJobs());
  window.addEventListener("kenzya_jobs_updated", handleJobsUpdate);

  return () => window.removeEventListener("kenzya_jobs_updated", handleJobsUpdate);
};

type JobSearch = { q?: string | undefined };

export const Route = createFileRoute("/offres/")({
  validateSearch: (search: Record<string, unknown>): JobSearch =>
    typeof search["q"] === "string" ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Offres d'emploi & AI Matching en Côte d'Ivoire | KENZYA" },
      {
        name: "description",
        content:
          "Parcourez les offres d'emploi, stages et alternances en Côte d'Ivoire. Moteur IA de matching de CV et vue personnalisable.",
      },
      { property: "og:title", content: "Offres d'emploi en Côte d'Ivoire | KENZYA" },
      {
        property: "og:description",
        content: "Toutes les offres ivoiriennes agrégées et filtrables avec Matching IA.",
      },
    ],
  }),
  component: JobsPage,
});

const CONTRACTS = ["CDI", "CDD", "Stage", "Freelance", "Alternance"] as const;
type ViewMode = "grid" | "list" | "compact";
type SortOption = "match" | "date" | "salary";

export function JobsPage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [contract, setContract] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [onlyRemote, setOnlyRemote] = useState<boolean>(false);
  const [onlyHighMatch, setOnlyHighMatch] = useState<boolean>(false);

  // Layout View Mode & Sorting State
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortOption>("match");

  // User Profile & Jobs State
  const [userProfile, setUserProfile] = useState<CandidateProfile>(() => getUserProfile());
  const [allJobs, setAllJobs] = useState<Job[]>(() => getAllJobs());

  // Modals & Inspection State
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [inspectingJob, setInspectingJob] = useState<Job | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("kenzya_saved_jobs") || "[]");
    } catch {
      return [];
    }
  });

  // Quick Skill Add state for instant booster
  const [newSkillInput, setNewSkillInput] = useState("");
  const [showSkillBooster, setShowSkillBooster] = useState(false);

  // Subscribe to Realtime WebSocket updates & profile sync
  useEffect(() => {
    const handleProfileUpdate = () => setUserProfile(getUserProfile());
    window.addEventListener("kenzya_profile_updated", handleProfileUpdate);

    const unsubscribeJobs = subscribeToRealtimeJobs((updatedJobs) => {
      setAllJobs(updatedJobs);
    });

    return () => {
      window.removeEventListener("kenzya_profile_updated", handleProfileUpdate);
      unsubscribeJobs();
    };
  }, []);

  // Save favoris to LocalStorage
  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      localStorage.setItem("kenzya_saved_jobs", JSON.stringify(next));
      if (next.includes(jobId)) {
        toast.success("Offre enregistrée dans vos favoris !");
      } else {
        toast.info("Offre retirée des favoris");
      }
      return next;
    });
  };

  // Profile selection
  const currentCandidate: CandidateProfile = userProfile;

  // Quick skill booster addition
  const handleAddSkillToProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const skillName = newSkillInput.trim();
    if (userProfile.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      toast.info("Compétence déjà présente dans votre profil !");
      return;
    }

    const updated: CandidateProfile = {
      ...userProfile,
      skills: [...userProfile.skills, { name: skillName, level: "declaree" }],
    };

    saveUserProfile(updated);
    setUserProfile(updated);
    setNewSkillInput("");
    toast.success(`Compétence "${skillName}" ajoutée à votre profil ! Score recristallisé en temps réel ✨`);
  };

  // Precompute match results ONCE per candidate or jobs update
  const matchMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeMatch>>();
    for (const job of allJobs) {
      map.set(job.id, computeMatch(currentCandidate, job));
    }
    return map;
  }, [allJobs, currentCandidate]);

  // Filtered and Sorted Jobs
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = allJobs.filter((job) => {
      const matchText =
        !needle ||
        [job.title, job.company, job.location, job.sector, ...job.skills]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      const matchContract = !contract || job.contract === contract;
      const matchSector = !sector || job.sector === sector;
      const matchRemote = !onlyRemote || job.remote === true;

      const matchScore = matchMap.get(job.id)?.score ?? 0;
      const matchHigh = !onlyHighMatch || matchScore >= 70;

      return matchText && matchContract && matchSector && matchRemote && matchHigh;
    });

    return list.sort((a, b) => {
      if (sortBy === "match") {
        const scoreA = matchMap.get(a.id)?.score ?? 0;
        const scoreB = matchMap.get(b.id)?.score ?? 0;
        return scoreB - scoreA;
      }
      if (sortBy === "date") {
        const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      }
      if (sortBy === "salary") {
        const salA = a.salaryMax ?? a.salaryMin ?? 0;
        const salB = b.salaryMax ?? b.salaryMin ?? 0;
        return salB - salA;
      }
      return 0;
    });
  }, [query, contract, sector, onlyRemote, onlyHighMatch, allJobs, matchMap, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Search Header */}
      <div className="border-b border-border bg-card shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success border border-success/30">
                  <span className="h-2 w-2 rounded-full bg-success animate-ping" />
                  Flux Temps Réel Actif
                </span>
                {savedJobIds.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-bold text-secondary">
                    <Bookmark className="h-3 w-3 fill-current" /> {savedJobIds.length} favoris
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-extrabold text-primary sm:text-3xl md:text-4xl">
                Offres d'emploi & Matching IA
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
                Explorez le marché ivoirien avec classement intelligent selon votre profil CV.
              </p>
            </div>

            {/* Candidate Profile Selector & Quick Skill Booster */}
            <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-3.5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Calculer l'adéquation IA avec :
                  </label>
                  <p className="mt-0.5 font-bold text-xs text-foreground">
                    Mon Profil ({currentCandidate.name})
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-secondary/20 flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowSkillBooster(!showSkillBooster)}
                  className="text-[11px] font-bold text-secondary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Quick Add Compétence (+ score)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Skill Booster Form */}
          {showSkillBooster && (
            <form onSubmit={handleAddSkillToProfile} className="mt-4 flex items-center gap-2 max-w-md animate-in fade-in">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Ex: Python, React, Supabase, Management..."
                className="flex-1 rounded-xl border border-secondary/40 bg-background px-3 py-1.5 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground shadow-xs hover:opacity-90"
              >
                Ajouter au CV
              </button>
            </form>
          )}

          {/* Filters & Search Input */}
          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 shadow-sm focus-within:border-secondary transition-colors">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Métier, compétence, entreprise, ville (ex: React, Abidjan)..."
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Effacer
                </button>
              )}
            </div>

            <select
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-3 text-sm font-medium focus:border-secondary focus:outline-none cursor-pointer"
            >
              <option value="">Tous les contrats</option>
              {CONTRACTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-3 text-sm font-medium focus:border-secondary focus:outline-none cursor-pointer"
            >
              <option value="">Tous les secteurs</option>
              {[...new Set(allJobs.map((j) => j.sector))].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Filtres rapides :</span>
            <button
              onClick={() => setOnlyHighMatch(!onlyHighMatch)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                onlyHighMatch
                  ? "bg-secondary text-secondary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Match IA &gt; 70%
            </button>
            <button
              onClick={() => setOnlyRemote(!onlyRemote)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                onlyRemote
                  ? "bg-success text-success-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Télétravail
            </button>
            {(query || contract || sector || onlyRemote || onlyHighMatch) && (
              <button
                onClick={() => {
                  setQuery("");
                  setContract("");
                  setSector("");
                  setOnlyRemote(false);
                  setOnlyHighMatch(false);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Results Toolbar & Layout Switcher */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <span className="text-foreground font-bold">{results.length}</span> offre{results.length > 1 ? "s" : ""}{" "}
            disponible{results.length > 1 ? "s" : ""}
          </p>

          <div className="flex items-center gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium hidden sm:inline">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="match">Match IA Score</option>
                <option value="date">Plus Récents</option>
                <option value="salary">Salaire Élevé</option>
              </select>
            </div>

            {/* View Mode Switcher (Grid vs List vs Compact) */}
            <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-secondary text-secondary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Affichage en Grille (Cards)"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === "list"
                    ? "bg-secondary text-secondary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Affichage en Liste Détaillée"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === "compact"
                    ? "bg-secondary text-secondary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Affichage Compact (Haute Densité)"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Offers Container */}
        <div
          className={`mt-6 ${
            viewMode === "grid"
              ? "grid gap-5 md:grid-cols-2"
              : viewMode === "list"
              ? "space-y-4"
              : "space-y-2.5"
          }`}
        >
          {results.map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              candidateProfile={currentCandidate}
              match={matchMap.get(job.id) ?? null}
              viewMode={viewMode}
              onApplyDirectly={(j) => setSelectedJobForApply(j)}
              onInspectMatch={(j) => setInspectingJob(j)}
              isSaved={savedJobIds.includes(job.id)}
              onToggleSave={toggleSaveJob}
            />
          ))}
        </div>

        {/* Empty State */}
        {results.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground space-y-3 bg-card">
            <Filter className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="font-semibold text-foreground">Aucune offre ne correspond exactement à vos critères.</p>
            <p className="text-xs">Essayez d'élargir votre recherche ou de désactiver certains filtres.</p>
            <button
              onClick={() => {
                setQuery("");
                setContract("");
                setSector("");
                setOnlyRemote(false);
                setOnlyHighMatch(false);
              }}
              className="mt-2 rounded-xl bg-secondary/15 px-4 py-2 text-xs font-semibold text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Sectors Grid Navigation */}
        <div className="mt-14 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-primary">Secteurs en forte croissance en Côte d'Ivoire</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {SECTORS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSector(s.name === sector ? "" : s.name)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  sector === s.name
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Match Inspector Modal */}
      <AIMatchInspector
        job={inspectingJob}
        profile={currentCandidate}
        isOpen={!!inspectingJob}
        onClose={() => setInspectingJob(null)}
        onApply={(j) => setSelectedJobForApply(j)}
      />

      {/* Application Modal */}
      <ApplyModal
        job={selectedJobForApply}
        isOpen={!!selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        candidateProfile={currentCandidate}
      />

      <Footer />
    </div>
  );
}
