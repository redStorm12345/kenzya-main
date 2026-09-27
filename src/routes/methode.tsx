import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoDataNotice } from "@/components/DemoDataNotice";
import { JOBS, SOURCES } from "@/data/kenzya";
import { DEFAULT_WEIGHTS, WEIGHT_LABELS, type MatchWeights } from "@/data/matching";

export const Route = createFileRoute("/methode")({
  head: () => ({
    meta: [
      { title: "Méthode et transparence | KENZYA" },
      {
        name: "description",
        content:
          "Comment KENZYA calcule ses scores, sur quelles données il s'appuie, ce que l'IA fait et ne fait pas, et ce que le MVP cherche à vérifier.",
      },
      { property: "og:title", content: "Méthode et transparence | KENZYA" },
      {
        property: "og:description",
        content: "Pondérations, sources de données, limites assumées et priorités du MVP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MethodePage,
});

const FEATURES = [
  {
    name: "KENZYA Match expliqué",
    problem: "Un pourcentage seul n'inspire pas confiance et ne dit pas quoi faire.",
    candidate: "Comprendre précisément ce qui correspond et ce qui reste à démontrer.",
    recruiter: "Trier des profils sur des critères identiques et vérifiables.",
    data: "Compétences de l'offre, compétences prouvées du profil, expériences, projets.",
    complexity: "Faible — calcul déterministe, pas d'IA nécessaire.",
    mvp: "Indispensable",
  },
  {
    name: "Profil basé sur des preuves",
    problem: "Un CV déclaratif ne permet pas de distinguer deux candidats.",
    candidate: "Valoriser des projets réels même sans long diplôme.",
    recruiter: "Voir la preuve derrière chaque compétence affichée.",
    data: "Compétences, niveau de preuve, projets, certifications, expériences.",
    complexity: "Moyenne — structure de données + saisie utilisateur.",
    mvp: "Indispensable",
  },
  {
    name: "Recherche de talents par compétence",
    problem: "Le recruteur revient à son réseau faute de moyen de chercher autrement.",
    candidate: "Être trouvé sans connaître personne dans l'entreprise.",
    recruiter: "Élargir le vivier au-delà des personnes déjà connues.",
    data: "Index des compétences des profils.",
    complexity: "Faible.",
    mvp: "Indispensable",
  },
  {
    name: "Explication des recommandations",
    problem: "Une recommandation sans justification n'est pas crédible.",
    candidate: "Savoir sur quelles données repose un conseil de formation.",
    recruiter: "Comprendre pourquoi un profil remonte en tête.",
    data: "Fréquence des compétences dans les offres collectées.",
    complexity: "Faible.",
    mvp: "Indispensable",
  },
  {
    name: "Tests de compétences réels",
    problem: "Sans évaluation, tout reste déclaratif.",
    candidate: "Prouver un niveau sans diplôme.",
    recruiter: "Fiabiliser la présélection.",
    data: "Banque de tests, résultats, anti-triche.",
    complexity: "Élevée — contenu à produire et à valider.",
    mvp: "Version ultérieure",
  },
  {
    name: "Recommandation par le réseau",
    problem: "Le réseau existe déjà ; il faut l'intégrer sans le laisser tout décider.",
    candidate: "Ajouter un signal humain à son profil.",
    recruiter: "Retrouver la confiance du bouche-à-oreille, tracée.",
    data: "Identité du recommandant, relation, commentaire.",
    complexity: "Moyenne — nécessite des comptes vérifiés.",
    mvp: "Version ultérieure (aperçu dans le MVP)",
  },
  {
    name: "Assistant IA (analyse de profil, écarts, CV)",
    problem: "Les candidats ne savent pas comment progresser concrètement.",
    candidate: "Des pistes personnalisées à partir de ses propres données.",
    recruiter: "Une synthèse rapide d'un profil.",
    data: "Profil structuré + offres, jamais de données inventées.",
    complexity: "Moyenne — appel serveur, garde-fous obligatoires.",
    mvp: "Version ultérieure",
  },
  {
    name: "Collecte automatisée des offres",
    problem: "Les statistiques du marché exigent un volume réel d'offres.",
    candidate: "Plus d'opportunités au même endroit.",
    recruiter: "Un observatoire des compétences fiable.",
    data: "Sources publiques, historisation.",
    complexity: "Élevée — infrastructure et maintenance.",
    mvp: "Version ultérieure",
  },
];

function MethodePage() {
  const [weights, setWeights] = useState<MatchWeights>(DEFAULT_WEIGHTS);
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="bg-hero-gradient">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/70">
            Transparence
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Sur quoi KENZYA se base-t-il ?
          </h1>
          <p className="mt-3 max-w-2xl text-primary-foreground/80">
            Un score ou un conseil qu'on ne peut pas expliquer ne mérite pas la confiance. Cette
            page décrit exactement ce que KENZYA calcule, avec quelles données, et ce qu'il ne sait
            pas encore faire.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <section className="rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold text-primary">
            Pondérations du score KENZYA Match
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ces poids sont un point de départ, pas une vérité scientifique. Ils seront ajustés
            lorsque nous aurons observé de vrais recrutements. Vous pouvez les faire varier ici pour
            voir leur effet.
          </p>
          <div className="mt-5 space-y-4">
            {(Object.keys(weights) as (keyof MatchWeights)[]).map((k) => (
              <div key={k}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{WEIGHT_LABELS[k]}</span>
                  <span className="text-muted-foreground">{weights[k]} %</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={weights[k]}
                  onChange={(e) => setWeights({ ...weights, [k]: Number(e.target.value) })}
                  className="mt-1 w-full accent-[hsl(var(--secondary))]"
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-primary">Total : {total} %</p>
          {total !== 100 && (
            <p className="text-xs text-muted-foreground">
              Un total différent de 100 change l'échelle du score : c'est volontairement visible.
            </p>
          )}
          <button
            onClick={() => setWeights(DEFAULT_WEIGHTS)}
            className="mt-3 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-primary transition-smooth hover:bg-muted"
          >
            Rétablir les valeurs par défaut
          </button>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold text-primary">Nos sources de données</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Offres collectées auprès de : {SOURCES.join(", ")}.</li>
            <li>Offres publiées directement par les recruteurs sur KENZYA.</li>
            <li>Éléments renseignés par les candidats, avec leur niveau de preuve.</li>
            <li>Aucune donnée achetée, aucune statistique estimée à la main.</li>
          </ul>
          <div className="mt-4">
            <DemoDataNotice>
              Le MVP tourne aujourd'hui sur {JOBS.length} offres de test et des profils fictifs.
              Tant que la collecte réelle n'est pas en place, chaque chiffre affiché porte cette
              mention.
            </DemoDataNotice>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-primary">Ce que l'IA fait</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>comparer un profil et une offre, et expliquer les écarts ;</li>
              <li>proposer des pistes de développement rattachées à des offres réelles ;</li>
              <li>aider à formuler un CV à partir des éléments déjà renseignés.</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-primary">Ce que l'IA ne fait pas</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>décider de recruter ou d'écarter une personne ;</li>
              <li>juger la valeur d'un individu ;</li>
              <li>inventer une compétence, une expérience ou une statistique ;</li>
              <li>présenter une recommandation comme une certitude.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-primary">
            Priorités du MVP, fonctionnalité par fonctionnalité
          </h2>
          <div className="mt-4 space-y-4">
            {FEATURES.map((f) => (
              <div key={f.name} className="rounded-2xl bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-primary">{f.name}</h3>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      f.mvp.startsWith("Indispensable")
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {f.mvp}
                  </span>
                </div>
                <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                  <Item label="Problème résolu" value={f.problem} />
                  <Item label="Valeur candidat" value={f.candidate} />
                  <Item label="Valeur recruteur" value={f.recruiter} />
                  <Item label="Données nécessaires" value={f.data} />
                  <Item label="Complexité technique" value={f.complexity} />
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold text-primary">
            Les trois hypothèses que ce MVP doit tester
          </h2>
          <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">H1 —</span> les recruteurs trouvent
              plus vite des profils pertinents. Mesure : temps jusqu'au premier profil retenu,
              nombre de profils consultés.
            </li>
            <li>
              <span className="font-semibold text-foreground">H2 —</span> les candidats comprennent
              quelles opportunités leur correspondent et quoi développer. Mesure : part des
              candidats qui ouvrent le détail du score et suivent une piste de compétence.
            </li>
            <li>
              <span className="font-semibold text-foreground">H3 —</span> les utilisateurs font
              confiance aux recommandations parce qu'elles sont expliquées. Mesure : consultation
              des sections « Pourquoi cette recommandation ? » et retours qualitatifs.
            </li>
          </ol>
        </section>
      </div>

      <Footer />
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
