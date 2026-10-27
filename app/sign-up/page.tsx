
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import {
  AuthLayout,
  AuthMessage,
  GoogleButton,
} from "@/components/auth-layout";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const acceptedTerms = data.get("terms") === "on";

    if (password.length < 8) {
      setMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords do not match. Please check them and try again.");
      return;
    }

    if (!acceptedTerms) {
      setMessage("Please agree to the terms before continuing.");
      return;
    }

    setMessage(
      "The sign-up interface is ready, but account creation has not been connected yet."
    );
  }

  function handleGoogleSignUp() {
    setMessage(
      "Google sign-up will be available once Google authentication is connected."
    );
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      heading="Create your account"
      description="Set up your account to access the Neukleos People workspace."
    >
      <div className="space-y-5">
        <GoogleButton
          label="Sign up with Google"
          onClick={handleGoogleSignUp}
        />

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#EAEAEA]" />
          <span className="text-xs text-[#929292]">OR SIGN UP WITH EMAIL</span>
          <div className="h-px flex-1 bg-[#EAEAEA]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-[#303030]"
              >
                First name
              </label>
              <div className="relative">
                <UserRound
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]"
                />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="First name"
                  required
                  className="w-full rounded-xl border border-[#E4E4E4] py-3.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-[#A5A5A5] focus:border-[#D5AD13] focus:ring-4 focus:ring-[#FDC517]/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-[#303030]"
              >
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                required
                className="w-full rounded-xl border border-[#E4E4E4] px-3.5 py-3.5 text-sm outline-none transition placeholder:text-[#A5A5A5] focus:border-[#D5AD13] focus:ring-4 focus:ring-[#FDC517]/15"
              />
            </div>
          </div>

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
                className="w-full rounded-xl border border-[#E4E4E4] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#A5A5A5] focus:border-[#D5AD13] focus:ring-4 focus:ring-[#FDC517]/15"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#303030]"
            >
              Password
            </label>
            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                required
                className="w-full rounded-xl border border-[#E4E4E4] py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#A5A5A5] focus:border-[#D5AD13] focus:ring-4 focus:ring-[#FDC517]/15"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#888888] hover:bg-[#F5F5F4]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-[#303030]"
            >
              Confirm password
            </label>
            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
                className="w-full rounded-xl border border-[#E4E4E4] py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#A5A5A5] focus:border-[#D5AD13] focus:ring-4 focus:ring-[#FDC517]/15"
              />
              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#888888] hover:bg-[#F5F5F4]"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-[#696969]">
            <input
              type="checkbox"
              name="terms"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D0D0D0] accent-[#D5AD13]"
            />
            <span>
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-[#806400] hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-[#806400] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-xl bg-[#FDC517] px-4 py-3.5 text-sm font-semibold text-[#171717] transition hover:bg-[#EAB70D] focus:outline-none focus:ring-4 focus:ring-[#FDC517]/25"
          >
            Create account
          </button>
        </form>

        {message && <AuthMessage>{message}</AuthMessage>}

        <p className="pt-1 text-center text-sm text-[#777777]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#806400] hover:text-[#5E4900]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
