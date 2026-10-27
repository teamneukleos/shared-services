"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Cake,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  UsersRound,
} from "lucide-react";

import { appraisalSummary, employees, leaveRequests } from "@/lib/mock-data";

// Hardcoded "today" — no Date objects at all.
const TODAY_YEAR = 2026;
const TODAY_MONTH = 9; // October (0-indexed)
const TODAY_DAY = 24;

const DATE_LABEL = "Saturday, 24 October 2026";

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

const birthdayRecords = [
  { name: "Kemi Johnson", dateOfBirth: "1999-10-31", department: "Content Studio" },
  { name: "Amara Okafor", dateOfBirth: "1998-11-02", department: "Creative Studio" },
  { name: "Grace Eze", dateOfBirth: "1997-11-05", department: "Andara Studio" },
  { name: "Daniel Adebayo", dateOfBirth: "1995-10-29", department: "Operations" },
  { name: "Sarah Williams", dateOfBirth: "1994-12-12", department: "Finance" },
  { name: "Tunde Bello", dateOfBirth: "1996-11-01", department: "Creative Studio" },
];

// Pure arithmetic — no Date constructor.
function daysBetweenYears(month: number, day: number): number {
  // Days since start of year (rough, month lengths from 2026, non-leap).
  const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const target = monthLengths.slice(0, month).reduce((a, b) => a + b, 0) + day;
  const today = monthLengths.slice(0, TODAY_MONTH).reduce((a, b) => a + b, 0) + TODAY_DAY;
  return target - today;
}

function getNextBirthdayDaysAway(dateOfBirth: string): number {
  const [, monthString, dayString] = dateOfBirth.split("-");
  const month = Number(monthString) - 1;
  const day = Number(dayString);

  let days = daysBetweenYears(month, day);
  if (days < 0) {
    // Birthday already passed this year — next year.
    days += 365;
  }
  return days;
}

function formatBirthday(dateOfBirth: string): string {
  const [, monthString, dayString] = dateOfBirth.split("-");
  const monthShort = monthNames[Number(monthString) - 1].slice(0, 3);
  return `${Number(dayString)} ${monthShort}`;
}

const leaveColours = [
  "bg-[#fff7d6] text-[#8a6900]",
  "bg-[#e5e8f7] text-[#535da0]",
  "bg-[#f9e9d5] text-[#966b32]",
  "bg-[#f3dfdf] text-[#9b5757]",
];

export default function EmployeeDashboard() {
  const [month, setMonth] = useState(9);
  const [year, setYear] = useState(2026);

  // Birthday data computed purely from constants — no Date objects.
  const birthdayInfo = useMemo(() => {
    const enriched = birthdayRecords.map((person) => ({
      ...person,
      daysAway: getNextBirthdayDaysAway(person.dateOfBirth),
    }));

    const sorted = [...enriched].sort((a, b) => a.daysAway - b.daysAway);

    const withinSevenDays = enriched.filter((p) => p.daysAway <= 7).length;

    return { sorted, withinSevenDays };
  }, []);

  function changeMonth(amount: number) {
    // Pure month/year arithmetic — no Date constructor.
    let nextMonth = month + amount;
    let nextYear = year;

    while (nextMonth < 0) {
      nextMonth += 12;
      nextYear -= 1;
    }
    while (nextMonth > 11) {
      nextMonth -= 12;
      nextYear += 1;
    }

    setMonth(nextMonth);
    setYear(nextYear);
  }

  // Day-of-week for the 1st of the displayed month (Zeller-like, via known anchor).
  // 1 Oct 2026 is a Thursday (index 4, Sunday = 0).
  const firstDay = (() => {
    const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const anchorYear = 2026;
    const anchorMonth = 9; // October
    const anchorFirstDay = 4; // Thursday

    let deltaMonths =
      (year - anchorYear) * 12 + (month - anchorMonth);

    let dow = anchorFirstDay;
    if (deltaMonths >= 0) {
      for (let i = 0; i < deltaMonths; i++) {
        const m = (anchorMonth + i) % 12;
        const y = anchorYear + Math.floor((anchorMonth + i) / 12);
        const len = monthLengths[m] + (m === 1 && isLeap(y) ? 1 : 0);
        dow = (dow + len) % 7;
      }
    } else {
      for (let i = 0; i < -deltaMonths; i++) {
        const m = (month - i - 1 + 12) % 12;
        const y = year + Math.floor((month - i - 1) / 12);
        const len = monthLengths[m] + (m === 1 && isLeap(y) ? 1 : 0);
        dow = (dow - len + 7) % 7;
      }
    }
    return dow;
  })();

  function isLeap(y: number): boolean {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }

  const daysInMonth = (() => {
    const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return monthLengths[month] + (month === 1 && isLeap(year) ? 1 : 0);
  })();

  const calendarCells = Array.from(
    { length: firstDay + daysInMonth },
    (_, index) => (index < firstDay ? null : index - firstDay + 1),
  );

  const leaveByDay: Record<number, string[]> = {
    5: ["Amara O."],
    8: ["Daniel A.", "Grace E."],
    12: ["Sarah W."],
    14: ["Tunde B."],
    15: ["Amara O.", "Sarah W."],
    19: ["Grace E."],
    20: ["Daniel A.", "Tunde B."],
    22: ["Daniel A."],
    26: ["Amara O.", "Sarah W."],
    27: ["Amara O."],
    28: ["Amara O."],
  };

  const pendingCount = leaveRequests.filter(
    (request) => request.status === "Pending",
  ).length;

  const appraisalProgress =
    appraisalSummary.employeesInReview > 0
      ? Math.round(
          (appraisalSummary.managerReviewsCompleted /
            appraisalSummary.employeesInReview) *
            100,
        )
      : 0;

  const departmentNames = [
    "Content Studio",
    "Andara Studio",
    "Creative Studio",
    "Finance",
    "Operations",
  ];

  return (
    <main className="min-w-0 bg-[#f7f7f5] px-4 pb-10 pt-6 text-[#202024] md:px-8">
      {/* Page heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs text-[#737373]">{DATE_LABEL}</p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#17171b] sm:text-[28px]">
            Good morning, HR Admin
          </h1>

          <p className="mt-2 text-sm text-[#737373]">
            Here's what's happening across your organisation.
          </p>
        </div>

        <a
          href="/employees"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#FDC517] px-4 py-3 text-sm font-semibold text-[#111115] shadow-sm transition hover:bg-[#e8b400] sm:self-auto"
        >
          <UsersRound size={17} />
          Add employee
        </a>
      </div>

      {/* Summary cards */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total employees"
          value={String(employees.length)}
          detail="Across all departments"
          icon={<UsersRound size={19} />}
          trend="View employee directory"
        />

        <SummaryCard
          label="On leave today"
          value="2"
          detail="Employees currently away"
          icon={<CalendarDays size={19} />}
          trend="View leave"
        />

        <SummaryCard
          label="Pending approvals"
          value={String(pendingCount)}
          detail="Leave requests to review"
          icon={<Clock3 size={19} />}
          trend="Needs attention"
          warning
        />

        <SummaryCard
          label="Appraisal progress"
          value={`${appraisalProgress}%`}
          detail="Manager reviews completed"
          icon={<ClipboardCheck size={19} />}
          trend={`${appraisalSummary.managerReviewsCompleted} of ${appraisalSummary.employeesInReview} reviews`}
        />
      </section>

      {/* Upcoming birthdays */}
      <section className="mb-6 rounded-2xl border border-[#e7e7e4] bg-white p-5 shadow-[0_4px_18px_rgba(17,17,21,0.025)] sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#fff6cf] p-2.5 text-[#755800]">
              <Cake size={20} />
            </div>
            <div>
              <h2 className="font-semibold">Upcoming birthdays</h2>
              <p className="mt-1 text-xs text-[#737373]">
                Birthdays coming up across your organisation.
              </p>
            </div>
          </div>
          <span className="self-start rounded-full bg-[#fff6cf] px-3 py-1.5 text-xs font-medium text-[#755800] sm:self-auto">
            {birthdayInfo.withinSevenDays} in the next 7 days
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {birthdayInfo.sorted.slice(0, 5).map((person) => (
            <div
              key={person.name}
              className="flex items-center gap-3 rounded-xl border border-[#efefec] p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff6cf] text-xs font-semibold text-[#755800]">
                {person.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{person.name}</p>
                <p className="mt-1 text-xs text-[#737373]">
                  {formatBirthday(person.dateOfBirth)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-[#8a6900]">
                  {person.daysAway === 0
                    ? "Today 🎉"
                    : person.daysAway === 1
                      ? "Tomorrow"
                      : `In ${person.daysAway} days`}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-[#8a8a8a]">
          Demo data for now. Full dates of birth are not displayed on the dashboard.
        </p>
      </section>

      {/* Leave calendar and upcoming leave */}
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
                Get an overview of employee leave across the organisation.
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
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
              (day) => (
                <div
                  key={day}
                  className="py-3 text-center text-[9px] font-semibold tracking-wide text-[#737373] sm:text-xs"
                >
                  {day}
                </div>
              ),
            )}
          </div>

          <div className="grid grid-cols-7 gap-px bg-[#e7e7e4]">
            {calendarCells.map((day, index) => {
              const isToday =
                day === TODAY_DAY &&
                month === TODAY_MONTH &&
                year === TODAY_YEAR;

              const dayLeave =
                month === 9 && day !== null ? leaveByDay[day] ?? [] : [];

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

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#737373]">
            <Legend color="bg-[#fff7d6]" label="Annual leave" />
            <Legend color="bg-[#e5e8f7]" label="Sick leave" />
            <Legend color="bg-[#f9e9d5]" label="Other leave" />
          </div>
        </div>

        {/* Upcoming leave */}
        <div className="rounded-2xl border border-[#e7e7e4] bg-white p-5 shadow-[0_4px_18px_rgba(17,17,21,0.025)]">
          <div className="mb-5 flex items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold">Upcoming leave</h2>
              <p className="mt-1 text-xs text-[#737373]">
                Requests and scheduled absences
              </p>
            </div>

            <CalendarCheck size={19} className="text-[#8a6900]" />
          </div>

          <div className="space-y-4">
            {leaveRequests.length > 0 ? (
              leaveRequests.map((request) => (
                <div
                  key={request.id}
                  className="border-b border-[#e7e7e4] pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f4f2] text-[10px] font-semibold text-[#24242a]">
                        {request.employee
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {request.employee}
                        </p>
                        <p className="mt-1 text-xs text-[#737373]">
                          {request.type}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
                        request.status === "Pending"
                          ? "bg-[#fff2d7] text-[#8a5b00]"
                          : "bg-[#fff6cf] text-[#755800]"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <p className="ml-12 mt-2 text-xs text-[#737373]">
                    {request.startDate} · {request.days} day
                    {request.days === 1 ? "" : "s"}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-[#737373]">
                No upcoming leave requests.
              </p>
            )}
          </div>

          <a
            href="/leave"
            className="mt-5 flex items-center justify-between border-t border-[#e7e7e4] pt-4 text-sm font-medium text-[#755800] transition hover:text-[#111115]"
          >
            View leave requests
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Appraisals and employee overview */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#e7e7e4] bg-white p-5 shadow-[0_4px_18px_rgba(17,17,21,0.025)] sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-semibold">Performance & appraisals</h2>
              <p className="mt-1 text-xs text-[#737373]">
                Q3 2026 review progress
              </p>
            </div>

            <ClipboardCheck size={19} className="text-[#8a6900]" />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <MiniStat
              label="In review"
              value={String(appraisalSummary.employeesInReview)}
            />

            <MiniStat
              label="Self-appraisals submitted"
              value={String(appraisalSummary.selfAppraisalsSubmitted)}
            />

            <MiniStat
              label="Manager reviews completed"
              value={String(appraisalSummary.managerReviewsCompleted)}
            />

            <MiniStat
              label="Awaiting manager"
              value={String(appraisalSummary.awaitingManagerReview)}
            />
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#f0f0ed]">
            <div
              className="h-full rounded-full bg-[#FDC517] transition-all duration-300"
              style={{ width: `${appraisalProgress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#737373]">
            <span>Manager review completion</span>
            <span className="font-semibold text-[#202024]">
              {appraisalProgress}%
            </span>
          </div>

          <a
            href="/performance"
            className="mt-5 flex items-center justify-between border-t border-[#e7e7e4] pt-4 text-sm font-medium text-[#755800] transition hover:text-[#111115]"
          >
            View appraisals
            <ArrowRight size={16} />
          </a>
        </div>

        <div className="rounded-2xl border border-[#e7e7e4] bg-white p-5 shadow-[0_4px_18px_rgba(17,17,21,0.025)] sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-semibold">Employee overview</h2>
              <p className="mt-1 text-xs text-[#737373]">
                A quick look at your workforce
              </p>
            </div>

            <UsersRound size={19} className="text-[#8a6900]" />
          </div>

          <div className="space-y-5">
            {departmentNames.map((department) => {
              const count = employees.filter(
                (employee) => employee.department === department,
              ).length;

              const percentage =
                employees.length > 0 ? (count / employees.length) * 100 : 0;

              return (
                <div key={department}>
                  <div className="mb-2 flex justify-between gap-3 text-xs">
                    <span className="text-[#737373]">{department}</span>
                    <span className="font-semibold">{count}</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#f0f0ed]">
                    <div
                      className="h-full rounded-full bg-[#FDC517] transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <a
            href="/employees"
            className="mt-6 flex items-center justify-between border-t border-[#e7e7e4] pt-4 text-sm font-medium text-[#755800] transition hover:text-[#111115]"
          >
            View employees
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <p className="mt-6 text-center text-[11px] text-[#737373]">
        Neukleos People · HR workspace · Demo data
      </p>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
  trend,
  warning = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  trend: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e7e4] bg-white p-5 shadow-[0_4px_18px_rgba(17,17,21,0.025)] transition-shadow hover:shadow-[0_8px_24px_rgba(17,17,21,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[#737373]">{label}</p>

        <div
          className={`rounded-lg p-2 ${
            warning
              ? "bg-[#fff2d7] text-[#8a5b00]"
              : "bg-[#fff6cf] text-[#755800]"
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[#737373]">{detail}</p>

      <div
        className={`mt-4 flex items-center gap-1 text-[11px] ${
          warning ? "text-[#8a5b00]" : "text-[#755800]"
        }`}
      >
        {warning ? (
          <ArrowDownRight size={13} />
        ) : (
          <ArrowUpRight size={13} />
        )}
        {trend}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f4f4f2] p-3">
      <p className="text-xs text-[#737373]">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
}