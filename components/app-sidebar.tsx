"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  UsersRound,
  CalendarDays,
  Clock3,
  ClipboardCheck,
  FolderOpen,
  Inbox,
  Bell,
  Building2,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  UserRoundPlus,
  X,
} from "lucide-react";

const sections = [
  {
    title: "MAIN",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/" }],
  },
  {
    title: "HR MANAGEMENT",
    items: [
      { label: "Employees", icon: UsersRound, href: "/employees" },
      { label: "Onboarding", icon: UserRoundPlus, href: "/onboarding" },
      { label: "Attendance", icon: Clock3, href: "/attendance" },
      { label: "Leave Management", icon: CalendarDays, href: "/leave-management" },
      {
        label: "Performance & Appraisals",
        icon: ClipboardCheck,
        href: "/performance",
      },
      { label: "Documents", icon: FolderOpen, href: "/documents" },
    ],
  },
  {
    title: "WORKSPACE",
    items: [
      { label: "My Requests & Approvals", icon: Inbox, href: "/approvals" },
      { label: "Announcements", icon: Bell, href: "/announcements" },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "Organisation", icon: Building2, href: "/organisation" },
      {
        label: "Roles & Permissions",
        icon: ShieldCheck,
        href: "/settings/roles",
      },
      { label: "Settings", icon: Settings, href: "/settings" },
    ],
  },
];

const EXPANDED_WIDTH = 264;
const COLLAPSED_WIDTH = 76;

type AppSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
  onWidthChange: React.Dispatch<React.SetStateAction<number>>;
};

export function AppSidebar({
  mobileOpen,
  onClose,
  onWidthChange,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([
    "MAIN",
    "HR MANAGEMENT",
    "WORKSPACE",
    "ADMINISTRATION",
  ]);

  // Report the current desktop width to the parent layout.
  useEffect(() => {
    onWidthChange(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH);
  }, [collapsed, onWidthChange]);

  function toggleSection(title: string) {
    setOpenSections((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title],
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-white/5 bg-[#111115] text-white transition-[width,transform] duration-200 md:translate-x-0 ${
          collapsed ? "md:w-[76px]" : "md:w-[264px]"
        } ${
          mobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/5 px-4 md:h-[82px]">
          <a
            href="/"
            aria-label="Neukleos People home"
            className="flex min-w-0 items-center overflow-hidden"
            onClick={onClose}
          >
            <Image
              src="/neukleos-logo.png"
              alt="Neukleos"
              width={170}
              height={48}
              priority
              className={`h-auto w-[170px] object-contain ${
                collapsed ? "md:w-10" : "md:w-[170px]"
              }`}
            />
          </a>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="ml-2 hidden shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white md:block"
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="border-b border-white/5 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            People
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-5">
          {sections.map((section) => {
            const isOpen = openSections.includes(section.title);

            return (
              <div key={section.title} className="mb-5">
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={isOpen}
                  className={`mb-2 flex min-h-7 w-full items-center justify-between px-2 py-1 text-left text-[10px] font-semibold tracking-[0.16em] text-neutral-500 hover:text-neutral-300 ${
                    collapsed ? "md:hidden" : ""
                  }`}
                >
                  <span>{section.title}</span>
                  {isOpen ? (
                    <ChevronDown size={13} />
                  ) : (
                    <ChevronRight size={13} />
                  )}
                </button>

                {(isOpen || collapsed) &&
                  section.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);

                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        onClick={onClose}
                        className={`mb-1 flex min-h-[43px] items-center gap-3 rounded-lg text-[13px] transition-colors ${
                          active
                            ? "rounded-l-none border-l-4 border-[#FDC517] bg-white/5 pl-2 pr-3 font-medium text-white"
                            : "px-3 text-neutral-400 hover:bg-white/[0.04] hover:text-white"
                        } ${
                          collapsed
                            ? "md:justify-center md:rounded-lg md:border-l-0 md:px-0"
                            : ""
                        }`}
                      >
                        <Icon
                          size={17}
                          className={`shrink-0 ${
                            active ? "text-[#FDC517]" : ""
                          }`}
                        />
                        <span
                          className={`leading-5 ${
                            collapsed ? "md:hidden" : ""
                          }`}
                        >
                          {item.label}
                        </span>
                      </a>
                    );
                  })}
              </div>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="shrink-0 border-t border-white/5 bg-[#0d0d10] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[11px] font-bold text-[#FDC517]">
              HR
            </div>

            <div className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-sm font-semibold text-neutral-200">
                HR Admin
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Human Resources
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}