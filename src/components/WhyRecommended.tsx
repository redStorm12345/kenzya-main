import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function WhyRecommended({
  reasons,
  sources,
  defaultOpen = false,
}: {
  reasons: string[];
  sources?: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-muted/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-primary"
      >
        <span className="inline-flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-secondary" />
          Pourquoi cette recommandation ?
        </span>
        <ChevronDown className={`h-4 w-4 transition-smooth ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <ul className="list-disc space-y-1.5 pl-4">
            {reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs">
            <span className="font-semibold text-primary">Sur quoi KENZYA se base :</span>{" "}
            {(sources ?? ["offres collectées dans le jeu de données KENZYA", "éléments renseignés dans le profil"]).join(" · ")}.
            Une recommandation est une piste, pas une certitude.
          </p>
        </div>
      )}
    </div>
  );
}
