"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function setAuthCookie(authenticated: boolean) {
  if (typeof document === "undefined") return;
  if (authenticated) {
    document.cookie = "debateai-auth=1; Path=/; Max-Age=2592000; SameSite=Lax";
    return;
  }
  document.cookie = "debateai-auth=; Path=/; Max-Age=0; SameSite=Lax";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // #region agent log
    const _dbgLog = (msg: string, data: Record<string, unknown>, hyp: string) => {
      fetch('http://127.0.0.1:7865/ingest/4dca6392-8500-4895-a165-38aa24b3ec02',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'228a68'},body:JSON.stringify({sessionId:'228a68',location:'AuthContext.tsx',message:msg,data,hypothesisId:hyp,timestamp:Date.now()})}).catch(()=>{});
    };
    const _dbgUrl = typeof window !== 'undefined' ? { href: window.location.href, hash: window.location.hash, search: window.location.search } : {};
    _dbgLog('AuthContext mount - URL state', _dbgUrl, 'A,B,C,D');
    // #endregion

    const loadSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // #region agent log
        _dbgLog('loadSession result', { hasSession: Boolean(session), userId: session?.user?.id ?? null, userEmail: session?.user?.email ?? null, confirmed: session?.user?.email_confirmed_at ?? null }, 'A,B');
        // #endregion

        if (isMounted) {
          const nextUser = session?.user ?? null;
          setUser(nextUser);
          setAuthCookie(Boolean(nextUser));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // #region agent log
      _dbgLog('onAuthStateChange fired', { event: _event, hasSession: Boolean(session), userId: session?.user?.id ?? null, userEmail: session?.user?.email ?? null, confirmed: session?.user?.email_confirmed_at ?? null }, 'A,B,C,D');
      // #endregion
      if (!isMounted) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setAuthCookie(Boolean(nextUser));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signOut,
    }),
    [loading, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
