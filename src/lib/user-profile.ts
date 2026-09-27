import type { CandidateProfile, Skill, Experience, Project, Certification } from "@/data/matching";

const STORAGE_KEY = "kenzya_custom_user_profile";

export const DEFAULT_USER_PROFILE: CandidateProfile = {
  id: "my-profile",
  name: "Mon Nom Candidat",
  headline: "Développeur / Professionnel en recherche",
  location: "Abidjan, Côte d'Ivoire",
  targetRole: "Développeur Full Stack — Technologie",
  availability: "Disponible immédiatement",
  skills: [
    { name: "React", level: "evaluee", evidence: "Projet personnel évalué sur KENZYA", testScore: 85 },
    { name: "Node.js", level: "evaluee", evidence: "API REST développée", testScore: 78 },
    { name: "JavaScript", level: "certifiee", evidence: "Certification en ligne" },
    { name: "Tailwind CSS", level: "evaluee", evidence: "Intégration d'interfaces web" },
    { name: "PostgreSQL", level: "declaree" },
    { name: "Git", level: "evaluee", evidence: "Gestion de dépôt de code" },
  ],
  experiences: [
    {
      role: "Développeur Web & Mobile",
      company: "Entreprise ou Freelance",
      years: 2,
      sector: "Technologie",
      summary: "Création et gestion d'applications web modernes et d'API REST.",
    },
  ],
  projects: [
    {
      name: "Plateforme KENZYA CI",
      summary: "Interface de recherche d'emploi et de matching IA.",
      skills: ["React", "Node.js", "Tailwind CSS"],
    },
  ],
  certifications: [
    {
      name: "Certificat Développement Web",
      issuer: "Centre de formation Abidjan",
      year: 2025,
      verified: true,
    },
  ],
  referrals: [],
};

/**
 * Gets the custom user profile stored in localStorage,
 * or initializes it with DEFAULT_USER_PROFILE if not set.
 */
export function getUserProfile(): CandidateProfile {
  if (typeof window === "undefined") return DEFAULT_USER_PROFILE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return {
          ...DEFAULT_USER_PROFILE,
          ...parsed,
          skills: Array.isArray(parsed.skills) ? parsed.skills : DEFAULT_USER_PROFILE.skills,
          experiences: Array.isArray(parsed.experiences) ? parsed.experiences : DEFAULT_USER_PROFILE.experiences,
          projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_USER_PROFILE.projects,
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : DEFAULT_USER_PROFILE.certifications,
          referrals: Array.isArray(parsed.referrals) ? parsed.referrals : DEFAULT_USER_PROFILE.referrals,
        };
      }
    }
  } catch (e) {
    console.warn("Could not read user profile from localStorage:", e);
  }

  // Save default profile on first fetch without triggering synchronous render dispatch
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
  } catch (e) {
    console.warn("Could not write default profile to localStorage:", e);
  }
  return DEFAULT_USER_PROFILE;
}

/**
 * Saves updated candidate profile to localStorage.
 */
export function saveUserProfile(profile: CandidateProfile): CandidateProfile {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      // Dispatch custom window event asynchronously so open components update live without interrupting current render cycle
      setTimeout(() => {
        window.dispatchEvent(new Event("kenzya_profile_updated"));
      }, 0);
    } catch (e) {
      console.warn("Could not save user profile to localStorage:", e);
    }
  }
  return profile;
}

/**
 * Updates basic candidate identity fields.
 */
export function updateUserIdentity(updates: Partial<Pick<CandidateProfile, "name" | "headline" | "location" | "targetRole" | "availability">>): CandidateProfile {
  const current = getUserProfile();
  const updated = { ...current, ...updates };
  return saveUserProfile(updated);
}

/**
 * Adds a new skill to candidate profile.
 */
export function addSkill(skill: Skill): CandidateProfile {
  const current = getUserProfile();
  const exists = current.skills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase());
  
  if (exists) {
    // Update existing skill
    current.skills = current.skills.map((s) =>
      s.name.toLowerCase() === skill.name.toLowerCase() ? skill : s,
    );
  } else {
    current.skills.push(skill);
  }

  return saveUserProfile(current);
}

/**
 * Removes a skill from candidate profile.
 */
export function removeSkill(skillName: string): CandidateProfile {
  const current = getUserProfile();
  current.skills = current.skills.filter((s) => s.name.toLowerCase() !== skillName.toLowerCase());
  return saveUserProfile(current);
}

/**
 * Adds an experience record to candidate profile.
 */
export function addExperience(exp: Experience): CandidateProfile {
  const current = getUserProfile();
  current.experiences.push(exp);
  return saveUserProfile(current);
}

/**
 * Removes an experience record from candidate profile.
 */
export function removeExperience(index: number): CandidateProfile {
  const current = getUserProfile();
  current.experiences.splice(index, 1);
  return saveUserProfile(current);
}
