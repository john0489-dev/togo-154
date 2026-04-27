import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { SplashScreen } from "@/components/SplashScreen";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  user: null,
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    session: null,
    loading: true,
  });

  // Splash visibility — kept mounted briefly after `loading` flips to false
  // so we can play a fade-out animation before unmounting.
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        isAuthenticated: !!session?.user,
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        isAuthenticated: !!session?.user,
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // When auth resolves, trigger the fade-out then unmount the splash.
  useEffect(() => {
    if (state.loading || !showSplash) return;
    setSplashFading(true);
    const timer = setTimeout(() => setShowSplash(false), 320);
    return () => clearTimeout(timer);
  }, [state.loading, showSplash]);

  return (
    <AuthContext.Provider value={state}>
      {children}
      {showSplash && <SplashScreen fadingOut={splashFading} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
