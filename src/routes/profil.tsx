import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BadgeCheck,
  FolderGit2,
  GraduationCap,
  Handshake,
  ShieldCheck,
  User,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  Edit,
  Briefcase,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhyRecommended } from "@/components/WhyRecommended";
import { JOBS } from "@/data/kenzya";
import {
  SKILL_LEVEL_HELP,
  SKILL_LEVEL_LABEL,
  computeMatch,
  skillRecommendations,
  type Skill,
  type SkillLevel,
  type Experience,
} from "@/data/matching";
import {
  getUserProfile,
  saveUserProfile,
  addSkill,
  removeSkill,
  addExperience,
  removeExperience,
} from "@/lib/user-profile";
import { toast } from "sonner";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Mon Profil & CV | KENZYA AI" },
      {
        name: "description",
        content:
          "Gérez votre profil candidat, vos compétences certifiées et vos expériences pour le matching IA KENZYA.",
      },
      { property: "og:title", content: "Mon Profil & CV | KENZYA AI" },
    ],
  }),
  component: ProfilPage,
});

function ProfilPage() {
  const [profile, setProfile] = useState(() => getUserProfile());

  // Edit Identity State
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline);
  const [location, setLocation] = useState(profile.location);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [availability, setAvailability] = useState(profile.availability);

  useEffect(() => {
    const handleUpdate = () => {
      const fresh = getUserProfile();
      setProfile(fresh);
    };
    window.addEventListener("kenzya_profile_updated", handleUpdate);
    return () => window.removeEventListener("kenzya_profile_updated", handleUpdate);
  }, []);

  useEffect(() => {
    setName(profile.name);
    setHeadline(profile.headline);
    setLocation(profile.location);
    setTargetRole(profile.targetRole);
    setAvailability(profile.availability);
  }, [profile]);

  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>("evaluee");
  const [newSkillEvidence, setNewSkillEvidence] = useState("");

  // New Experience Form State
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [expRole, setExpRole] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expYears, setExpYears] = useState(1);
  const [expSector, setExpSector] = useState("Technologie");
  const [expSummary, setExpSummary] = useState("");

  // Save Identity Changes
  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveUserProfile({
      ...profile,
      name,
      headline,
      location,
      targetRole,
      availability,
    });
    setProfile(updated);
    setIsEditingIdentity(false);
    toast.success("Vos informations de profil ont été mises à jour !");
  };

  // Add Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const updated = addSkill({
      name: newSkillName.trim(),
      level: newSkillLevel,
      evidence: newSkillEvidence.trim() || undefined,
    });
    setProfile(updated);
    setNewSkillName("");
    setNewSkillEvidence("");
    toast.success(`Compétence '${newSkillName}' ajoutée à votre profil !`);
  };

  // Remove Skill
  const handleRemoveSkill = (skillName: string) => {
    const updated = removeSkill(skillName);
    setProfile(updated);
    toast.info(`Compétence '${skillName}' retirée`);
  };

  // Add Experience
  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expRole.trim() || !expCompany.trim()) return;

    const updated = addExperience({
      role: expRole.trim(),
      company: expCompany.trim(),
      years: Number(expYears),
      sector: expSector,
      summary: expSummary.trim() || "Expérience professionnelle",
    });
    setProfile(updated);
    setExpRole("");
    setExpCompany("");
    setExpSummary("");
    setIsAddingExp(false);
    toast.success("Expérience ajoutée à votre profil !");
  };

  // Remove Experience
  const handleRemoveExperience = (index: number) => {
    const updated = removeExperience(index);
    setProfile(updated);
    toast.info("Expérience retirée");
  };

  const opportunities = JOBS.map((job) => ({ job, match: computeMatch(profile, job) }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);
  const toDevelop = skillRecommendations(profile);

  const declared = profile.skills.filter((s) => s.level === "declaree");
  const proven = profile.skills.filter((s) => s.level !== "declaree");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header Hero */}
      <div className="bg-hero-gradient">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent border border-accent/30">
                <User className="h-3.5 w-3.5" /> Mon Profil Personnel Actif
              </span>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl md:text-4xl">
                {profile.name}
              </h1>
              <p className="mt-1 text-sm text-primary-foreground/80">{profile.headline}</p>
            </div>

            <button
              onClick={() => setIsEditingIdentity(!isEditingIdentity)}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-xs font-bold text-secondary-foreground shadow-soft hover:opacity-95"
            >
              <Edit className="h-4 w-4" /> {isEditingIdentity ? "Fermer l'édition" : "Modifier mes infos"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        {/* Identity Edit Form */}
        {isEditingIdentity && (
          <form onSubmit={handleSaveIdentity} className="rounded-2xl border border-secondary/30 bg-card p-6 shadow-medium space-y-4">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <User className="h-5 w-5 text-secondary" /> Modifier mon profil personnel
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-foreground">Nom & Prénom</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Intitulé professionnel / Headline</label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Localisation (Ville / Commune)</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Poste recherché</label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Disponibilité</label>
              <input
                type="text"
                required
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-secondary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingIdentity(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-5 py-2 text-xs font-bold text-secondary-foreground"
              >
                <Save className="h-4 w-4" /> Enregistrer le profil
              </button>
            </div>
          </form>
        )}

        {/* Identity View Card */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-primary">{profile.name}</h2>
            <p className="font-medium text-foreground text-sm">{profile.headline}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-secondary" /> {profile.location}</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-secondary" /> Objectif : {profile.targetRole}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-secondary" /> {profile.availability}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3.5 py-1.5 text-xs font-bold text-success border border-success/30">
            <CheckCircle2 className="h-4 w-4" /> Profil Actif pour le Matching IA
          </span>
        </section>

        {/* Add Skill Form */}
        <section className="rounded-2xl border border-secondary/20 bg-card p-6 shadow-soft space-y-4">
          <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
            <Plus className="h-4 w-4 text-secondary" /> Ajouter une compétence à votre CV
          </h3>
          <form onSubmit={handleAddSkill} className="grid gap-3 sm:grid-cols-4 items-end">
            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-foreground">Compétence</label>
              <input
                type="text"
                required
                placeholder="ex: React, Python, SQL..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-secondary"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-foreground">Niveau de validation</label>
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-secondary"
              >
                <option value="evaluee">Évaluée (Projet/Test)</option>
                <option value="certifiee">Certifiée (Diplôme/Certif)</option>
                <option value="declaree">Déclarée</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-foreground">Preuve / Justificatif</label>
              <input
                type="text"
                placeholder="ex: Projet E-commerce, Test 85/100..."
                value={newSkillEvidence}
                onChange={(e) => setNewSkillEvidence(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-secondary"
              />
            </div>

            <div className="sm:col-span-1">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground hover:opacity-95"
              >
                <Plus className="h-4 w-4" /> Ajouter la compétence
              </button>
            </div>
          </form>
        </section>

        {/* Proven vs Declared Skills */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* Proven */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="flex items-center justify-between font-display text-lg font-bold text-primary">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-success" /> Compétences démontrées ({proven.length})
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{SKILL_LEVEL_HELP.evaluee}</p>

            <ul className="mt-4 space-y-2.5">
              {proven.map((s) => (
                <li key={s.name} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{s.name}</span>
                      <span className="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                        {SKILL_LEVEL_LABEL[s.level]}
                      </span>
                    </div>
                    {s.evidence && (
                      <p className="mt-1 text-xs text-muted-foreground">Preuve : {s.evidence}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(s.name)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    title="Retirer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {!proven.length && (
                <li className="text-xs text-muted-foreground py-2">
                  Aucune compétence évaluée. Ajoutez-en une ci-dessus !
                </li>
              )}
            </ul>
          </div>

          {/* Declared */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="font-display text-lg font-bold text-primary flex items-center gap-2">
              Compétences déclarées ({declared.length})
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{SKILL_LEVEL_HELP.declaree}</p>

            <ul className="mt-4 space-y-2.5">
              {declared.map((s) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between rounded-xl border border-dashed border-border p-3"
                >
                  <span className="font-medium text-sm text-foreground">{s.name}</span>
                  <button
                    onClick={() => handleRemoveSkill(s.name)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {!declared.length && (
                <li className="text-xs text-muted-foreground py-2">
                  Toutes vos compétences actuelles ont un niveau de preuve évalué.
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* Experiences Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-secondary" /> Mes Expériences Professionnelles ({profile.experiences.length})
            </h3>
            <button
              onClick={() => setIsAddingExp(!isAddingExp)}
              className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Ajouter une expérience
            </button>
          </div>

          {isAddingExp && (
            <form onSubmit={handleAddExperience} className="rounded-xl border border-secondary/30 bg-muted/20 p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Intitulé du poste</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Développeur Web"
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Entreprise / Agence</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Wôrô Digital Abidjan"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Secteur</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Technologie, Finance..."
                    value={expSector}
                    onChange={(e) => setExpSector(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Résumé des missions</label>
                <input
                  type="text"
                  placeholder="Missions principales réalisées..."
                  value={expSummary}
                  onChange={(e) => setExpSummary(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-secondary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingExp(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-secondary px-4 py-1.5 text-xs font-bold text-secondary-foreground"
                >
                  Enregistrer l'expérience
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {profile.experiences.map((exp, idx) => (
              <div key={idx} className="flex items-start justify-between rounded-xl border border-border p-4 bg-background">
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {exp.role} — <span className="text-secondary">{exp.company}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exp.years} an{exp.years > 1 ? "s" : ""} • Secteur {exp.sector}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{exp.summary}</p>
                </div>
                <button
                  onClick={() => handleRemoveExperience(idx)}
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* AI Recommendations personalized for User's Own Profile */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" /> Offres les plus compatibles avec VOTRE profil actuel
          </h2>
          <div className="space-y-4">
            {opportunities.map(({ job, match }) => (
              <div key={job.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      to="/offres/$jobId"
                      params={{ jobId: job.id }}
                      className="font-display text-lg font-bold text-primary hover:underline"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <span className="rounded-xl bg-secondary/15 px-3 py-1.5 text-sm font-bold text-secondary">
                    {match.score} % Match
                  </span>
                </div>
                <div className="mt-3">
                  <WhyRecommended
                    reasons={[
                      `Compétences : ${match.matchedSkills.length}/${job.skills.length} des compétences demandées sont dans votre profil personnel.`,
                      match.gapSkills.length
                        ? `Compétences recommandées à ajouter : ${match.gapSkills.join(", ")}.`
                        : "Toutes les compétences demandées sont couvertes !",
                    ]}
                    sources={["votre profil candidat personnel (enregistré)", "exigences de l'offre KENZYA"]}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
