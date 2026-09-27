import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, User, X, Sparkles, Search, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/offres", label: "Offres & Matching IA" },
  { to: "/profil", label: "Mon CV & Profil" },
  { to: "/marche", label: "Marché & Tendances" },
  { to: "/recruteurs", label: "Espace Recruteurs" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero-gradient font-display text-lg font-extrabold text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
            K
          </span>
          <div className="flex flex-col">
            <span className="font-display text-xl font-extrabold tracking-tight text-primary leading-none">
              KENZYA
            </span>
            <span className="text-[10px] font-semibold text-secondary tracking-wider uppercase">
              Emploi & AI Matching
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-primary [&.active]:bg-secondary/10 [&.active]:text-secondary [&.active]:font-bold"
            >
              {l.label}
            </Link>
          ))}

          {session ? (
            <Link
              to="/espace"
              className="ml-3 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground shadow-soft transition-all hover:opacity-90"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              to="/auth"
              className="ml-3 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground shadow-soft transition-all hover:opacity-90"
            >
              Connexion
            </Link>
          )}
        </nav>

        {/* Mobile Navigation Header Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/offres"
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary"
          >
            <Search className="h-3.5 w-3.5" /> Offres
          </Link>

          <button
            className="rounded-xl p-2 text-primary hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <nav className="border-t border-border bg-card px-4 py-4 space-y-1 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-primary [&.active]:bg-secondary/10 [&.active]:text-secondary"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border">
            <Link
              to={session ? "/espace" : "/auth"}
              onClick={() => setOpen(false)}
              className="block w-full text-center rounded-xl bg-secondary py-2.5 text-sm font-bold text-secondary-foreground"
            >
              {session ? "Mon espace candidat/recruteur" : "Se connecter"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
