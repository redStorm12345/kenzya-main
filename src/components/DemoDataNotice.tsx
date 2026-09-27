import { FlaskConical } from "lucide-react";

export function DemoDataNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4 text-sm text-muted-foreground">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
      <p>
        <span className="font-semibold text-primary">Données de démonstration.</span>{" "}
        {children ??
          "Les chiffres affichés sont calculés uniquement sur le jeu d'offres de test de KENZYA. Ils ne représentent pas encore le marché ivoirien réel."}
      </p>
    </div>
  );
}
