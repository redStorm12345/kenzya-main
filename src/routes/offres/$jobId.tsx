import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Building2, CalendarClock, MapPin, Send, Bookmark, Sparkles, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { BrevMatchCard } from "@/components/BrevMatchCard";
import { ApplyModal } from "@/components/ApplyModal";
import { formatSalary } from "@/data/kenzya";
import { getAllJobs } from "@/lib/jobs-service";
import { getUserProfile } from "@/lib/user-profile";
import { toast } from "sonner";

export const Route = createFileRoute("/offres/$jobId")({
  loader: ({ params }) => {
    const allJobs = getAllJobs();
    const job = allJobs.find((j) => j.id === params.jobId);
    if (!job) throw notFound();
    return job;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — ${loaderData.company} | KENZYA` },
          {
            name: "description",
            content: `${loaderData.contract} à ${loaderData.location} chez ${loaderData.company}. ${loaderData.description.slice(0, 110)}…`,
          },
          { property: "og:title", content: `${loaderData.title} — ${loaderData.company}` },
          {
            property: "og:description",
            content: `Offre ${loaderData.contract} à ${loaderData.location}, publiée sur KENZYA.`,
          },
        ]
      : [],
  }),
  component: JobDetail,
});

function JobDetail() {
  const job = Route.useLoaderData();
  const allJobs = getAllJobs();
  const similar = allJobs.filter((j) => j.sector === job.sector && j.id !== job.id).slice(0, 2);
  
  const [profile, setProfile] = useState(() => getUserProfile());
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setProfile(getUserProfile());
    window.addEventListener("kenzya_profile_updated", handleUpdate);
    return () => window.removeEventListener("kenzya_profile_updated", handleUpdate);
  }, []);

  const toggleSave = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success("Offre enregistrée dans vos favoris !");
    } else {
      toast.info("Offre retirée des favoris");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Header */}
      <div className="bg-hero-gradient">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
          <Link
            to="/offres"
            className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour au catalogue des offres
          </Link>
          
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md">
                {job.sector} • {job.contract}
              </span>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl md:text-4xl">
                {job.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-primary-foreground/80">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-secondary" /> {job.company}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-secondary" /> {job.location}
                </span>
                {job.deadline && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4 text-secondary" /> Clôture le{" "}
                    {new Date(job.deadline).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsApplyOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-medium transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" /> Postuler en 1 Clic
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          {/* Job Description Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              Description du poste
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground whitespace-pre-line">
              {job.description}
            </p>

            <h2 className="mt-8 font-display text-lg font-bold text-primary">
              Compétences & Profil recherché
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-secondary/10 px-3 py-1.5 text-sm font-semibold text-secondary border border-secondary/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Gemini AI Matching Card */}
          <BrevMatchCard job={job} initialProfile={profile} />
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5 sticky top-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rémunération proposée
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-primary">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </p>
            </div>

            <hr className="border-border" />

            <dl className="space-y-3 text-sm">
              <Row label="Type de contrat" value={job.contract} />
              <Row label="Secteur d'activité" value={job.sector} />
              <Row label="Télétravail" value={job.remote ? "Ouvert / Possible" : "Sur site"} />
              <Row label="Source" value={job.source || "KENZYA Direct"} />
            </dl>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsApplyOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-secondary-foreground transition-smooth hover:opacity-95 shadow-soft"
              >
                <Send className="h-4 w-4" /> Postuler directement
              </button>

              <button
                onClick={toggleSave}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-smooth ${
                  isSaved
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border text-primary hover:bg-muted"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current text-secondary" : ""}`} />
                {isSaved ? "Sauvegardée dans mes favoris" : "Enregistrer l'offre"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Similar Jobs */}
      {similar.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="font-display text-xl font-bold text-primary">Offres similaires en Côte d'Ivoire</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {similar.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </div>
      )}

      {/* Direct Application Modal */}
      <ApplyModal
        job={job}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        candidateProfile={profile}
      />

      <Footer />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}
