import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 bg-hero-gradient text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-bold">KENZYA</p>
          <p className="mt-3 max-w-sm text-sm opacity-80">
            Connecter les talents ivoiriens aux opportunités, avec des preuves plutôt que des
            promesses : compétences démontrées, correspondances expliquées, sources affichées.
          </p>
          <p className="mt-3 max-w-sm text-xs opacity-70">
            Chaque recommandation de KENZYA peut répondre à la question « sur quoi vous
            basez-vous ? ».
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide opacity-70">
            Candidats
          </p>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            <li>
              <Link to="/offres">Chercher une offre</Link>
            </li>
            <li>
              <Link to="/profil">Mon profil et mes preuves</Link>
            </li>
            <li>
              <Link to="/orientation">Test d'orientation</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide opacity-70">
            Recruteurs & transparence
          </p>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            <li>
              <Link to="/talents">Rechercher des talents</Link>
            </li>
            <li>
              <Link to="/recruteurs">Publier une offre</Link>
            </li>
            <li>
              <Link to="/marche">Données du marché</Link>
            </li>
            <li>
              <Link to="/methode">Méthode et sources</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} KENZYA — Abidjan, Côte d'Ivoire
      </div>
    </footer>
  );
}
