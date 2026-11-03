"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Moon, Search } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

type AppTopbarProps = {
  sidebarWidth: number;
  onMenuClick: () => void;
};

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "U";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function AppTopbar({ sidebarWidth, onMenuClick }: AppTopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const sidebarStyle = {
    "--sidebar-width": `${sidebarWidth}px`,
  } as CSSProperties;

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    router.replace("/sign-in");
  }

  return (
    <header
      style={sidebarStyle}
      className="fixed left-0 right-0 top-0 z-30 flex h-[72px] items-center justify-between border-b border-neutral-100 bg-white/95 px-4 backdrop-blur-sm md:left-[var(--sidebar-width)] md:h-[82px] md:px-8"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          aria-controls="app-sidebar"
          onClick={onMenuClick}
          className="shrink-0 rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 md:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-neutral-900 md:text-base">
            HR Dashboard
          </h1>
          <p className="mt-0.5 hidden truncate text-xs text-neutral-400 sm:block">
            Overview of your organisation
          </p>
        </div>
      </div>

      <div className="ml-2 flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
        <div className="hidden items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 lg:flex">
          <Search size={16} className="shrink-0 text-neutral-400" />
          <input
            type="search"
            aria-label="Search workspace"
            placeholder="Search workspace"
            className="w-32 bg-transparent text-xs text-neutral-800 outline-none placeholder:text-neutral-400 xl:w-44"
          />
          <span className="hidden rounded bg-neutral-200/60 px-1.5 py-1 text-[10px] font-medium text-neutral-500 xl:inline">
            ⌘ K
          </span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-50"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-[#FDC517]" />
        </button>

        <button
          type="button"
          aria-label="Toggle theme"
          className="hidden rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-50 sm:block"
        >
          <Moon size={18} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-[#FDC517]">
              {user ? initialsFromEmail(user.email) : "HR"}
            </div>

            <span className="hidden max-w-[160px] truncate text-xs font-semibold text-neutral-800 xl:block">
              {user?.email ?? "Signed in"}
            </span>

            <ChevronDown size={14} className="hidden text-neutral-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
              <div className="border-b border-neutral-100 px-3 py-2.5">
                <p className="truncate text-xs font-semibold text-neutral-800">
                  {user?.email}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  {user?.permissions.length ?? 0} permissions
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
