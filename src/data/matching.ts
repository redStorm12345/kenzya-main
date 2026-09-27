import { JOBS, type Job } from "./kenzya";

/**
 * KENZYA MATCH — moteur de correspondance explicable.
 *
 * Principes :
 * - le score est une AIDE À LA DÉCISION, jamais une décision de recrutement ;
 * - chaque point de score est rattaché à une preuve consultable ;
 * - les pondérations sont configurables et non validées scientifiquement.
 */

export type SkillLevel = "declaree" | "evaluee" | "certifiee";

export type Skill = {
  name: string;
  level: SkillLevel;
  /** Preuve rattachée : test, projet, certification, expérience. */
  evidence?: string | undefined;
  /** Score de test sur 100, uniquement si la compétence a été évaluée. */
  testScore?: number | undefined;
};

export type Experience = {
  role: string;
  company: string;
  years: number;
  sector: string;
  summary: string;
};

export type Project = {
  name: string;
  summary: string;
  skills: string[];
  link?: string | undefined;
};

export type Certification = {
  name: string;
  issuer: string;
  year: number;
  verified: boolean;
};

export type Referral = {
  from: string;
  role: string;
  relation: string;
  comment: string;
  /** Une recommandation est un signal, pas une preuve de compétence. */
  weightNote: string;
};

export type CandidateProfile = {
  id: string;
  name: string;
  headline: string;
  location: string;
  targetRole: string;
  availability: string;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  certifications: Certification[];
  referrals: Referral[];
};

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  declaree: "Déclarée",
  evaluee: "Évaluée",
  certifiee: "Certifiée",
};

export const SKILL_LEVEL_HELP: Record<SkillLevel, string> = {
  declaree: "Indiquée par la personne, pas encore vérifiée par KENZYA.",
  evaluee: "Mesurée par un test KENZYA ou démontrée par un projet consultable.",
  certifiee: "Attestée par un organisme extérieur vérifiable.",
};

/** Poids par défaut du score. Configurables, non validés par des données réelles. */
export type MatchWeights = {
  skills: number;
  experience: number;
  projects: number;
  education: number;
  other: number;
};

export const DEFAULT_WEIGHTS: MatchWeights = {
  skills: 40,
  experience: 25,
  projects: 15,
  education: 10,
  other: 10,
};

export const WEIGHT_LABELS: Record<keyof MatchWeights, string> = {
  skills: "Compétences",
  experience: "Expérience",
  projects: "Projets",
  education: "Formation & certifications",
  other: "Autres critères (lieu, contrat, disponibilité)",
};

export type MatchCriterion = {
  key: keyof MatchWeights;
  label: string;
  weight: number;
  /** Part obtenue, entre 0 et 1. */
  ratio: number;
  points: number;
  detail: string;
};

export type MatchResult = {
  score: number;
  criteria: MatchCriterion[];
  matchedSkills: Skill[];
  /** Compétences demandées que le profil ne permet pas encore de démontrer. */
  gapSkills: string[];
  /** Compétences déclarées mais pas encore prouvées, sur les compétences demandées. */
  declaredOnly: Skill[];
  relevantExperiences: Experience[];
  relevantProjects: Project[];
  relevantCertifications: Certification[];
};

const normCache = new Map<string, string>();
const norm = (s: string) => {
  let res = normCache.get(s);
  if (!res) {
    res = s.toLowerCase().trim();
    normCache.set(s, res);
  }
  return res;
};

function skillFor(profile: CandidateProfile, wanted: string) {
  if (!profile || !Array.isArray(profile.skills)) return undefined;
  const normWanted = norm(wanted || "");
  return profile.skills.find((s) => {
    if (!s || !s.name) return false;
    const normName = norm(s.name);
    return normName === normWanted || normName.includes(normWanted) || normWanted.includes(normName);
  });
}

const LEVEL_VALUE: Record<SkillLevel, number> = {
  declaree: 0.55,
  evaluee: 1,
  certifiee: 1,
};

const matchMemoCache = new Map<string, MatchResult>();

export function computeMatch(
  profile: CandidateProfile,
  job: Job,
  weights: MatchWeights = DEFAULT_WEIGHTS,
): MatchResult {
  if (!profile || !job) {
    return {
      score: 0,
      criteria: [],
      matchedSkills: [],
      gapSkills: [],
      declaredOnly: [],
      relevantExperiences: [],
      relevantProjects: [],
      relevantCertifications: [],
    };
  }

  const safeSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const safeExperiences = Array.isArray(profile.experiences) ? profile.experiences : [];

  const cacheKey = `${profile.id || profile.name || "user"}:${job.id}:${safeSkills.length}:${safeExperiences.length}`;
  const cached = matchMemoCache.get(cacheKey);
  if (cached) return cached;

  const result = _computeMatchInternal(profile, job, weights);
  if (matchMemoCache.size > 500) matchMemoCache.clear();
  matchMemoCache.set(cacheKey, result);
  return result;
}

function _computeMatchInternal(
  profile: CandidateProfile,
  job: Job,
  weights: MatchWeights = DEFAULT_WEIGHTS,
): MatchResult {
  const matchedSkills: Skill[] = [];
  const gapSkills: string[] = [];
  let skillPoints = 0;

  const jobSkills = Array.isArray(job.skills) ? job.skills : [];
  for (const wanted of jobSkills) {
    const found = skillFor(profile, wanted);
    if (found) {
      matchedSkills.push(found);
      skillPoints += LEVEL_VALUE[found.level] || 0.55;
    } else {
      gapSkills.push(wanted);
    }
  }
  const skillRatio = jobSkills.length ? skillPoints / jobSkills.length : 0;

  const experiences = Array.isArray(profile.experiences) ? profile.experiences : [];
  const relevantExperiences = experiences.filter(
    (e) => e && (norm(e.sector || "") === norm(job.sector || "") || norm(job.title || "").includes(norm((e.role || "").split(" ")[0] ?? ""))),
  );
  const years = relevantExperiences.reduce((sum, e) => sum + (Number(e.years) || 0), 0);
  const experienceRatio = Math.min(years / 3, 1);

  const projects = Array.isArray(profile.projects) ? profile.projects : [];
  const relevantProjects = projects.filter((p) =>
    p && Array.isArray(p.skills) && p.skills.some((s) => jobSkills.some((j) => norm(j) === norm(s))),
  );
  const projectRatio = Math.min(relevantProjects.length / 2, 1);

  const certifications = Array.isArray(profile.certifications) ? profile.certifications : [];
  const relevantCertifications = certifications.filter(
    (c) => c && (c.verified || jobSkills.some((s) => norm(c.name || "").includes(norm(s)))),
  );
  const educationRatio = Math.min(relevantCertifications.length / 2, 1);

  let otherScore = 0;
  const otherDetails: string[] = [];
  const profileLoc = profile.location || "";
  const jobLoc = job.location || "";

  if (job.remote || norm(jobLoc).includes(norm(profileLoc.split(",")[0] ?? ""))) {
    otherScore += 0.6;
    otherDetails.push(job.remote ? "poste ouvert au télétravail" : "même ville que le candidat");
  } else {
    otherDetails.push("localisation différente du profil");
  }
  const referrals = Array.isArray(profile.referrals) ? profile.referrals : [];
  if (referrals.length > 0) {
    otherScore += 0.4;
    otherDetails.push(`${referrals.length} recommandation(s) reçue(s) — signal, pas preuve`);
  }
  const otherRatio = Math.min(otherScore, 1);

  const criteria: MatchCriterion[] = [
    {
      key: "skills",
      label: WEIGHT_LABELS.skills,
      weight: weights.skills,
      ratio: skillRatio,
      points: Math.round(skillRatio * weights.skills),
      detail: `${matchedSkills.length}/${job.skills.length} compétences demandées retrouvées dans le profil. Une compétence seulement déclarée compte pour moitié.`,
    },
    {
      key: "experience",
      label: WEIGHT_LABELS.experience,
      weight: weights.experience,
      ratio: experienceRatio,
      points: Math.round(experienceRatio * weights.experience),
      detail: years
        ? `${years} an(s) d'expérience dans le secteur ${job.sector} (référence utilisée : 3 ans).`
        : `Aucune expérience déclarée dans le secteur ${job.sector}.`,
    },
    {
      key: "projects",
      label: WEIGHT_LABELS.projects,
      weight: weights.projects,
      ratio: projectRatio,
      points: Math.round(projectRatio * weights.projects),
      detail: relevantProjects.length
        ? `${relevantProjects.length} projet(s) consultable(s) mobilisant les compétences demandées.`
        : "Aucun projet rattaché aux compétences demandées.",
    },
    {
      key: "education",
      label: WEIGHT_LABELS.education,
      weight: weights.education,
      ratio: educationRatio,
      points: Math.round(educationRatio * weights.education),
      detail: relevantCertifications.length
        ? `${relevantCertifications.length} certification(s) prise(s) en compte.`
        : "Aucune certification rattachée à cette offre.",
    },
    {
      key: "other",
      label: WEIGHT_LABELS.other,
      weight: weights.other,
      ratio: otherRatio,
      points: Math.round(otherRatio * weights.other),
      detail: otherDetails.join(" · "),
    },
  ];

  return {
    score: criteria.reduce((sum, c) => sum + c.points, 0),
    criteria,
    matchedSkills,
    gapSkills,
    declaredOnly: matchedSkills.filter((s) => s.level === "declaree"),
    relevantExperiences,
    relevantProjects,
    relevantCertifications,
  };
}

/** Formulation positive et factuelle du niveau de correspondance. */
export function matchWording(score: number) {
  if (score >= 75)
    return {
      title: "Profil très proche des attentes de l'offre",
      body: "La majorité des éléments demandés sont déjà démontrables dans le profil.",
    };
  if (score >= 50)
    return {
      title: "Profil partiellement aligné",
      body: "Une partie des attentes est couverte ; d'autres éléments restent à démontrer.",
    };
  return {
    title: "Cette opportunité demande des éléments que le profil ne permet pas encore de démontrer",
    body: "Ce n'est pas un jugement sur la personne : c'est un écart mesuré entre le profil actuel et le contenu de cette offre.",
  };
}

/* ------------------------------------------------------------------ */
/* Données du marché — calculées sur le jeu d'offres disponible        */
/* ------------------------------------------------------------------ */

export type SkillDemand = { skill: string; count: number; share: number; sectors: string[] };

export function skillDemand(jobs: Job[] = JOBS): SkillDemand[] {
  const map = new Map<string, { count: number; sectors: Set<string> }>();
  for (const job of jobs) {
    for (const s of job.skills) {
      const entry = map.get(s) ?? { count: 0, sectors: new Set<string>() };
      entry.count += 1;
      entry.sectors.add(job.sector);
      map.set(s, entry);
    }
  }
  return [...map.entries()]
    .map(([skill, v]) => ({
      skill,
      count: v.count,
      share: Math.round((v.count / jobs.length) * 100),
      sectors: [...v.sectors],
    }))
    .sort((a, b) => b.count - a.count);
}

export function sectorDemand(jobs: Job[] = JOBS) {
  const map = new Map<string, number>();
  for (const job of jobs) map.set(job.sector, (map.get(job.sector) ?? 0) + 1);
  return [...map.entries()]
    .map(([sector, count]) => ({ sector, count, share: Math.round((count / jobs.length) * 100) }))
    .sort((a, b) => b.count - a.count);
}

export function contractDemand(jobs: Job[] = JOBS) {
  const map = new Map<string, number>();
  for (const job of jobs) map.set(job.contract, (map.get(job.contract) ?? 0) + 1);
  return [...map.entries()]
    .map(([contract, count]) => ({ contract, count, share: Math.round((count / jobs.length) * 100) }))
    .sort((a, b) => b.count - a.count);
}

/** Compétences à développer, avec la raison chiffrée de la recommandation. */
export function skillRecommendations(profile: CandidateProfile, jobs: Job[] = JOBS) {
  if (!profile) return [];
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const owned = new Set(skills.map((s) => norm(s?.name || "")));
  const targetRole = profile.targetRole || "";
  const target = jobs.filter(
    (j) => j && (norm(j.sector || "") === norm(targetRole.split("—")[1] ?? "") || (j.skills && j.skills.length > 0)),
  );
  return skillDemand(target)
    .filter((d) => ![...owned].some((o) => norm(d.skill).includes(o) || o.includes(norm(d.skill))))
    .slice(0, 5)
    .map((d) => ({
      ...d,
      reason: `Cette compétence apparaît dans ${d.count} des ${target.length} offres du jeu de données KENZYA (${d.share} %), notamment en ${d.sectors.join(", ")}.`,
    }));
}

/* ------------------------------------------------------------------ */
/* Profils candidats                                                   */
/* ------------------------------------------------------------------ */

export const CANDIDATES: CandidateProfile[] = [];

export const DEMO_PROFILE: CandidateProfile = {
  id: "my-profile",
  name: "Mon Profil",
  headline: "Candidat en recherche d'emploi",
  location: "Abidjan, Côte d'Ivoire",
  targetRole: "Professionnel qualifié",
  availability: "Disponible immédiatement",
  skills: [
    { name: "React", level: "evaluee", evidence: "Développement web" },
    { name: "Node.js", level: "evaluee", evidence: "API REST" },
    { name: "SQL", level: "declaree" },
  ],
  experiences: [],
  projects: [],
  certifications: [],
  referrals: [],
};
