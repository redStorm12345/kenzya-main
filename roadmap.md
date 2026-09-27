# KENZYA — feuille de route MVP (confiance & preuve)

## En cours
- [x] Moteur KENZYA Match explicable (`src/data/matching.ts`)
- [x] Composants « Pourquoi cette recommandation ? » et « Données de démonstration »
- [ ] Composant MatchScore (score + détail par critère + écarts de compétences)
- [ ] Page profil basé sur des preuves (`/profil`) : déclarée vs démontrée, projets, certifications, recommandations réseau
- [ ] Match affiché sur la fiche offre et dans la liste d'offres
- [ ] Page sourcing recruteur par compétences + comparaison de profils (`/talents`)
- [ ] Page données du marché (`/marche`), clairement étiquetée démonstration
- [ ] Page méthode & crédibilité (`/methode`) : pondérations configurables, sources, H1/H2/H3, priorisation MVP
- [ ] Liens de navigation (Header/Footer) et métadonnées de chaque page

## Plus tard (hors MVP)
- Backend réel, comptes utilisateurs, collecte d'offres automatisée
- Tests de compétences réels et vérification des certifications
- Assistant IA (analyse de profil, écarts, amélioration de CV) via passerelle serveur
- Suivi des retours utilisateurs et statistiques réelles

## Comptes utilisateurs (demandé le 11/09)
- [x] Activer le backend Lovable Cloud
- [x] Création de compte + connexion (email/mot de passe et Google)
- [x] Choix du type de compte : candidat ou recruteur, stocké à l'inscription
- [x] Espace connecté `/espace` : raccourcis candidat ou recruteur selon le type de compte
- [ ] Enregistrer le vrai profil candidat (compétences, preuves) en base au lieu des profils de démonstration
- [ ] Permettre à un compte Google de basculer en compte recruteur
