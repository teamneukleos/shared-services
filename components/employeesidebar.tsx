"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  CalendarDays,
  Clock3,
  ClipboardCheck,
  FolderOpen,
  Inbox,
  Bell,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

type EmployeeSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const sections = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/employee-dashboard",
      },
      {
        label: "My Profile",
        icon: UserRound,
        href: "/profile",
      },
    ],
  },
  {
    title: "MY TIME",
    items: [
      {
        label: "Leave",
        icon: CalendarDays,
        href: "/leave",
      },
      {
        label: "My Attendance",
        icon: Clock3,
        href: "/my-attendance",
      },
    ],
  },
  {
    title: "MY RECORDS",
    items: [
      {
        label: "My Appraisal",
        icon: ClipboardCheck,
        href: "/my-appraisal",
      },
      {
        label: "My Documents",
        icon: FolderOpen,
        href: "/my-documents",
      },
      {
        label: "My Requests",
        icon: Inbox,
        href: "/my-requests",
      },
    ],
  },
  {
    title: "WORKSPACE",
    items: [
      {
        label: "Announcements",
        icon: Bell,
        href: "/announcements",
      },
    ],
  },
];

export default function EmployeeSidebar({
  mobileOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: EmployeeSidebarProps) {
  const pathname = usePathname();

  // Keep all sections open by default, like the HR Admin sidebar.
  const [unused] = [null];

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
        id="employee-sidebar"
        aria-label="Employee navigation"
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
          <Link
            href="/employee-dashboard"
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
          </Link>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onToggleCollapse}
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

        {/* Portal label */}
        <div className="border-b border-white/5 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            {collapsed ? <span className="md:hidden">Employee</span> : "People"}
          </p>
          {collapsed && (
            <p className="hidden text-center text-[10px] font-bold text-neutral-500 md:block">
              EMP
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-5">
          {sections.map((section) => (
            <div key={section.title} className="mb-5">
              <p
                className={`mb-2 flex min-h-7 items-center px-2 py-1 text-[10px] font-semibold tracking-[0.16em] text-neutral-500 ${
                  collapsed ? "md:hidden" : ""
                }`}
              >
                {section.title}
              </p>

              {section.items.map((item) => {
                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
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
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Employee profile */}
        <div className="shrink-0 border-t border-white/5 bg-[#0d0d10] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[11px] font-bold text-[#FDC517]">
              OA
            </div>

            <div className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-sm font-semibold text-neutral-200">
                Oluwatosin A.
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Employee
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}