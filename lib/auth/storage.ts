import type { AuthenticatedUser, StoredSession } from "./types";

const ACCESS_KEY = "neukleos.accessToken";
const REFRESH_KEY = "neukleos.refreshToken";
const USER_KEY = "neukleos.user";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readStoredSession(): StoredSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const accessToken = window.localStorage.getItem(ACCESS_KEY);
  if (!accessToken) {
    return null;
  }

  const refreshToken = window.localStorage.getItem(REFRESH_KEY);
  const rawUser = window.localStorage.getItem(USER_KEY);
  let user: AuthenticatedUser | null = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as AuthenticatedUser;
    } catch {
      user = null;
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
  };
}

export function writeStoredSession(session: {
  accessToken: string;
  refreshToken?: string | null;
  user?: AuthenticatedUser | null;
}): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_KEY, session.accessToken);

  if (session.refreshToken === null) {
    window.localStorage.removeItem(REFRESH_KEY);
  } else if (typeof session.refreshToken === "string") {
    window.localStorage.setItem(REFRESH_KEY, session.refreshToken);
  }

  if (session.user === null) {
    window.localStorage.removeItem(USER_KEY);
  } else if (session.user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }
}

export function clearStoredSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
}
