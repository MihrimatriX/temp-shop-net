"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, unwrap } from "@/lib/api";
import { TOKEN_KEY } from "@/lib/config";
import { parseSessionFromToken, type SessionUser } from "@/lib/jwt";
import type { AuthPayload } from "@/lib/types";

type AuthContextValue = {
  token: string | null;
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    setToken(t);
    setLoading(false);
  }, []);

  const user = useMemo(
    () => (token ? parseSessionFromToken(token) : null),
    [token],
  );

  const persist = useCallback((t: string | null) => {
    setToken(t);
    if (typeof window === "undefined") return;
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const r = await apiFetch<AuthPayload>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = unwrap<AuthPayload>(r);
      persist(data.token);
    },
    [persist],
  );

  const register = useCallback(
    async (body: Parameters<AuthContextValue["register"]>[0]) => {
      const r = await apiFetch<AuthPayload>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = unwrap<AuthPayload>(r);
      persist(data.token);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    const t = token;
    if (t) {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        token: t,
      }).catch(() => {});
    }
    persist(null);
  }, [token, persist]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
    }),
    [token, user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
