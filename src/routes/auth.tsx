import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, Loader2, UserRound } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Créer un compte ou se connecter | KENZYA" },
      {
        name: "description",
        content:
          "Créez votre compte KENZYA en tant que candidat ou recruteur, ou connectez-vous pour retrouver votre espace.",
      },
      { property: "og:title", content: "Créer un compte ou se connecter | KENZYA" },
      {
        property: "og:description",
        content: "Un compte candidat pour être trouvé, un compte recruteur pour chercher des talents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type AccountType = "candidat" | "recruteur";

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [accountType, setAccountType] = useState<AccountType>("candidat");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && session) void navigate({ to: "/espace", replace: true });
  }, [session, sessionLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            company: accountType === "recruteur" ? company : "",
            account_type: accountType,
          },
        },
      });
      setBusy(false);
      if (error) return setError(traduire(error.message));
      if (!data.session) {
        return setMessage(
          "Compte créé. Ouvrez l'e-mail de confirmation que nous venons de vous envoyer pour activer votre accès.",
        );
      }
      void navigate({ to: "/espace", replace: true });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(traduire(error.message));
    void navigate({ to: "/espace", replace: true });
  }

  async function handleGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return setError("La connexion avec Google n'a pas abouti. Réessayez.");
    if (result.redirected) return;
    void navigate({ to: "/espace", replace: true });
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            {mode === "signup" ? "Créer votre compte KENZYA" : "Se connecter"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            Un compte candidat pour construire un profil appuyé sur des preuves et être trouvé. Un
            compte recruteur pour publier des offres et rechercher des talents par compétence.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li>Vos données ne sont utilisées que pour vous mettre en relation.</li>
            <li>Aucune décision de recrutement n'est prise automatiquement par KENZYA.</li>
            <li>
              Vous pouvez consulter à tout moment{" "}
              <Link to="/methode" className="font-semibold text-secondary hover:underline">
                notre méthode et nos sources
              </Link>
              .
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              onClick={() => setMode("signup")}
              className={`rounded-lg py-2 text-sm font-semibold transition-smooth ${
                mode === "signup" ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              Créer un compte
            </button>
            <button
              onClick={() => setMode("signin")}
              className={`rounded-lg py-2 text-sm font-semibold transition-smooth ${
                mode === "signin" ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              Connexion
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <TypeCard
                    active={accountType === "candidat"}
                    onClick={() => setAccountType("candidat")}
                    icon={<UserRound className="h-4 w-4" />}
                    title="Candidat"
                    subtitle="Je cherche un emploi ou une orientation"
                  />
                  <TypeCard
                    active={accountType === "recruteur"}
                    onClick={() => setAccountType("recruteur")}
                    icon={<Briefcase className="h-4 w-4" />}
                    title="Recruteur"
                    subtitle="Je recrute pour une entreprise"
                  />
                </div>

                <Field
                  label="Nom complet"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Aya Koffi"
                  required
                />
                {accountType === "recruteur" && (
                  <Field
                    label="Entreprise"
                    value={company}
                    onChange={setCompany}
                    placeholder="Nom de votre entreprise"
                    required
                  />
                )}
              </>
            )}

            <Field
              label="Adresse e-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="vous@exemple.ci"
              required
            />
            <Field
              label="Mot de passe"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Au moins 6 caractères"
              required
            />

            {error && (
              <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
            )}
            {message && (
              <p className="rounded-xl bg-success/10 p-3 text-sm text-success">{message}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground transition-smooth hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Créer mon compte" : "Me connecter"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary transition-smooth hover:bg-muted"
          >
            Continuer avec Google
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Avec Google, le compte est créé en tant que candidat ; vous pourrez basculer en compte
            recruteur depuis votre espace.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function TypeCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-smooth ${
        active ? "border-secondary bg-secondary/5" : "border-border hover:bg-muted"
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-primary">
        {icon} {title}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{subtitle}</span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
      />
    </label>
  );
}

function traduire(message: string) {
  if (message.includes("Invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (message.includes("User already registered"))
    return "Un compte existe déjà avec cette adresse. Utilisez l'onglet Connexion.";
  if (message.includes("Password should be"))
    return "Le mot de passe doit contenir au moins 6 caractères.";
  if (message.includes("Email not confirmed"))
    return "Votre adresse n'est pas encore confirmée : ouvrez l'e-mail que nous vous avons envoyé.";
  return message;
}
