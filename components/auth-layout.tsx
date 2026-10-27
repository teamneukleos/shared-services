"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, UsersRound } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
  eyebrow: string;
  heading: string;
  description: string;
};

export function AuthLayout({
  children,
  eyebrow,
  heading,
  description,
}: AuthLayoutProps) {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      {/* Left branding panel */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#111115] p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute -right-24 top-36 h-64 w-64 rounded-full border border-[#FDC517]/20" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#FDC517]/[0.06] blur-3xl" />

        <div className="relative z-10">
          <LinkBrand />
        </div>

        <div className="relative z-10 my-16 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-[#FDC517]" />
            Your people. One workspace.
          </div>

          <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Better work starts with{" "}
            <span className="text-[#FDC517]">better people experiences.</span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-white/55 xl:text-base">
            A simpler way to manage your people, stay organised and keep
            everyone moving in the same direction.
          </p>

          <div className="mt-12 max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDC517] text-[#111115]">
                  <UsersRound size={21} />
                </div>
                <div>
                  <p className="text-sm font-medium">People, made simpler.</p>
                  <p className="mt-1 text-xs text-white/45">
                    HR operations in one place
                  </p>
                </div>
              </div>
              <ArrowUpRight className="text-[#FDC517]" size={20} />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {["People", "Time off", "Growth"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-3 text-center text-xs text-white/60"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4 text-xs text-white/35">
          <span>© {year ?? "2025"} Neukleos People</span>
          <span>Built around people.</span>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-12 xl:px-20">
        <div className="mb-12 lg:hidden">
          <LinkBrand />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7900]">
                {eyebrow}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#202024] sm:text-4xl">
                {heading}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#737373]">
                {description}
              </p>
            </div>

            {children}
          </div>
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#8A8A8A] lg:justify-end">
          <span>Neukleos People</span>
          <span>Secure people management</span>
        </footer>
      </section>
    </main>
  );
}

function LinkBrand() {
  return (
    <Link href="/sign-in" className="inline-flex items-center gap-3">
    <Image
        src="/neukleos-logo.png"
        alt="Neukleos People"
        width={180}
        height={48}
        priority
        className="h-10 w-auto object-contain"
    />
    </Link>
  );
}

export function GoogleButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-sm font-medium text-[#292929] transition hover:bg-[#F8F8F7] focus:outline-none focus:ring-2 focus:ring-[#FDC517]/60"
    >
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.83 46.98 24.55Z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
        />
      </svg>
      {label}
    </button>
  );
}

export function AuthMessage({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="mt-4 rounded-xl border border-[#F0D77B] bg-[#FFF9DF] px-4 py-3 text-sm leading-6 text-[#6C5700]"
    >
      {children}
    </div>
  );
}