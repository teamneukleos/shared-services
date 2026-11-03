"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout, AuthMessage } from "@/components/auth-layout";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout
          eyebrow="Welcome back"
          heading="Sign in to your account"
          description="Loading sign-in…"
        >
          <p className="text-sm text-[#777777]">Preparing sign-in…</p>
        </AuthLayout>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error, loginWithGoogle, loginWithAccessToken, clearError } =
    useAuth();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState("");
  const [showDev, setShowDev] = useState(false);

  const nextPath = useMemo(() => {
    const raw = searchParams.get("next");
    if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
      return "/";
    }
    return raw;
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(nextPath);
    }
  }, [status, router, nextPath]);

  async function handleGoogleCredential(idToken: string) {
    clearError();
    setLocalError(null);
    setBusy(true);
    try {
      await loginWithGoogle(idToken);
      router.replace(nextPath);
    } catch (err) {
      setLocalError(
        err instanceof ApiError
          ? err.message
          : "Google sign-in failed. Your Workspace account must already be provisioned.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDevToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setLocalError(null);
    setBusy(true);
    try {
      await loginWithAccessToken(devToken);
      router.replace(nextPath);
    } catch (err) {
      setLocalError(
        err instanceof ApiError
          ? err.message
          : "Could not sign in with that access token.",
      );
    } finally {
      setBusy(false);
    }
  }

  const displayError = localError ?? error;

  return (
    <AuthLayout
      eyebrow="Welcome back"
      heading="Sign in to your account"
      description="Use your Google Workspace account. Accounts are provisioned by an admin — there is no public signup."
    >
      <div className="space-y-5">
        <GoogleSignInButton
          onCredential={handleGoogleCredential}
          disabled={busy}
        />

        <div className="rounded-xl border border-[#EFEFEF] bg-[#FAFAFA] px-4 py-3 text-xs leading-5 text-[#6B6B6B]">
          After Google verifies you, Neukleos checks for an existing linked user
          in your organisation. Unlinked accounts cannot sign in.
        </div>

        {displayError && <AuthMessage>{displayError}</AuthMessage>}

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDev((value) => !value)}
            className="text-xs font-medium text-[#8A6C00] hover:text-[#5E4900]"
          >
            {showDev ? "Hide local developer sign-in" : "Local developer sign-in"}
          </button>

          {showDev && (
            <form onSubmit={handleDevToken} className="mt-3 space-y-3">
              <p className="text-xs leading-5 text-[#777777]">
                Paste an access token from{" "}
                <code className="rounded bg-[#F3F3F3] px-1">
                  npm run auth:sign-access-token
                </code>{" "}
                in the API repo. Refresh is not included, so the session lasts
                only as long as the access token.
              </p>
              <textarea
                value={devToken}
                onChange={(event) => setDevToken(event.target.value)}
                rows={4}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full rounded-xl border border-[#E4E4E4] bg-white px-3 py-3 font-mono text-xs text-[#202024] outline-none focus:border-[#D5AD13] focus:ring-4 focus:ring-[#FDC517]/15"
              />
              <button
                type="submit"
                disabled={busy || !devToken.trim()}
                className="flex w-full items-center justify-center rounded-xl bg-[#19191e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#33333a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Signing in…" : "Continue with access token"}
              </button>
            </form>
          )}
        </div>

        <p className="pt-1 text-center text-sm text-[#777777]">
          Need access?{" "}
          <span className="font-medium text-[#555555]">
            Ask your organisation admin to invite your Workspace account.
          </span>
        </p>

        <p className="text-center text-xs text-[#999999]">
          <Link href="/sign-up" className="underline-offset-2 hover:underline">
            Legacy create-account page
          </Link>{" "}
          is not supported by the API.
        </p>
      </div>
    </AuthLayout>
  );
}
