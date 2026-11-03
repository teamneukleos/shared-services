"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";
import {
  listEmployees,
  listLeaveApplications,
  listOnboardingPlans,
} from "@/lib/hr/api";
import type { LeaveApplication } from "@/lib/hr/types";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const leaveColours = [
  "bg-[#fff7d6] text-[#8a6900]",
  "bg-[#e5e8f7] text-[#535da0]",
  "bg-[#f9e9d5] text-[#966b32]",
  "bg-[#f3dfdf] text-[#9b5757]",
];

export default function HrDashboardPage() {
  const { user, hasPermission } = useAuth();
  const canReadEmployees = hasPermission("employee.read");
  const canReadLeave = hasPermission("leave.application.read");
  const canReadOnboarding = hasPermission("onboarding.read");

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [employeeTotal, setEmployeeTotal] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [pendingLeave, setPendingLeave] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [onboardingInProgress, setOnboardingInProgress] = useState(0);
  const [approvedLeave, setApprovedLeave] = useState<LeaveApplication[]>([]);
  const [recentPending, setRecentPending] = useState<LeaveApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const jobs: Promise<void>[] = [];

      if (canReadEmployees) {
        jobs.push(
          listEmployees({ page: 1, size: 1 }).then((result) =>
            setEmployeeTotal(result.meta.totalItems),
          ),
          listEmployees({ page: 1, size: 1, status: "ACTIVE" }).then((result) =>
            setActiveEmployees(result.meta.totalItems),
          ),
        );
      }

      if (canReadLeave) {
        jobs.push(
          listLeaveApplications({ page: 1, size: 1, status: "PENDING" }).then(
            (result) => setPendingLeave(result.meta.totalItems),
          ),
          listLeaveApplications({
            page: 1,
            size: 100,
            status: "APPROVED",
          }).then((result) => setApprovedLeave(result.data)),
          listLeaveApplications({
            page: 1,
            size: 5,
            status: "PENDING",
          }).then((result) => setRecentPending(result.data)),
        );
      }

      if (canReadOnboarding) {
        jobs.push(
          listOnboardingPlans({
            page: 1,
            size: 1,
            status: "IN_PROGRESS",
          }).then((result) => setOnboardingInProgress(result.meta.totalItems)),
        );
      }

      await Promise.all(jobs);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load dashboard metrics.",
      );
    } finally {
      setLoading(false);
    }
  }, [canReadEmployees, canReadLeave, canReadOnboarding]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const today = startOfDay(new Date());
    const count = approvedLeave.filter((item) => {
      const start = startOfDay(new Date(item.startDate));
      const end = startOfDay(new Date(item.endDate));
      return start.getTime() <= today.getTime() && end.getTime() >= today.getTime();
    }).length;
    setOnLeaveToday(count);
  }, [approvedLeave]);

  const leaveByDay = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const item of approvedLeave) {
      const start = startOfDay(new Date(item.startDate));
      const end = startOfDay(new Date(item.endDate));
      const cursor = new Date(start);
      while (cursor.getTime() <= end.getTime()) {
        if (cursor.getMonth() === month && cursor.getFullYear() === year) {
          const day = cursor.getDate();
          map[day] ??= [];
          const shortName = item.employeeName.split(" ")[0] ?? item.employeeName;
          if (!map[day].includes(shortName)) {
            map[day].push(shortName);
          }
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return map;
  }, [approvedLeave, month, year]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells = Array.from(
    { length: firstDay + daysInMonth },
    (_, index) => (index < firstDay ? null : index - firstDay + 1),
  );

  function changeMonth(amount: number) {
    const next = new Date(year, month + amount, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  }

  const greetingName = user?.email?.split("@")[0] ?? "there";
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-w-0 bg-[#f7f7f5] px-4 pb-10 pt-6 text-[#202024] md:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs text-[#737373]">{todayLabel}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#17171b] sm:text-[28px]">
            Good {timeOfDay()}, {greetingName}
          </h1>
          <p className="mt-2 text-sm text-[#737373]">
            Live snapshot of people and leave across your organisation.
          </p>
        </div>
        {canReadEmployees && (
          <Link
            href="/employees"
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#FDC517] px-4 py-3 text-sm font-semibold text-[#111115] shadow-sm transition hover:bg-[#e8b400] sm:self-auto"
          >
            <UsersRound size={17} />
            Employees
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total employees"
          value={loading ? "…" : String(employeeTotal)}
          detail={`${activeEmployees} active`}
          icon={<UsersRound size={19} />}
          href="/employees"
        />
        <SummaryCard
          label="On leave today"
          value={loading ? "…" : String(onLeaveToday)}
          detail="Approved leave covering today"
          icon={<CalendarDays size={19} />}
          href="/leave-management"
        />
        <SummaryCard
          label="Pending leave"
          value={loading ? "…" : String(pendingLeave)}
          detail="Awaiting review"
          icon={<Clock3 size={19} />}
          href="/leave-management"
          warning={pendingLeave > 0}
        />
        <SummaryCard
          label="Onboarding in progress"
          value={loading ? "…" : String(onboardingInProgress)}
          detail="Active plans"
          icon={<ClipboardCheck size={19} />}
          href="/onboarding"
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e7e7e4] bg-white p-4 shadow-[0_4px_18px_rgba(17,17,21,0.025)] sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[#fff6cf] p-2 text-[#755800]">
                  <CalendarDays size={18} />
                </div>
                <h2 className="font-semibold">Company leave calendar</h2>
              </div>
              <p className="mt-2 text-xs text-[#737373]">
                Approved leave from the live leave API.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e7e7e4] px-2 py-2 sm:justify-start">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="rounded-lg p-1.5 transition hover:bg-[#f4f4f2]"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="min-w-[130px] text-center text-sm font-semibold">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="rounded-lg p-1.5 transition hover:bg-[#f4f4f2]"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-[#e7e7e4]">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-[9px] font-semibold tracking-wide text-[#737373] sm:text-xs"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-[#e7e7e4]">
            {calendarCells.map((day, index) => {
              const isToday =
                day === now.getDate() &&
                month === now.getMonth() &&
                year === now.getFullYear();
              const dayLeave = day !== null ? leaveByDay[day] ?? [] : [];

              return (
                <div
                  key={`${year}-${month}-${index}`}
                  className={`min-h-[70px] overflow-hidden bg-white p-1 transition-colors hover:bg-[#fafaf8] sm:min-h-[105px] sm:p-2 ${
                    isToday ? "bg-[#fffdf3]" : ""
                  }`}
                >
                  {day !== null && (
                    <>
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? "bg-[#FDC517] text-[#111115]"
                            : "text-[#45454d]"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayLeave.slice(0, 2).map((name, i) => (
                          <div
                            key={`${name}-${i}`}
                            title={name}
                            className={`truncate rounded px-1 py-1 text-[8px] sm:text-[10px] ${
                              leaveColours[(day + i) % leaveColours.length]
                            }`}
                          >
                            {name}
                          </div>
                        ))}
                        {dayLeave.length > 2 && (
                          <p className="text-[9px] text-[#737373]">
                            +{dayLeave.length - 2} more
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7e7e4] bg-white p-5 shadow-[0_4px_18px_rgba(17,17,21,0.025)]">
          <h2 className="font-semibold">Pending leave</h2>
          <p className="mt-1 text-xs text-[#737373]">
            Latest requests waiting for review.
          </p>
          <div className="mt-4 space-y-3">
            {recentPending.length === 0 ? (
              <p className="text-sm text-[#737373]">No pending requests.</p>
            ) : (
              recentPending.map((item) => (
                <Link
                  key={item.id}
                  href="/leave-management"
                  className="block rounded-xl border border-[#efefec] p-3 transition hover:bg-[#fafaf8]"
                >
                  <p className="text-sm font-medium">{item.employeeName}</p>
                  <p className="mt-1 text-xs text-[#737373]">
                    {item.leaveTypeName} · {formatDate(item.startDate)} →{" "}
                    {formatDate(item.endDate)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
  href,
  warning,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  href: string;
  warning?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border bg-white p-5 shadow-[0_4px_18px_rgba(17,17,21,0.025)] transition hover:border-[#FDC517]/60 ${
        warning ? "border-amber-200" : "border-[#e7e7e4]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[#737373]">{label}</p>
        <span className="rounded-xl bg-[#fff6cf] p-2.5 text-[#755800]">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[#737373]">{detail}</p>
    </Link>
  );
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function timeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}
