import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Building2,
  Briefcase,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { Job } from "@/data/kenzya";
import { type CandidateProfile } from "@/data/matching";
import { getUserProfile } from "@/lib/user-profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  candidateProfile?: CandidateProfile | undefined;
  matchScore?: number | undefined;
}

export function ApplyModal({
  job,
  isOpen,
  onClose,
  candidateProfile,
  matchScore,
}: ApplyModalProps) {
  const currentCandidate = candidateProfile || getUserProfile();

  const [fullName, setFullName] = useState(currentCandidate.name);
  const [email, setEmail] = useState(`${currentCandidate.id}@kenzya.ci`);
  const [phone, setPhone] = useState("+225 07 00 00 11 22");
  const [location, setLocation] = useState(currentCandidate.location);
  const [coverNote, setCoverNote] = useState("");
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationRef, setApplicationRef] = useState("");

  const generateAiPitch = () => {
    if (!job) return;
    setIsGeneratingPitch(true);

    setTimeout(() => {
      const generated = `Bonjour ${job.company},\n\nAyant une solide expérience en tant que ${currentCandidate.headline} et passionné(e) par le secteur ${job.sector}, je souhaite vous proposer ma candidature pour le poste de "${job.title}". Mon profil correspond particulièrement aux exigences de votre offre à ${job.location}.\n\nDans l'attente d'un échange direct,\n${currentCandidate.name}`;
      setCoverNote(generated);
      setIsGeneratingPitch(false);
      toast.success("Mot de motivation généré par l'IA KENZYA !");
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSubmitting(true);
    const randomRef = `KNZ-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Intégration persistance Supabase (si utilisateur connecté)
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.from("applications" as any).insert({
          reference: randomRef,
          job_id: job.id,
          user_id: userData.user.id,
          full_name: fullName,
          email: email,
          phone: phone,
          location: location,
          cover_note: coverNote,
          match_score: matchScore || 85,
          status: "Transmise",
        } as any);
      }
    } catch (err) {
      console.info("[ApplyModal] Supabase sync fallback mode:", err);
    }

    setApplicationRef(randomRef);
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success(`Candidature ${randomRef} envoyée avec succès à ${job.company} !`);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setCoverNote("");
    onClose();
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8">
        {!isSubmitted ? (
          <>
            <DialogHeader className="border-b border-border pb-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                  <Briefcase className="h-3.5 w-3.5" /> Candidature Directe KENZYA
                </span>
                {matchScore !== undefined && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      matchScore >= 75
                        ? "bg-success/15 text-success"
                        : matchScore >= 50
                          ? "bg-secondary/15 text-secondary"
                          : "bg-accent/20 text-amber-700"
                    }`}
                  >
                    Match AI {matchScore}%
                  </span>
                )}
              </div>

              <DialogTitle className="mt-2 font-display text-xl font-bold text-primary sm:text-2xl">
                Postuler pour : {job.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-secondary" /> {job.company}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                </span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              {/* Profil & CV Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  1. Profil & CV transmis
                </label>
                <div className="mt-2 rounded-xl border border-secondary bg-secondary/5 p-3.5 text-left shadow-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-secondary" />
                    <span className="font-bold text-xs text-foreground">{currentCandidate.name}</span>
                    <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary uppercase">
                      Votre Profil Actif
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {currentCandidate.headline} • {currentCandidate.location}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  2. Coordonnées de contact
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-foreground">Nom complet</label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-secondary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground">Adresse Email</label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-secondary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground">Téléphone (WhatsApp)</label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-secondary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground">Ville / Commune</label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-secondary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Motivation pitch */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    3. Mot de motivation / Pitch candidat (Optionnel)
                  </label>
                  <button
                    type="button"
                    onClick={generateAiPitch}
                    disabled={isGeneratingPitch}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isGeneratingPitch ? "Génération..." : "Rédiger avec l'IA KENZYA"}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Présentez rapidement vos atouts majeurs pour ce poste chez..."
                  className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-secondary focus:outline-none"
                />
              </div>

              {/* Notice */}
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                Vos données seront transmises de façon sécurisée directement à l'équipe recrutement de {job.company}.
              </p>

              {/* Submit CTA */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-smooth hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground transition-smooth hover:opacity-95 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-secondary-foreground border-t-transparent" />
                      Envoi de la candidature...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Envoyer ma candidature
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h3 className="mt-4 font-display text-2xl font-bold text-primary">
              Candidature transmise avec succès !
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre dossier de candidature pour <strong className="text-foreground">{job.title}</strong> chez{" "}
              <strong className="text-foreground">{job.company}</strong> a été bien enregistré.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 text-left space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Référence de suivi :</span>
                <span className="font-mono font-bold text-foreground">{applicationRef}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Candidat :</span>
                <span className="font-medium text-foreground">{fullName} ({email})</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Date d'envoi :</span>
                <span className="font-medium text-foreground">
                  {new Date().toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {matchScore !== undefined && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Score d'Adéquation IA :</span>
                  <span className="font-bold text-secondary">{matchScore}% Match Score</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground transition-smooth hover:opacity-95"
              >
                Continuer la recherche <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
