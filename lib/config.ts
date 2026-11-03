function readPublicEnv(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const appConfig = {
  // NEXT_PUBLIC_* must be referenced as static property access so Next can
  // inline them into the client bundle. Dynamic process.env[name] stays empty
  // in the browser.
  apiBaseUrl:
    readPublicEnv(process.env.NEXT_PUBLIC_API_BASE_URL) ??
    "http://localhost:3000/api/v1",
  googleClientId:
    readPublicEnv(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) ?? "",
};

export function assertGoogleClientId(): string {
  if (!appConfig.googleClientId) {
    throw new Error(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. Add it to .env.local.",
    );
  }
  return appConfig.googleClientId;
}
