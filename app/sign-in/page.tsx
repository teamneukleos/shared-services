
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import {
  AuthLayout,
  AuthMessage,
  GoogleButton,
} from "@/components/auth-layout";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "The sign-in interface is ready, but authentication has not been connected yet."
    );
  }

  function handleGoogleSignIn() {
    setMessage(
      "Google sign-in will be available once Google authentication is connected."
    );
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      heading="Sign in to your account"
      description="Enter your work account details to access your workspace."
    >
      <div className="space-y-5">
        <GoogleButton
          label="Continue with Google"
          onClick={handleGoogleSignIn}
        />

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#EAEAEA]" />
          <span className="text-xs text-[#929292]">OR CONTINUE WITH EMAIL</span>
          <div className="h-px flex-1 bg-[#EAEAEA]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#303030]"
            >
              Work email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                className="w-full rounded-xl border border-[#E4E4E4] bg-white py-3.5 pl-11 pr-4 text-sm text-[#202024] outline-none transition placeholder:text-[#A5A5A5] focus:border-[#D5AD13] focus:ring-4 focus:ring-[#FDC517]/15"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#303030]"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#8A6C00] hover:text-[#5E4900]"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-[#E4E4E4] bg-white py-3.5 pl-11 pr-12 text-sm text-[#202024] outline-none transition placeholder:text-[#A5A5A5] focus:border-[#D5AD13] focus:ring-4 focus:ring-[#FDC517]/15"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#888888] hover:bg-[#F5F5F4] hover:text-[#202024]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#656565]">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-[#D0D0D0] accent-[#D5AD13]"
            />
            Remember me
          </label>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-xl bg-[#FDC517] px-4 py-3.5 text-sm font-semibold text-[#171717] transition hover:bg-[#EAB70D] focus:outline-none focus:ring-4 focus:ring-[#FDC517]/25"
          >
            Sign in
          </button>
        </form>

        {message && <AuthMessage>{message}</AuthMessage>}

        <p className="pt-1 text-center text-sm text-[#777777]">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#806400] hover:text-[#5E4900]"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
