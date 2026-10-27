"use client";

import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  CircleHelp,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";

type EmployeeTopbarProps = {
  onMenuClick?: () => void;
};

export default function EmployeeTopbar({
  onMenuClick,
}: EmployeeTopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#EAEAEA] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-xl border border-[#EAEAEA] p-2 text-[#333] hover:bg-[#F7F7F7] lg:hidden"
        >
          <Menu size={19} />
        </button>

        <div className="hidden w-64 items-center gap-2 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] px-3 py-2.5 sm:flex">
          <Search size={16} className="shrink-0 text-[#999]" />
          <input
            aria-label="Search workspace"
            placeholder="Search your workspace..."
            className="w-full bg-transparent text-xs text-[#222] outline-none placeholder:text-[#999]"
          />
          <span className="rounded border border-[#E5E5E5] bg-white px-1.5 py-0.5 text-[10px] text-[#999]">
            /
          </span>
        </div>

        <p className="truncate text-sm font-medium text-[#333] sm:hidden">
          Employee Portal
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          aria-label="Help"
          title="Help"
          className="hidden rounded-full p-2.5 text-[#777] transition hover:bg-[#F5F5F5] hover:text-[#222] sm:inline-flex"
        >
          <CircleHelp size={19} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setProfileOpen(false);
            }}
            className="relative rounded-full p-2.5 text-[#777] transition hover:bg-[#F5F5F5] hover:text-[#222]"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#FDC517]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-72 rounded-2xl border border-[#EAEAEA] bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#222]">
                  Notifications
                </p>
                <span className="rounded-full bg-[#FFF6D5] px-2 py-1 text-[10px] font-medium text-[#765B00]">
                  2 new
                </span>
              </div>

              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-[#FAFAFA] p-3">
                  <p className="text-xs font-medium text-[#333]">
                    Q4 appraisal is open
                  </p>
                  <p className="mt-1 text-[11px] text-[#888]">
                    Complete your self-review before the deadline.
                  </p>
                </div>

                <div className="rounded-xl bg-[#FAFAFA] p-3">
                  <p className="text-xs font-medium text-[#333]">
                    Company announcement
                  </p>
                  <p className="mt-1 text-[11px] text-[#888]">
                    Check the latest updates from HR.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 hidden h-8 w-px bg-[#EAEAEA] sm:block" />

        {/* Employee profile menu */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#F7F7F7]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FCEBA5] text-xs font-bold text-[#4A3B00]">
              OA
            </div>

            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-[#292929]">
                Oluwatosin A.
              </p>
              <p className="mt-0.5 text-[10px] text-[#888]">Employee</p>
            </div>

            <ChevronDown
              size={15}
              className="hidden text-[#888] md:block"
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-48 rounded-2xl border border-[#EAEAEA] bg-white p-2 shadow-xl">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#444] hover:bg-[#F7F7F7]"
              >
                <UserRound size={15} />
                My profile
              </button>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#444] hover:bg-[#F7F7F7]"
              >
                <Settings size={15} />
                Preferences
              </button>

              <div className="my-1 border-t border-[#EEEEEE]" />

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#A33] hover:bg-red-50"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}