import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, CheckCircle2, Inbox, ShieldCheck, Send, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { addJob } from "@/lib/jobs-service";
import { SECTORS } from "@/data/kenzya";
import { toast } from "sonner";

export const Route = createFileRoute("/recruteurs")({
  head: () => ({
    meta: [
      { title: "Espace recruteurs — publiez vos offres | KENZYA" },
      {
        name: "description",
        content:
          "Publiez vos offres d'emploi en Côte d'Ivoire, suivez les vues et gérez les candidatures depuis un tableau de bord KENZYA.",
      },
      { property: "og:title", content: "Recrutez en Côte d'Ivoire avec KENZYA" },
      {
        property: "og:description",
        content:
          "Diffusion des offres, statistiques de vues et gestion des candidatures pour les entreprises ivoiriennes.",
      },
    ],
  }),
  component: RecruitersPage,
});

const PLANS = [
  {
    name: "Découverte",
    price: "Gratuit",
    detail: "3 premières offres",
    features: ["Publication d'offres", "Tableau de bord", "Candidatures en ligne"],
    highlight: false,
  },
  {
    name: "Premium",
    price: "45 000 FCFA",
    detail: "par mois",
    features: [
      "Offres illimitées",
      "Offres mises en avant",
      "Statistiques détaillées",
      "Export des candidatures",
    ],
    highlight: true,
  },
  {
    name: "Entreprise",
    price: "Sur devis",
    detail: "grands comptes",
    features: ["Multi-utilisateurs", "Page entreprise dédiée", "Accompagnement personnalisé"],
    highlight: false,
  },
];

function RecruitersPage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Abidjan, Cocody");
  const [contract, setContract] = useState("CDI");
  const [sector, setSector] = useState("Technologie & Innovation");
  const [salaryMin, setSalaryMin] = useState("400000");
  const [salaryMax, setSalaryMax] = useState("700000");
  const [skillsStr, setSkillsStr] = useState("React, Node.js, SQL");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !title || !description) {
      toast.error("Veuillez remplir au moins le nom de l'entreprise, l'intitulé du poste et la description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArray = skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const createdJob = await addJob({
        title,
        company,
        location,
        contract: contract as any,
        sector,
        description,
        skills: skillsArray.length > 0 ? skillsArray : ["Compétence métier"],
        salaryMin: parseInt(salaryMin) || 350000,
        salaryMax: parseInt(salaryMax) || 600000,
        remote: location.toLowerCase().includes("télétravail"),
        source: "Direct Recruteur KENZYA",
      });

      toast.success(`Offre "${title}" publiée avec succès ! Publication en direct sur le flux.`);
      navigate({ to: "/offres/$jobId", params: { jobId: createdJob.id } });
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de la publication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="max-w-2xl font-display text-3xl font-extrabold text-primary-foreground md:text-5xl">
            Recrutez les meilleurs profils en Côte d'Ivoire
          </h1>
          <p className="mt-4 max-w-xl text-sm text-primary-foreground/85 leading-relaxed">
            Publiez vos offres en direct sur KENZYA, profitez du calcul automatique d'adéquation candidat par Gemini IA 
            et recevez les candidatures qualifiées dans votre espace.
          </p>
          <a
            href="#formulaire"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-medium transition-transform hover:scale-105"
          >
            <Send className="h-4 w-4" /> Publier une offre en direct
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-5 md:grid-cols-4">
          <Card icon={<Inbox className="h-5 w-5" />} title="Candidatures centralisées" text="Recevez, filtrez et suivez toutes les candidatures au même endroit." />
          <Card icon={<BarChart3 className="h-5 w-5" />} title="Matching Gemini IA" text="Scores d'adéquation calculés automatiquement pour chaque candidat." />
          <Card icon={<ShieldCheck className="h-5 w-5" />} title="Entreprises vérifiées" text="Un badge de confiance après validation de vos documents." />
          <Card icon={<CheckCircle2 className="h-5 w-5" />} title="Publication instantanée" text="Vos annonces sont immédiatement visibles sur le catalogue." />
        </div>
      </section>

      <section id="formulaire" className="mx-auto max-w-3xl px-4 pb-16">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-medium md:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Formulaire de Publication Directe
            </span>
            <h2 className="font-display text-2xl font-bold text-primary">Publier une offre d'emploi</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Remplissez les informations ci-dessous. L'annonce sera publiée sur la plateforme en temps réel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-foreground">Nom de l'entreprise *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex : Groupe SIFCA, Orange CI, Startup X..."
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Adresse e-mail recruteur</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recrutement@entreprise.ci"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Intitulé du poste *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Développeur Full-Stack, Comptable Senior..."
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Localisation / Ville</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex : Abidjan, Plateau / Yamoussoukro..."
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Type de contrat</label>
              <select
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
              >
                {["CDI", "CDD", "Stage", "Freelance", "Alternance"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Secteur d'activité</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
              >
                {SECTORS.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Salaire Min (FCFA/mois)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="Ex: 400000"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Salaire Max (FCFA/mois)</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="Ex: 700000"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-foreground">Compétences clés demandées (séparées par des virgules)</label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="Ex : React, Node.js, SQL, Management, Anglais"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-foreground">Description détaillée du poste *</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Missions principales, responsabilités, profil recherché et avantages..."
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-secondary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 md:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-xs font-bold text-secondary-foreground shadow-soft hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Publication en cours..." : "Publier l'offre sur KENZYA"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Card({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
        {icon}
      </span>
      <p className="font-display text-sm font-bold text-primary">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
