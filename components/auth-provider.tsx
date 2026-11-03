"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "@/lib/api/types";
import {
  fetchCurrentUser,
  loginWithGoogleIdToken,
  logoutSession,
} from "@/lib/auth/auth-api";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "@/lib/auth/storage";
import type { AuthenticatedUser } from "@/lib/auth/types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  error: string | null;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithAccessToken: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    const stored = readStoredSession();
    if (!stored?.accessToken) {
      setUser(null);
      setStatus("anonymous");
      return;
    }

    try {
      // Do not pass accessToken explicitly — apiRequest can refresh on 401
      // using the stored refresh token when the access JWT has expired (15m).
      const me = await fetchCurrentUser();
      const latest = readStoredSession();
      writeStoredSession({
        accessToken: latest?.accessToken ?? stored.accessToken,
        refreshToken: latest?.refreshToken ?? stored.refreshToken,
        user: me,
      });
      setUser(me);
      setStatus("authenticated");
    } catch {
      clearStoredSession();
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setError(null);
    try {
      const session = await loginWithGoogleIdToken(idToken);
      writeStoredSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
      });
      setUser(session.user);
      setStatus("authenticated");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Google sign-in failed. Check that your account is provisioned.";
      setError(message);
      setStatus("anonymous");
      setUser(null);
      throw err;
    }
  }, []);

  const loginWithAccessToken = useCallback(async (accessToken: string) => {
    setError(null);
    const trimmed = accessToken.trim();
    if (!trimmed) {
      setError("Access token is required");
      throw new Error("Access token is required");
    }

    try {
      const me = await fetchCurrentUser(trimmed);
      writeStoredSession({
        accessToken: trimmed,
        refreshToken: null,
        user: me,
      });
      setUser(me);
      setStatus("authenticated");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not validate the access token against the API.";
      setError(message);
      setStatus("anonymous");
      setUser(null);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    const stored = readStoredSession();
    if (stored?.refreshToken) {
      try {
        await logoutSession(stored.refreshToken);
      } catch {
        // Always clear local session even if revoke fails.
      }
    }
    clearStoredSession();
    setUser(null);
    setStatus("anonymous");
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      error,
      loginWithGoogle,
      loginWithAccessToken,
      logout,
      clearError: () => setError(null),
      hasPermission: (permission: string) =>
        Boolean(user?.permissions.includes(permission)),
    }),
    [
      status,
      user,
      error,
      loginWithGoogle,
      loginWithAccessToken,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
