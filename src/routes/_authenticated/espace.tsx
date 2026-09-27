import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  User,
  Briefcase,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  TrendingUp,
  FileText,
  LogOut,
  ChevronRight,
  PlusCircle,
  Cpu,
  BarChart3,
  Bookmark,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { computeMatch, type CandidateProfile } from "@/data/matching";
import { JOBS, formatSalary, type Job } from "@/data/kenzya";
import { JobCard } from "@/components/JobCard";
import { ApplyModal } from "@/components/ApplyModal";
import { getUserProfile } from "@/lib/user-profile";
import { getAllJobs, subscribeToRealtimeJobs } from "@/lib/jobs-service";

export const Route = createFileRoute("/_authenticated/espace")({
  head: () => ({
    meta: [
      { title: "Mon Espace Candidat | KENZYA AI" },
      {
        name: "description",
        content:
          "Tableau de bord candidat KENZYA : suivez vos candidatures, vos scores de matching IA et votre profil CV.",
      },
      { property: "og:title", content: "Mon Espace Candidat | KENZYA AI" },
      { property: "og:description", content: "Tableau de bord personnalisé pour candidats et recruteurs." },
    ],
  }),
  component: EspacePage,
});

// Mock Initial Submitted Applications for Candidate Demo
const DEMO_APPLICATIONS = [
  {
    id: "app-101",
    ref: "KNZ-948201",
    jobTitle: "Développeur Web Full Stack",
    company: "Wôrô Digital",
    location: "Abidjan, Cocody",
    appliedAt: "2026-09-25T14:30:00Z",
    status: "Transmise au recruteur",
    statusColor: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    matchScore: 88,
    salary: "450 000 — 700 000 FCFA / mois",
  },
  {
    id: "app-102",
    ref: "KNZ-732910",
    jobTitle: "Data Analyst Junior",
    company: "Microfinance Ivoire",
    location: "Abidjan, Plateau",
    appliedAt: "2026-09-21T09:15:00Z",
    status: "En cours d'examen",
    statusColor: "bg-secondary/15 text-secondary",
    matchScore: 78,
    salary: "350 000 — 550 000 FCFA / mois",
  },
];

function EspacePage() {
  const { user, role, fullName, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>(() => getUserProfile());
  const [allJobs, setAllJobs] = useState<Job[]>(() => getAllJobs());

  useEffect(() => {
    const handleUpdate = () => setCandidateProfile(getUserProfile());
    window.addEventListener("kenzya_profile_updated", handleUpdate);
    const unsubscribeJobs = subscribeToRealtimeJobs((updatedJobs) => {
      setAllJobs(updatedJobs);
    });
    return () => {
      window.removeEventListener("kenzya_profile_updated", handleUpdate);
      unsubscribeJobs();
    };
  }, []);

  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "recommendations">(
    "overview",
  );
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  const isRecruiter = role === "recruteur";

  // Top Jobs recommended by Gemini AI match score >= 50%
  const recommendedJobs = allJobs.map((j) => ({
    job: j,
    match: computeMatch(candidateProfile, j),
  }))
    .filter((item) => item.match.score >= 50)
    .sort((a, b) => b.match.score - a.match.score);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Welcome Banner */}
      <div className="bg-hero-gradient">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent font-display text-2xl font-extrabold text-accent-foreground shadow-medium">
                {fullName ? fullName.charAt(0).toUpperCase() : candidateProfile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-0.5 text-xs font-bold text-accent border border-accent/30">
                    <User className="h-3.5 w-3.5" />
                    {isRecruiter ? "Compte Recruteur Pro" : "Espace Candidat Actif"}
                  </span>
                </div>
                <h1 className="mt-1 font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl">
                  Bonjour, {fullName || candidateProfile.name} !
                </h1>
                <p className="text-xs text-primary-foreground/80 mt-0.5">
                  {candidateProfile.headline} • {candidateProfile.location}
                </p>
              </div>
            </div>

            {/* Top Header Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/offres"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-xs font-bold text-secondary-foreground shadow-soft transition-transform hover:scale-105"
              >
                <Send className="h-3.5 w-3.5" /> Voir les offres d'emploi
              </Link>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2.5 text-xs font-semibold text-primary-foreground backdrop-blur-md transition-colors hover:bg-primary-foreground/20"
              >
                <LogOut className="h-3.5 w-3.5" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Body */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">
            Chargement de votre tableau de bord...
          </div>
        ) : isRecruiter ? (
          /* RECRUITER DASHBOARD */
          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold text-primary flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-secondary" /> Tableau de Bord Recruteur
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gérez vos offres publiées et accédez à la CVthèque des candidats certifiés.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card
                  to="/recruteurs"
                  title="Publier une offre d'emploi"
                  body="Rédigez un poste et lancez le matching IA automatique auprès des candidats ivoiriens."
                />
                <Card
                  to="/talents"
                  title="Consulter la CVthèque"
                  body="Recherchez des profils par compétences techniques, niveau et disponibilité."
                />
                <Card
                  to="/marche"
                  title="Analytique du Marché"
                  body="Consultez les salaires moyens et les compétences les plus recherchées en Côte d'Ivoire."
                />
              </div>
            </div>
          </div>
        ) : (
          /* CANDIDATE DASHBOARD */
          <div className="space-y-8">
            {/* KPI Metrics Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={<Send className="h-5 w-5 text-secondary" />}
                title="Candidatures soumises"
                value={DEMO_APPLICATIONS.length.toString()}
                sub="Dernière envoi il y a 2 jours"
              />
              <KpiCard
                icon={<Sparkles className="h-5 w-5 text-success" />}
                title="Offres Fort Match IA"
                value={recommendedJobs.length.toString()}
                sub="Compatibilité sémantique >= 50%"
              />
              <KpiCard
                icon={<CheckCircle2 className="h-5 w-5 text-blue-500" />}
                title="Compétences renseignées"
                value={candidateProfile.skills.length.toString()}
                sub="Évaluées ou certifiées sur votre profil"
              />
              <KpiCard
                icon={<Cpu className="h-5 w-5 text-amber-500" />}
                title="Score de Profil IA"
                value="95%"
                sub="Profil personnalisé actif"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border space-x-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === "overview"
                    ? "border-secondary text-secondary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === "applications"
                    ? "border-secondary text-secondary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Mes Candidatures ({DEMO_APPLICATIONS.length})
              </button>
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === "recommendations"
                    ? "border-secondary text-secondary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Offres Recommandées ({recommendedJobs.length})
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                {/* Recent Applications Feed */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                        <Send className="h-4 w-4 text-secondary" /> Suivi de mes candidatures
                      </h3>
                      <button
                        onClick={() => setActiveTab("applications")}
                        className="text-xs font-bold text-secondary hover:underline"
                      >
                        Voir tout →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {DEMO_APPLICATIONS.map((app) => (
                        <div
                          key={app.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/40"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-muted-foreground">
                                {app.ref}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${app.statusColor}`}
                              >
                                {app.status}
                              </span>
                            </div>
                            <h4 className="mt-1 font-display text-base font-bold text-foreground">
                              {app.jobTitle}
                            </h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                <Building2 className="h-3.5 w-3.5 text-secondary" /> {app.company}
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {app.location}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-bold text-secondary">
                              <Sparkles className="h-3 w-3" /> {app.matchScore}% Match
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Envoyé le {new Date(app.appliedAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Recommended Job */}
                  {recommendedJobs[0] && (
                    <div className="rounded-2xl border border-secondary/30 bg-gradient-to-r from-secondary/5 via-primary/5 to-transparent p-6 shadow-soft space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
                          <Cpu className="h-3.5 w-3.5" /> Offre N°1 Recommandée pour vous
                        </span>
                        <span className="font-display text-sm font-extrabold text-secondary">
                          {recommendedJobs[0].match.score}% Compatibilité
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-xl font-bold text-primary">
                          {recommendedJobs[0].job.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {recommendedJobs[0].job.company} • {recommendedJobs[0].job.location} • {recommendedJobs[0].job.contract}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                          {recommendedJobs[0].job.description}
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <Link
                          to="/offres/$jobId"
                          params={{ jobId: recommendedJobs[0].job.id }}
                          className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-primary hover:bg-muted"
                        >
                          Voir détails
                        </Link>
                        <button
                          onClick={() => {
                            if (recommendedJobs[0]) setSelectedJobForApply(recommendedJobs[0].job);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-5 py-2 text-xs font-bold text-secondary-foreground hover:opacity-95"
                        >
                          <Send className="h-3.5 w-3.5" /> Postuler direct
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Profile Summary Box */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
                        <FileText className="h-4 w-4 text-secondary" /> Mon Profil Personnel
                      </h3>
                      <Link
                        to="/profil"
                        className="text-xs font-bold text-secondary hover:underline"
                      >
                        Modifier →
                      </Link>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Intitulé du poste
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {candidateProfile.targetRole}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Compétences clés ({candidateProfile.skills.length})
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {candidateProfile.skills.map((s) => (
                          <span
                            key={s.name}
                            className="rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Disponibilité
                      </p>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {candidateProfile.availability}
                      </p>
                    </div>

                    <Link
                      to="/profil"
                      className="block text-center w-full rounded-xl border border-border py-2 text-xs font-semibold text-primary hover:bg-muted"
                    >
                      Mettre à jour mes compétences sur mon profil
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Applications */}
            {activeTab === "applications" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
                <h3 className="font-display text-lg font-bold text-primary">
                  Historique de vos candidatures directes
                </h3>
                <div className="space-y-3">
                  {DEMO_APPLICATIONS.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-5 bg-background hover:border-secondary/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-secondary">
                            Réf: {app.ref}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${app.statusColor}`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold text-foreground">
                          {app.jobTitle}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {app.company} • {app.location} • {app.salary}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
                          <Sparkles className="h-3.5 w-3.5" /> Match AI {app.matchScore}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Soumis le {new Date(app.appliedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Recommendations */}
            {activeTab === "recommendations" && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-primary">
                  Offres d'emploi hautement compatibles avec votre profil
                </h3>
                <div className="grid gap-5 md:grid-cols-2">
                  {recommendedJobs.map(({ job }) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      candidateProfile={candidateProfile}
                      onApplyDirectly={(j) => setSelectedJobForApply(j)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Direct Application Modal */}
      <ApplyModal
        job={selectedJobForApply}
        isOpen={!!selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        candidateProfile={candidateProfile}
      />

      <Footer />
    </div>
  );
}

function KpiCard({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">{icon}</div>
      </div>
      <p className="font-display text-3xl font-extrabold text-primary">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function Card({ to, title, body }: { to: "/talents" | "/recruteurs" | "/marche"; title: string; body: string }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-secondary/40"
    >
      <p className="font-display text-base font-bold text-primary">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </Link>
  );
}
