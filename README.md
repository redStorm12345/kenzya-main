# Kenzya: Connect & Grow

Parfait ! Je vais enrichir le prompt avec les nouvelles fonctionnalités (recruteurs, orientation bacheliers, IA) et te donner une liste d'IA à utiliser.

---

🎯 PROMPT COMPLET POUR LE MVP KENZYA (Version enrichie)

```
Je souhaite créer un MVP (Produit Minimum Viable) pour une plateforme d'agrégation d'offres d'emploi en Côte d'Ivoire appelée "KENZYA".

## CONTEXTE ET OBJECTIF
KENZYA est un agrégateur d'offres d'emploi qui collecte automatiquement les offres depuis les principaux sites ivoiriens (Emploi.ci, Educarrière, JobIvoire, GoAfrica, NovoJob), les centralise dans une base de données, et permet aux utilisateurs de consulter les offres et de recevoir des alertes personnalisées.

## NOUVELLES FONCTIONNALITÉS SPÉCIFIQUES

### 1. ESPACE RECRUTEURS
KENZYA propose un espace dédié aux recruteurs qui souhaitent publier leurs offres directement sur la plateforme.

**Fonctionnalités :**
- Inscription séparée pour les recruteurs (avec vérification entreprise)
- Tableau de bord recruteur avec :
  - Publication d'offres (formulaire structuré : titre, description, compétences, lieu, type contrat, salaire, date limite)
  - Gestion des offres publiées (modifier, désactiver, supprimer)
  - Statistiques par offre : nombre de vues, clics, candidatures
  - Gestion des candidatures reçues (consulter, filtrer, exporter)
  - Messagerie interne pour contacter les candidats
- Publication gratuite pour les 3 premières offres, puis formule payante (à définir)
- Validation manuelle des offres avant publication (modération)

**Modèles supplémentaires :**
```python
# Modèle RecruiterProfile
- id (UUID, primary key)
- user_id (UUID, foreign key → User)
- company_name (String, required)
- company_description (Text)
- company_logo (String, URL)
- company_website (String)
- company_size (String) → PME, Grande entreprise, Startup
- industry (String) → Secteur d'activité
- is_verified (Boolean, default=False)
- verification_documents (JSON) → Pièces justificatives
- subscription_plan (String, default="free") → free, premium, enterprise
- subscription_expiry (DateTime)
- created_at (DateTime)
- updated_at (DateTime)

# Modèle JobPost (offres publiées par les recruteurs)
- id (UUID, primary key)
- recruiter_id (UUID, foreign key → RecruiterProfile)
- title (String, required)
- description (Text, required)
- requirements (JSON, compétences requises)
- location (String, required)
- contract_type (String) → CDI, CDD, Stage, Freelance, Alternance
- salary_min (Integer)
- salary_max (Integer)
- is_remote (Boolean, default=False)
- application_deadline (Date)
- status (String, default="pending") → pending, approved, rejected, active, closed
- view_count (Integer, default=0)
- application_count (Integer, default=0)
- is_featured (Boolean, default=False) → Offre mise en avant
- created_at (DateTime)
- updated_at (DateTime)

# Modèle Application (candidatures)
- id (UUID, primary key)
- job_post_id (UUID, foreign key → JobPost)
- user_id (UUID, foreign key → User)
- cover_letter (Text)
- cv_url (String, URL vers CV stocké)
- status (String, default="pending") → pending, reviewed, shortlisted, rejected, hired
- recruiter_notes (Text)
- applied_at (DateTime)
- updated_at (DateTime)
```

Endpoints API Recruteurs :

· POST /api/v1/recruiter/register - Inscription recruteur
· GET /api/v1/recruiter/profile - Profil recruteur
· PUT /api/v1/recruiter/profile - Mise à jour profil
· POST /api/v1/recruiter/jobs - Publier une offre
· GET /api/v1/recruiter/jobs - Liste des offres publiées
· PUT /api/v1/recruiter/jobs/{job_id} - Modifier une offre
· DELETE /api/v1/recruiter/jobs/{job_id} - Supprimer une offre
· GET /api/v1/recruiter/jobs/{job_id}/applications - Voir les candidatures
· PUT /api/v1/recruiter/applications/{app_id}/status - Mettre à jour statut candidature
· GET /api/v1/recruiter/stats - Statistiques recruteur

2. ORIENTATION DES BACHELIERS AVEC IA

KENZYA aide les nouveaux bacheliers à s'orienter vers les secteurs porteurs grâce à l'intelligence artificielle.

Fonctionnalités :

· Questionnaire d'orientation interactif (intérêts, compétences, personnalité)
· Analyse IA des réponses pour proposer des filières adaptées
· Recommandation de secteurs en vogue en Côte d'Ivoire (Tech, Santé, Agroalimentaire, BTP, Finance, Énergie, etc.)
· Informations sur chaque secteur :
  · Débouchés
  · Formations recommandées (écoles, universités, centres)
  · Salaire moyen
  · Taux de recrutement
  · Évolution de carrière possible
· Comparaison de parcours en fonction du baccalauréat (scientifique, littéraire, économique)
· Quiz interactif avec résultats personnalisés
· Accès à des témoignages de professionnels du secteur
· Suggestions d'offres de stage/alternance adaptées

Modèles supplémentaires :

```python
# Modèle OrientationResult
- id (UUID, primary key)
- user_id (UUID, foreign key → User)
- answers (JSON) → Réponses au questionnaire
- recommended_sectors (JSON) → Secteurs recommandés avec score
- career_paths (JSON) → Parcours proposés
- created_at (DateTime)

# Modèle Sector
- id (UUID, primary key)
- name (String) → Technologie, Santé, etc.
- description (Text)
- trending_score (Float) → Popularité actuelle
- job_growth (Float) → Taux de croissance
- avg_salary (Integer) → Salaire moyen
- required_skills (JSON) → Compétences requises
- recommended_studies (JSON) → Formations recommandées
- career_potential (Text) → Perspectives d'évolution
- is_active (Boolean, default=True)
```

Endpoints API Orientation :

· GET /api/v1/orientation/quiz - Récupérer le questionnaire
· POST /api/v1/orientation/analyze - Analyser les réponses (IA)
· GET /api/v1/orientation/results/{user_id} - Récupérer les résultats
· GET /api/v1/orientation/sectors - Liste des secteurs disponibles
· GET /api/v1/orientation/sector/{sector_id} - Détail d'un secteur
· GET /api/v1/orientation/trending - Secteurs en vogue

Modèle IA pour l'orientation :

· Utiliser un modèle de classification simple (Random Forest, SVM) entraîné sur des données d'orientation
· Alternative : utiliser l'API OpenAI pour générer des recommandations personnalisées
· Système de scoring basé sur les réponses et les tendances du marché
· Intégration d'un chatbot conversationnel pour accompagner le bachelier

Exemple de logique IA :

```python
# orientation/ai_advisor.py
def analyze_career_path(answers: dict, user_profile: dict):
    """
    Analyse les réponses du questionnaire pour proposer des orientations
    """
    # 1. Analyser les intérêts
    # 2. Analyser les compétences
    # 3. Analyser la personnalité (Big Five simplifié)
    # 4. Croiser avec les tendances du marché ivoirien
    # 5. Générer des recommandations personnalisées
    
    # Retourne :
    # - Top 3 secteurs recommandés
    # - Explications détaillées
    # - Formations suggérées
    # - Offres d'emploi/stage associées
```

3. INTÉGRATION IA GÉNÉRALE

L'IA est également utilisée pour :

· Analyse des offres : Catégorisation automatique des offres par secteur
· Extraction des compétences : Détection automatique des compétences requises dans les descriptions
· Recommandation d'offres : Suggestion d'offres similaires à l'utilisateur
· Matching CV/Offre : Correspondance entre le profil du candidat et les offres disponibles
· Chatbot assistant : Aide aux utilisateurs pour la recherche d'emploi

---

DESIGN SYSTEM - PALETTE DE COULEURS (PALETTE 1)

Voici la palette de couleurs officielle de KENZYA :

Couleurs principales :

· Primaire (Bleu profond) : #1A2C4E
· Secondaire (Bleu électrique) : #2563EB
· Accent (Or) : #F59E0B
· Fond principal : #F8FAFC
· Fond cartes : #FFFFFF
· Texte principal : #1E293B
· Texte secondaire : #64748B
· Succès (Vert) : #10B981
· Erreur (Rouge) : #EF4444
· Bordures : #E2E8F0

Typographies :

· Titres : Poppins (poids 400, 600, 700)
· Corps de texte : Open Sans (poids 300, 400, 600)

Ombres et effets :

· Ombre légère : 0 4px 6px -1px rgba(0,0,0,0.1)
· Ombre moyenne : 0 10px 15px -3px rgba(0,0,0,0.1)
· Transition : all 0.2s ease-in-out
· Coins arrondis : rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)

FONCTIONNALITÉS DU MVP

1. BACKEND (FastAPI)

1.1. Base de données (PostgreSQL)
Crée les modèles SQLAlchemy suivants : (tous les modèles listés ci-dessus)

1.2. Endpoints API
Crée les routes suivantes avec validation Pydantic :

Authentification :

· POST /api/v1/auth/register - Inscription (candidat)
· POST /api/v1/auth/login - Connexion (retourne JWT)
· POST /api/v1/auth/logout - Déconnexion
· GET /api/v1/auth/me - Profil utilisateur
· PUT /api/v1/auth/me - Mise à jour du profil
· POST /api/v1/auth/change-password - Changer le mot de passe

Offres d'emploi (scrapées) :

· GET /api/v1/jobs - Liste paginée avec filtres
· GET /api/v1/jobs/{job_id} - Détail d'une offre
· GET /api/v1/jobs/stats - Statistiques
· GET /api/v1/jobs/sources - Liste des sources
· GET /api/v1/jobs/recommendations - Offres recommandées (IA)

Offres recruteurs :

· POST /api/v1/recruiter/jobs - Publier une offre
· GET /api/v1/recruiter/jobs - Liste des offres publiées
· PUT /api/v1/recruiter/jobs/{job_id} - Modifier une offre
· DELETE /api/v1/recruiter/jobs/{job_id} - Supprimer une offre
· GET /api/v1/recruiter/jobs/{job_id}/applications - Voir les candidatures
· PUT /api/v1/recruiter/applications/{app_id}/status - Mettre à jour statut

Candidatures :

· POST /api/v1/applications - Postuler à une offre
· GET /api/v1/applications - Liste des candidatures de l'utilisateur
· GET /api/v1/applications/{app_id} - Détail d'une candidature

Alertes :

· GET /api/v1/alerts - Liste des alertes
· POST /api/v1/alerts - Créer une alerte
· PUT /api/v1/alerts/{alert_id} - Modifier une alerte
· DELETE /api/v1/alerts/{alert_id} - Supprimer une alerte
· POST /api/v1/alerts/{alert_id}/toggle - Activer/Désactiver

Favoris :

· GET /api/v1/favorites - Liste des favoris
· POST /api/v1/favorites/{job_id} - Ajouter aux favoris
· DELETE /api/v1/favorites/{job_id} - Retirer des favoris

Orientation (IA) :

· GET /api/v1/orientation/quiz - Récupérer le questionnaire
· POST /api/v1/orientation/analyze - Analyser les réponses
· GET /api/v1/orientation/results - Résultats d'orientation
· GET /api/v1/orientation/sectors - Liste des secteurs
· GET /api/v1/orientation/sector/{sector_id} - Détail d'un secteur
· GET /api/v1/orientation/trending - Secteurs en vogue
· POST /api/v1/orientation/chatbot - Chatbot d'orientation

1.3. Système de scraping
Scraper les offres depuis les sites ivoiriens existants.

1.4. Scheduler

· Scraping toutes les 2 heures
· Nettoyage quotidien à 3h
· Envoi d'alertes daily à 8h
· Mise à jour des secteurs tendances (IA)

1.5. Système d'alertes Telegram
Bot Telegram avec les commandes /start, /filtres, /voir, /activer, /desactiver, /aide

1.6. Système d'IA

· Analyse des offres (catégorisation)
· Extraction automatique des compétences
· Matching CV/Offre
· Recommandation personnalisée
· Orientation des bacheliers

---

2. FRONTEND (Next.js)

2.1. Configuration du design system
Palette 1, typographies, classes Tailwind personnalisées.

2.2. Pages à créer

Pages publiques :

· Accueil (/) - Hero, recherche, statistiques, offres récentes
· Offres (/jobs) - Liste avec filtres
· Détail offre (/jobs/[id]) - Détails, compétences, postuler
· Orientation (/orientation) - Quiz, résultats, secteurs
· Tendances (/trends) - Secteurs en vogue, statistiques marché
· À propos (/about) - Présentation KENZYA
· Contact (/contact) - Formulaire de contact

Pages authentification :

· Connexion (/login)
· Inscription (/register)
· Mot de passe oublié (/forgot-password)

Pages utilisateur (candidat) :

· Dashboard (/dashboard) - Statistiques, alertes, favoris
· Mes alertes (/alerts) - Gestion des alertes
· Mes favoris (/favorites) - Offres sauvegardées
· Mes candidatures (/applications) - Suivi des candidatures
· Mon profil (/profile) - Informations personnelles
· Mon orientation (/orientation/results) - Résultats du quiz

Pages recruteur :

· Dashboard recruteur (/recruiter/dashboard) - Statistiques, offres
· Publier une offre (/recruiter/jobs/create) - Formulaire
· Mes offres (/recruiter/jobs) - Liste des offres publiées
· Candidatures reçues (/recruiter/applications) - Gestion
· Profil recruteur (/recruiter/profile) - Informations entreprise

2.3. Composants réutilisables
Header, Footer, JobCard, JobList, SearchBar, Filters, Pagination, AlertForm, LoadingSpinner, ToastNotifications, Modal, Badge, RecruiterJobCard, ApplicationCard, SectorCard, QuizQuestion, ChatbotWidget

2.4. Gestion d'état et API
TanStack Query, Zustand, React Hook Form, Zod

---

3. INFRASTRUCTURE & DÉPLOIEMENT

3.1. Docker
Dockerfile backend + frontend, docker-compose.yml complet

3.2. Variables d'environnement

```env
# Backend
DATABASE_URL=postgresql://kenzya_user:password@postgres:5432/kenzya
SECRET_KEY=votre_clé_secrète_ici
TELEGRAM_TOKEN=votre_token_telegram
OPENAI_API_KEY=sk-... (optionnel, pour IA avancée)
ENVIRONMENT=production
DEBUG=False

# Frontend
NEXT_PUBLIC_API_URL=https://api.kenzya.ci
NEXT_PUBLIC_GOOGLE_ANALYTICS=UA-XXXXX-X (optionnel)
```

3.3. Scripts de déploiement
GitHub Actions CI/CD, script shell

---

LIVRABLES ATTENDUS

1. Structure de projet complète avec le nom KENZYA
2. Backend fonctionnel (API + scrapers + scheduler + IA)
3. Frontend fonctionnel (toutes les pages)
4. Espace recruteur opérationnel
5. Système d'orientation IA fonctionnel
6. Docker Compose prêt pour le déploiement
7. Documentation d'installation et d'utilisation
8. README complet avec captures d'écran

Le MVP doit être prêt à être déployé en production avec docker-compose up -d.

Génère maintenant l'intégralité du code source pour ce MVP. Commence par la structure complète des dossiers, puis fournis chaque fichier avec son contenu. Assure-toi que tout est cohérent et fonctionnel.

```

---

## 🤖 IA RECOMMANDÉES POUR GÉNÉRER LE MVP

Voici les meilleures IA pour générer le code du MVP KENZYA :

---

### 1. **ChatGPT (OpenAI)** - Recommandé pour le backend

| Version | Pourquoi | Lien |
|---|---|---|
| **ChatGPT-4 (GPT-4 Turbo)** | Excellent pour générer du code Python/FastAPI structuré | [chat.openai.com](https://chat.openai.com) |
| **ChatGPT-4o** | Dernière version, meilleure compréhension du contexte | [chat.openai.com](https://chat.openai.com) |

**Utilisation :** Colle le prompt, demande à générer partie par partie (backend d'abord, puis frontend)

**Astuce :** Demande à ChatGPT de générer en plusieurs fois pour éviter la limite de tokens.

---

### 2. **Claude (Anthropic)** - Recommandé pour l'architecture

| Version | Pourquoi | Lien |
|---|---|---|
| **Claude 3.5 Sonnet** | Meilleure compréhension du contexte, gestion de longs prompts | [claude.ai](https://claude.ai) |
| **Claude 3 Opus** | Idéal pour l'architecture et la planification | [claude.ai](https://claude.ai) |

**Utilisation :** Colle le prompt complet, Claude gère bien les longs documents

**Astuce :** Claude est excellent pour structurer le projet avant de générer le code.

---

### 3. **GitHub Copilot** - Pour le code au quotidien

| Version | Pourquoi | Lien |
|---|---|---|
| **Copilot** | Intégré à VS Code, génère du code en temps réel | [github.com/features/copilot](https://github.com/features/copilot) |
| **Copilot Chat** | Peut comprendre le contexte du projet | [github.com/features/copilot](https://github.com/features/copilot) |

**Utilisation :** Utilise-le pendant que tu codes pour générer des fonctions, des tests, des composants

**Astuce :** Copilot est excellent pour les tâches répétitives (CRUD, modèles, composants UI).

---

### 4. **Cursor** - IDE IA intégré

| Version | Pourquoi | Lien |
|---|---|---|
| **Cursor** | IDE avec IA intégrée, peut générer tout le projet | [cursor.sh](https://cursor.sh) |

**Utilisation :** Utilise l'IDE lui-même pour générer le code depuis le prompt

**Astuce :** Cursor peut "voir" toute la structure de ton projet et générer du code cohérent.

---

### 5. **DeepSeek** - Alternative économique

| Version | Pourquoi | Lien |
|---|---|---|
| **DeepSeek-V3** | Gratuit, excellent pour le code, contexte long | [deepseek.com](https://deepseek.com) |

**Utilisation :** Alternative gratuite à ChatGPT/Claude, très compétente

**Astuce :** Parfait si tu n'as pas d'abonnement payant.

---

### 6. **Codeium** - Alternative à Copilot

| Version | Pourquoi | Lien |
|---|---|---|
| **Codeium** | Gratuit, intégré VS Code, bon pour le code | [codeium.com](https://codeium.com) |

**Utilisation :** Similaire à Copilot, mais gratuit

---

## 🎯 STRATÉGIE DE GÉNÉRATION DU MVP

### Phase 1 : Architecture (Utiliser Claude)
```

Prompt : "Génère la structure complète du projet KENZYA avec tous les dossiers et fichiers vides."

```

### Phase 2 : Backend (Utiliser ChatGPT-4)
```

Prompt : "Génère le code complet du backend pour KENZYA :

· Modèles SQLAlchemy
· API routes
· Système d'authentification
· Scrapers
· Scheduler"

```

### Phase 3 : Frontend (Utiliser ChatGPT-4 ou Cursor)
```

Prompt : "Génère le code complet du frontend Next.js pour KENZYA :

· Pages (accueil, offres, dashboard, orientation, recruteur)
· Composants UI
· Gestion d'état
· Appels API"

```

### Phase 4 : IA (Utiliser Claude ou ChatGPT)
```

Prompt : "Génère le système d'IA pour l'orientation des bacheliers :

· Questionnaire
· Logique d'analyse
· Recommandations
· Intégration API"

```

### Phase 5 : Infrastructure (Utiliser ChatGPT)
```

Prompt : "Génère les fichiers Docker, docker-compose, CI/CD pour KENZYA"

```

---

## 💡 CONSEILS D'UTILISATION

1. **Découpe le prompt** : Génère par parties plutôt que tout d'un coup
2. **Itère** : Si un résultat n'est pas parfait, demande des ajustements
3. **Teste** : Une fois le code généré, teste-le en local
4. **Corrige** : Utilise l'IA pour corriger les bugs (coller l'erreur)
5. **Documente** : Demande à l'IA de commenter le code généré

---


---

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kenzya.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bf4329bc-ccc5-40ea-9cd1-3eacee91b492).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
