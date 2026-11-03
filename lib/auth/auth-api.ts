import { apiRequest } from "@/lib/api/client";
import type { AuthSession, AuthenticatedUser } from "./types";

export function loginWithGoogleIdToken(idToken: string): Promise<AuthSession> {
  return apiRequest<AuthSession>("/authentication/google", {
    method: "POST",
    body: { idToken },
    auth: false,
  });
}

export function refreshSession(refreshToken: string): Promise<AuthSession> {
  return apiRequest<AuthSession>("/authentication/refresh", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}

export function logoutSession(refreshToken: string): Promise<{ success: true }> {
  return apiRequest<{ success: true }>("/authentication/logout", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}

export function fetchCurrentUser(accessToken?: string): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>("/authentication/me", {
    method: "GET",
    accessToken,
  });
}
