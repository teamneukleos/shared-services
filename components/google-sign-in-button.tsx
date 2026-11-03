"use client";

import { useEffect, useRef, useState } from "react";
import { appConfig } from "@/lib/config";
import { initializeGoogleId } from "@/lib/auth/google";
import { GoogleButton } from "@/components/auth-layout";

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
};

export function GoogleSignInButton({
  onCredential,
  disabled,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef(onCredential);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!appConfig.googleClientId) {
      setFallback(true);
      setError(
        "Google Client ID is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local.",
      );
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const googleId = await initializeGoogleId((idToken) => {
          void callbackRef.current(idToken);
        });

        if (cancelled || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = "";
        googleId.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: containerRef.current.offsetWidth || 384,
        });
      } catch (err) {
        if (!cancelled) {
          setFallback(true);
          setError(
            err instanceof Error
              ? err.message
              : "Could not initialise Google sign-in",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (fallback) {
    return (
      <div className="space-y-2">
        <GoogleButton
          label="Continue with Google"
          onClick={() =>
            setError(
              error ??
                "Google sign-in is unavailable. Check NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
            )
          }
        />
        {error && (
          <p className="text-xs leading-5 text-[#9A4B00]">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className={`flex min-h-[44px] w-full justify-center ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
      />
      {error && <p className="text-xs leading-5 text-[#9A4B00]">{error}</p>}
    </div>
  );
}
