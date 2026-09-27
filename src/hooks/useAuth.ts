import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AccountType = "candidat" | "recruteur" | "admin";

export type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: AccountType | null;
  fullName: string | null;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    session: null,
    user: null,
    role: null,
    fullName: null,
  });

  useEffect(() => {
    let active = true;

    async function loadDetails(session: Session | null) {
      if (!session) {
        if (active) setState({ loading: false, session: null, user: null, role: null, fullName: null });
        return;
      }
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", session.user.id).limit(1),
        supabase.from("profiles").select("full_name").eq("id", session.user.id).maybeSingle(),
      ]);
      if (!active) return;
      setState({
        loading: false,
        session,
        user: session.user,
        role: (roles?.[0]?.role as AccountType | undefined) ?? null,
        fullName: profile?.full_name ?? null,
      });
    }

    supabase.auth.getSession().then(({ data }) => void loadDetails(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadDetails(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
