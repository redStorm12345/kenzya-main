import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Sparkles,
  Cpu,
  Send,
  Building2,
  ShieldCheck,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Users,
  Briefcase,
  Layers,
  Award,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JOBS, SECTORS, SOURCES, formatSalary } from "@/data/kenzya";
import { computeMatch } from "@/data/matching";
import { getUserProfile } from "@/lib/user-profile";
import heroImage from "@/assets/hero-kenzya.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KENZYA — Emploi en Côte d'Ivoire & Matching CV par IA Gemini 1.5 Flash" },
      {
        name: "description",
        content:
          "Agrégateur d'offres d'emploi en Côte d'Ivoire (Orange CI, Ecobank, SIFCA, Cargill, PFO Africa). Moteur d'adéquation CV propulsé par l'IA Google Gemini.",
      },
      { property: "og:title", content: "KENZYA — Centralisation d'Emploi & Matching CV IA Gemini" },
      {
        property: "og:description",
        content:
          "Trouvez votre prochain poste à Abidjan ou en région et calculez votre score d'adéquation CV avec Google Gemini 1.5 Flash.",
      },
    ],
  }),
  component: Home,
});

const FEATURED_EMPLOYERS = [
  { name: "Orange Côte d'Ivoire", sector: "Télécom & Tech", location: "Abidjan, Marcory", badge: "Recrute" },
  { name: "Ecobank CI", sector: "Banque & Finance", location: "Abidjan, Plateau", badge: "Recrute" },
  { name: "SIFCA Group", sector: "Agro-industrie", location: "Abidjan & Régions", badge: "Recrute" },
  { name: "Cargill West Africa", sector: "Négoce & Cacao", location: "San-Pédro", badge: "Recrute" },
  { name: "PFO Africa", sector: "BTP & Infrastructures", location: "Abidjan, Cocody", badge: "Recrute" },
  { name: "Bboxx Côte d'Ivoire", sector: "Énergie Solaire", location: "Yamoussoukro", badge: "Recrute" },
  { name: "PISAM", sector: "Santé & Médical", location: "Abidjan, Cocody", badge: "Recrute" },
  { name: "Jumia Côte d'Ivoire", sector: "E-Commerce & Logistique", location: "Abidjan, Treichville", badge: "Recrute" },
];

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [demoRoleIndex, setDemoRoleIndex] = useState(0);

  const demoRoles = [
    { title: "Développeur Full-Stack", company: "Orange CI", match: 94, skills: ["React", "Node.js", "TypeScript"] },
    { title: "Data Analyst Junior", company: "Ecobank CI", match: 88, skills: ["SQL", "Excel", "Python"] },
    { title: "Ingénieur Qualité Agro", company: "SIFCA Group", match: 91, skills: ["HACCP", "Contrôle Qualité"] },
  ];

  const currentDemo = demoRoles[demoRoleIndex]!;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient py-16 md:py-24">
        <img
          src={heroImage}
          alt="Professionnels ivoiriens au travail à Abidjan"
          width={1600}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="relative mx-auto max-w-6xl px-4">
          <h1 className="max-w-3xl font-display text-3xl font-extrabold leading-tight text-primary-foreground sm:text-5xl md:text-6xl">
            Toutes les offres d'emploi en Côte d'Ivoire, analysées par l'IA.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-primary-foreground/85 sm:text-base md:text-lg leading-relaxed">
            Centralisez les annonces certifiées d'Abidjan et des régions (Orange CI, Ecobank, SIFCA, Cargill) 
            et découvrez votre <strong className="text-secondary font-bold">Match Score IA</strong> en un instant.
          </p>

          {/* Search Input Bar */}
          <form
            className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl bg-card p-2.5 shadow-elevated sm:flex-row border border-border"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/offres", search: query ? { q: query } : {} });
            }}
          >
            <div className="flex flex-1 items-center gap-2.5 px-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Métier, compétence, entreprise, ville (ex: React, Orange CI, Abidjan)…"
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-7 py-3 text-sm font-bold text-secondary-foreground shadow-soft transition-transform hover:scale-105 cursor-pointer"
            >
              <Search className="h-4 w-4" /> Rechercher les offres
            </button>
          </form>

          {/* Popular Tag Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-primary-foreground/80">
            <span className="font-semibold text-primary-foreground/60">Populaires :</span>
            {["Abidjan", "Orange CI", "Ecobank", "React", "Télétravail", "CDI"].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate({ to: "/offres", search: { q: tag } })}
                className="rounded-lg bg-primary-foreground/10 px-2.5 py-1 text-xs font-semibold hover:bg-primary-foreground/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Key Metric Counters */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 border-t border-primary-foreground/15 pt-6 text-primary-foreground/90">
            <Stat value={`${JOBS.length}+`} label="Annonces vérifiées à jour" />
            <Stat value="Abidjan & Régions" label="Couverture nationale" />
            <Stat value="100% Gratuit" label="Pour les candidats en Côte d'Ivoire" />
          </div>
        </div>
      </section>

      {/* Main Features & Value Proposition */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            Pourquoi utiliser KENZYA ?
          </span>
          <h2 className="font-display text-2xl font-extrabold text-primary md:text-3xl">
            L'Alliance de la Centralisation d'Emploi et de l'IA Gemini
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Fini les recherches éparpillées. Retrouvez tous les postes ivoiriens au même endroit et laissez l'IA évaluer vos chances.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Search className="h-6 w-6 text-secondary" />}
            title="1. Offres Centralisées en Temps Réel"
            text="Agrégation automatique des offres des grands groupes et startups d'Abidjan et des régions ivoiriennes avec mise à jour WebSockets."
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6 text-secondary" />}
            title="2. Matching CV par Intelligence Artificielle"
            text="Analyse sémantique poussée de vos compétences techniques pour mesurer précisément votre compatibilité réelle avec chaque opportunité."
          />
          <FeatureCard
            icon={<Send className="h-6 w-6 text-secondary" />}
            title="3. Candidature Directe & Mot de Motivation"
            text="Postulez directement aux entreprises depuis la plateforme avec un pitch personnalisé généré par l'Intelligence Artificielle."
          />
        </div>
      </section>

      {/* Interactive AI Match Demo Showcase */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="overflow-hidden rounded-3xl bg-hero-gradient p-8 md:p-12 shadow-elevated text-primary-foreground relative">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-3.5 py-1 text-xs font-extrabold text-primary-foreground border border-secondary/30">
                <Sparkles className="h-4 w-4 text-secondary animate-spin" /> Intelligence Artificielle
              </span>
              <h2 className="font-display text-2xl font-extrabold leading-tight md:text-4xl">
                Visualisez votre adéquation CV avec n'importe quel poste
              </h2>
              <p className="text-xs sm:text-sm text-primary-foreground/85 leading-relaxed">
                L'Intelligence Artificielle compare sémantiquement les prérequis de l'annonce avec votre profil candidat, identifiant vos points forts et les compétences clés à valoriser.
              </p>

              {/* Demo selector buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {demoRoles.map((role, idx) => (
                  <button
                    key={role.title}
                    onClick={() => setDemoRoleIndex(idx)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      demoRoleIndex === idx
                        ? "bg-secondary text-secondary-foreground shadow-sm"
                        : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                    }`}
                  >
                    {role.title}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/offres"
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-xs sm:text-sm font-bold text-secondary-foreground shadow-soft transition-transform hover:scale-105"
                >
                  Tester avec mon propre CV <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Demo Gauge Card */}
            <div className="rounded-2xl border border-primary-foreground/20 bg-card/15 backdrop-blur-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Résultat de l'Intelligence Artificielle
                  </span>
                  <h3 className="font-display text-lg font-bold">{currentDemo.title}</h3>
                  <p className="text-xs text-primary-foreground/75">{currentDemo.company}</p>
                </div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background border-4 border-secondary text-secondary font-display text-xl font-extrabold shadow-inner">
                  {currentDemo.match}%
                </div>
              </div>

              <div className="h-2.5 w-full rounded-full bg-primary-foreground/20">
                <div
                  className="h-2.5 rounded-full bg-secondary transition-all duration-500"
                  style={{ width: `${currentDemo.match}%` }}
                />
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs text-primary-foreground/90 font-medium">Compétences validées par l'IA :</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentDemo.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-md bg-success/25 px-2.5 py-0.5 text-xs font-semibold text-success-foreground border border-success/30"
                    >
                      <CheckCircle2 className="h-3 w-3 text-success" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Scraped Jobs Showcase */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Opportunités du moment
            </span>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-primary md:text-3xl">
              Dernières offres publiées en Côte d'Ivoire
            </h2>
          </div>
          <Link to="/offres" className="text-xs sm:text-sm font-bold text-secondary hover:underline flex items-center gap-1">
            Voir le catalogue complet ({JOBS.length} offres) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {JOBS.slice(0, 4).map((job) => (
            <JobCard key={job.id} job={job} candidateProfile={getUserProfile()} />
          ))}
        </div>
      </section>

      {/* Sectors Grid Showcase */}
      <section className="bg-card border-t border-border py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Secteurs Clés
            </span>
            <h2 className="font-display text-2xl font-bold text-primary">
              Explorer les opportunités par Domaine
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {SECTORS.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate({ to: "/offres", search: { q: s.name } })}
                className="group rounded-2xl border border-border bg-background p-5 shadow-xs hover:border-secondary hover:shadow-soft transition-all cursor-pointer space-y-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/15">
                  {s.iconName === "Laptop" && <Cpu className="h-5 w-5 text-secondary" />}
                  {s.iconName === "Landmark" && <Building2 className="h-5 w-5 text-secondary" />}
                  {s.iconName === "Sprout" && <TrendingUp className="h-5 w-5 text-secondary" />}
                  {s.iconName === "HardHat" && <Layers className="h-5 w-5 text-secondary" />}
                  {s.iconName === "Stethoscope" && <Award className="h-5 w-5 text-secondary" />}
                  {s.iconName === "Zap" && <Zap className="h-5 w-5 text-secondary" />}
                </div>
                <h3 className="font-display text-base font-bold text-primary group-hover:text-secondary transition-colors">
                  {s.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary">
                  Parcourir les offres <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-xl sm:text-2xl font-extrabold text-secondary">{value}</p>
      <p className="text-[11px] sm:text-xs text-primary-foreground/80">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-3 hover:border-secondary/40 transition-colors">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15">
        {icon}
      </div>
      <h3 className="font-display text-base font-bold text-primary">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
