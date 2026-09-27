import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SOURCES } from "@/data/kenzya";
import { contractDemand, sectorDemand, skillDemand } from "@/data/matching";
import { getAllJobs } from "@/lib/jobs-service";

export const Route = createFileRoute("/marche")({
  head: () => ({
    meta: [
      { title: "Données du marché de l'emploi ivoirien | KENZYA" },
      {
        name: "description",
        content:
          "Compétences, secteurs et types de contrat les plus demandés, calculés directement sur les offres collectées par KENZYA.",
      },
      { property: "og:title", content: "Données du marché de l'emploi | KENZYA" },
      {
        property: "og:description",
        content: "Ce que les offres demandent réellement : compétences, secteurs, contrats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarchePage,
});

function MarchePage() {
  const jobs = getAllJobs();

  const skills = skillDemand(jobs);
  const sectors = sectorDemand(jobs);
  const contracts = contractDemand(jobs);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-hero-gradient">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-xs font-bold uppercase tracking-wide text-secondary">
            Observatoire KENZYA en Temps Réel
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Ce que les offres demandent réellement en Côte d'Ivoire
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-primary-foreground/85 leading-relaxed">
            Chaque pourcentage de cette page est calculé en temps réel sur la base des offres d'emploi 
            collectées sur la plateforme.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-5 text-xs text-foreground space-y-1">
          <p className="font-bold flex items-center gap-2 text-secondary">
            <span className="h-2 w-2 rounded-full bg-success animate-ping" /> Base de calcul dynamique active
          </p>
          <p className="text-muted-foreground">
            Analyse recalculée en direct sur <strong>{jobs.length} offres d'emploi</strong> agrégées 
            depuis {SOURCES.length} sources principales en Côte d'Ivoire.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold text-primary">
            Compétences les plus demandées par les recruteurs
          </h2>
          <ul className="mt-4 space-y-3">
            {skills.slice(0, 12).map((s) => (
              <li key={s.skill}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-bold text-foreground">{s.skill}</span>
                  <span className="text-muted-foreground text-xs font-semibold">
                    {s.count} offre{s.count > 1 ? "s" : ""} · {s.share} %
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-secondary transition-all duration-500" style={{ width: `${s.share}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Secteurs : {s.sectors.join(", ")}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-primary">Secteurs d'activité qui recrutent</h2>
            <ul className="mt-4 space-y-2.5 text-xs">
              {sectors.map((s) => (
                <li key={s.sector} className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="font-semibold text-foreground">{s.sector}</span>
                  <span className="text-secondary font-bold">
                    {s.count} offre{s.count > 1 ? "s" : ""} ({s.share} %)
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-primary">Répartition des Types de Contrat</h2>
            <ul className="mt-4 space-y-2.5 text-xs">
              {contracts.map((c) => (
                <li key={c.contract} className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="font-semibold text-foreground">{c.contract}</span>
                  <span className="text-secondary font-bold">
                    {c.count} offre{c.count > 1 ? "s" : ""} ({c.share} %)
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
