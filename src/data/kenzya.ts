export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  contract: "CDI" | "CDD" | "Stage" | "Freelance" | "Alternance";
  sector: string;
  salaryMin?: number;
  salaryMax?: number;
  remote: boolean;
  source: string;
  postedAt: string;
  deadline?: string;
  description: string;
  skills: string[];
};

export const SOURCES = ["Educarrière", "Emploi.ci", "JobIvoire", "NovoJob", "GoAfrica", "KENZYA Direct"];

export const JOBS: Job[] = [
  {
    id: "scraped-edu-101",
    title: "Ingénieur DevOps & Cloud Infrastructure (AWS / Docker)",
    company: "Orange Côte d'Ivoire",
    location: "Abidjan, Marcory",
    contract: "CDI",
    sector: "Technologie",
    salaryMin: 750000,
    salaryMax: 1200000,
    remote: true,
    source: "Educarrière",
    postedAt: "2026-09-26",
    deadline: "2026-10-15",
    description:
      "Collecté sur Educarrière CI. Orange Côte d'Ivoire recherche un Ingénieur DevOps pour automatiser les déploiements de microservices sur Kubernetes & AWS. Vous concevrez les pipelines CI/CD et assurerez la haute disponibilité des plateformes numériques à Abidjan.",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Git", "Python"],
  },
  {
    id: "scraped-emp-102",
    title: "Comptable Général & Référent SYSCOHADA Révisé",
    company: "Groupe SIFCA",
    location: "Abidjan, Plateau",
    contract: "CDI",
    sector: "Finance",
    salaryMin: 500000,
    salaryMax: 750000,
    remote: false,
    source: "Emploi.ci",
    postedAt: "2026-09-25",
    deadline: "2026-10-20",
    description:
      "Collecté sur Emploi.ci. Rattaché au Directeur Financier du Groupe SIFCA, vous assurez la tenue de la comptabilité générale et analytique, les déclarations fiscales mensuelles et la préparation des états financiers selon les normes SYSCOHADA.",
    skills: ["SYSCOHADA", "Sage Saari", "Fiscalité ivoirienne", "Excel avancé", "Audit"],
  },
  {
    id: "scraped-job-103",
    title: "Technicien Contrôle Qualité Cacao & HACCP",
    company: "Cargill West Africa",
    location: "San-Pédro",
    contract: "CDD",
    sector: "Agroalimentaire",
    salaryMin: 350000,
    salaryMax: 500000,
    remote: false,
    source: "JobIvoire",
    postedAt: "2026-09-24",
    deadline: "2026-10-10",
    description:
      "Collecté sur JobIvoire. Vous êtes responsable du contrôle de conformité des fèves de cacao à l'usine de San-Pédro. Application stricte des normes HACCP, prélèvements d'échantillons et rédaction des certificats de qualité à l'exportation.",
    skills: ["HACCP", "Contrôle qualité", "Agronomie", "ISO 22000"],
  },
  {
    id: "scraped-nov-104",
    title: "Conducteur de Travaux Génie Civil & BTP",
    company: "PFO Africa",
    location: "Yamoussoukro",
    contract: "CDI",
    sector: "BTP",
    salaryMin: 850000,
    salaryMax: 1300000,
    remote: false,
    source: "NovoJob",
    postedAt: "2026-09-23",
    description:
      "Collecté sur NovoJob CI. PFO Africa recrute un Conducteur de travaux BTP pour superviser les chantiers d'infrastructures routières à Yamoussoukro. Vous gérez le budget, le respect des délais, la sécurité HSE et les équipes d'exécution.",
    skills: ["Génie civil", "AutoCAD", "HSE", "Gestion de chantier", "Planning"],
  },
  {
    id: "scraped-goa-105",
    title: "Infirmier Major de Service & Urgences",
    company: "Polyclinique Sainte Anne-Marie (PISAM)",
    location: "Abidjan, Cocody",
    contract: "CDI",
    sector: "Santé",
    salaryMin: 320000,
    salaryMax: 480000,
    remote: false,
    source: "GoAfrica",
    postedAt: "2026-09-22",
    description:
      "Collecté sur GoAfrica Online CI. La PISAM recherche un Infirmier Diplômé d'État pour coordonner l'équipe de soins au service des urgences. Prise en charge des patients, gestion des stocks de médicaments et application des protocoles d'hygiène hospitalière.",
    skills: ["Soins infirmiers", "Urgences", "Gestion de soins", "Hygiène hospitalière"],
  },
  {
    id: "scraped-emp-106",
    title: "Data Analyst & Business Intelligence Senior",
    company: "Ecobank Côte d'Ivoire",
    location: "Abidjan, Le Plateau",
    contract: "CDI",
    sector: "Technologie",
    salaryMin: 900000,
    salaryMax: 1400000,
    remote: true,
    source: "Emploi.ci",
    postedAt: "2026-09-21",
    deadline: "2026-10-18",
    description:
      "Collecté sur Emploi.ci. Ecobank recherche un Data Analyst pour analyser les comportements d'utilisation de Mobile Banking et construire des tableaux de bord interactifs Power BI pour la direction générale à Abidjan.",
    skills: ["SQL", "Power BI", "Python", "Statistiques", "Data Mining"],
  },
  {
    id: "scraped-edu-107",
    title: "Responsable Marketing Digital & Social Media",
    company: "Jumia Côte d'Ivoire",
    location: "Abidjan, Treichville",
    contract: "CDI",
    sector: "Marketing",
    salaryMin: 500000,
    salaryMax: 800000,
    remote: true,
    source: "Educarrière",
    postedAt: "2026-09-20",
    description:
      "Collecté sur Educarrière CI. Pilotez l'acquisition digitale et la stratégie de contenu réseaux sociaux pour Jumia CI. Gestion des campagnes Meta Ads, Google Ads et analyse du retour sur investissement (ROI).",
    skills: ["Meta Ads", "Google Analytics", "Réseaux sociaux", "Copywriting", "SEO"],
  },
  {
    id: "scraped-job-108",
    title: "Technicien Supérieur en Électrification Solaire",
    company: "Bboxx Capital Côte d'Ivoire",
    location: "Bouaké",
    contract: "CDD",
    sector: "Énergie",
    salaryMin: 280000,
    salaryMax: 420000,
    remote: false,
    source: "JobIvoire",
    postedAt: "2026-09-19",
    description:
      "Collecté sur JobIvoire. Bboxx CI recrute un technicien pour l'installation et le dépannage de systèmes solaires photovoltaïques dans la région de Bouaké. Maintenance préventive et curative des batteries et convertisseurs.",
    skills: ["Électrotechnique", "Photovoltaïque", "Maintenance industrielle", "Permis de conduire"],
  },
];

export type Sector = {
  id: string;
  name: string;
  iconName: string;
  description: string;
  trending: number;
  growth: number;
  avgSalary: number;
  skills: string[];
  studies: string[];
  bacs: string[];
};

export const SECTORS: Sector[] = [
  {
    id: "technologie",
    name: "Technologie & Numérique",
    iconName: "Laptop",
    description:
      "Développement logiciel, cloud, data, cybersécurité et fintech. Le secteur qui recrute le plus vite à Abidjan (Cocody, Marcory, Plateau).",
    trending: 96,
    growth: 18,
    avgSalary: 850000,
    skills: ["React", "Python", "Bases de données", "Docker", "DevOps"],
    studies: ["ESATIC", "INP-HB", "UFHB", "Orange Digital Center"],
    bacs: ["Scientifique (C, D, E)", "Technique"],
  },
  {
    id: "finance",
    name: "Banque, Finance & Comptabilité",
    iconName: "Landmark",
    description:
      "Comptabilité SYSCOHADA, banque de détail, mobile money et audit. Abidjan est la capitale financière de l'UEMOA.",
    trending: 88,
    growth: 14,
    avgSalary: 680000,
    skills: ["SYSCOHADA", "Sage", "Audit", "Excel avancé", "Fiscalité"],
    studies: ["INP-HB Yamoussoukro", "CESAG", "Universités d'Abidjan"],
    bacs: ["Économique (G2)", "Scientifique"],
  },
  {
    id: "agroalimentaire",
    name: "Agro-industrie & Qualité",
    iconName: "Sprout",
    description:
      "Cacao, hévéa, anacarde, contrôle qualité et transformation locale à San-Pédro, Divo, Abidjan.",
    trending: 84,
    growth: 15,
    avgSalary: 450000,
    skills: ["HACCP", "ISO 22000", "Agronomie", "Contrôle qualité"],
    studies: ["INP-HB ESA", "BTS Agroalimentaire"],
    bacs: ["Scientifique (D, C)", "Technique"],
  },
  {
    id: "btp",
    name: "BTP & Génie Civil",
    iconName: "HardHat",
    description:
      "Routes, ponts, logements et grands travaux d'infrastructures à Yamoussoukro, Abidjan et Bouaké.",
    trending: 80,
    growth: 12,
    avgSalary: 750000,
    skills: ["Génie civil", "AutoCAD", "HSE", "Gestion de chantier"],
    studies: ["INP-HB", "ESTP", "BTS Génie Civil"],
    bacs: ["Scientifique", "Technique"],
  },
  {
    id: "sante",
    name: "Santé & Pharmacie",
    iconName: "Stethoscope",
    description:
      "Soins infirmiers, médecine générale, biologie et santé publique dans les hôpitaux et polycliniques.",
    trending: 85,
    growth: 11,
    avgSalary: 400000,
    skills: ["Soins infirmiers", "Urgences", "Hygiène hospitalière"],
    studies: ["INFAS", "UFR Sciences Médicales UFHB"],
    bacs: ["Scientifique (D, C)"],
  },
  {
    id: "energie",
    name: "Énergie & Solaire",
    iconName: "Zap",
    description:
      "Électrification rurale, kits solaires, maintenance photovoltaïque à Bouaké, Korhogo et Abidjan.",
    trending: 78,
    growth: 16,
    avgSalary: 420000,
    skills: ["Électrotechnique", "Photovoltaïque", "Maintenance"],
    studies: ["INP-HB", "BTS Électrotechnique"],
    bacs: ["Scientifique", "Technique"],
  },
];

export type QuizQuestion = {
  id: string;
  question: string;
  options: { label: string; sectors: string[] }[];
};

export const QUIZ: QuizQuestion[] = [
  {
    id: "bac",
    question: "Quel est ton baccalauréat (ou celui que tu prépares) ?",
    options: [
      { label: "Série scientifique (C, D, E)", sectors: ["technologie", "sante", "btp", "energie"] },
      { label: "Série littéraire (A)", sectors: ["communication", "finance"] },
      { label: "Série économique (G, B)", sectors: ["finance", "logistique", "communication"] },
      { label: "Série technique", sectors: ["btp", "energie", "agroalimentaire", "technologie"] },
    ],
  },
  {
    id: "interet",
    question: "Qu'est-ce qui t'intéresse le plus au quotidien ?",
    options: [
      { label: "Résoudre des problèmes logiques", sectors: ["technologie", "finance"] },
      { label: "Aider et soigner les gens", sectors: ["sante"] },
      { label: "Construire et voir un résultat concret", sectors: ["btp", "energie", "agroalimentaire"] },
      { label: "Créer, écrire, convaincre", sectors: ["communication", "finance"] },
    ],
  },
];

export function scoreQuiz(answers: Record<string, number>) {
  const scores: Record<string, number> = {};
  for (const q of QUIZ) {
    const idx = answers[q.id];
    if (idx === undefined) continue;
    for (const sectorId of q.options[idx]?.sectors ?? []) {
      scores[sectorId] = (scores[sectorId] ?? 0) + 1;
    }
  }
  return SECTORS.map((s) => ({
    sector: s,
    score: Math.round(((scores[s.id] ?? 0) / QUIZ.length) * 70 + (s.trending / 100) * 30),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "Salaire non communiqué";
  const f = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  if (min && max) return `${f(min)} – ${f(max)} FCFA / mois`;
  return `${f((min ?? max)!)} FCFA / mois`;
}
