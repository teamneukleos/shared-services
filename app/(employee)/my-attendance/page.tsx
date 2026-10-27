"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Info,
  LogIn,
  LogOut,
  MoreHorizontal,
  Timer,
  TrendingUp,
  XCircle,
} from "lucide-react";

type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Leave"
  | "Weekend";

type AttendanceRecord = {
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: AttendanceStatus;
};

const ACCENT = "#FDC517";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatHours = (hours: number) => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  return `${wholeHours}h ${minutes}m`;
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const formatDisplayDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatMonth = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

function createMockAttendance(
  year: number,
  month: number,
  todayKey: string
): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);

    if (dateKey >= todayKey) continue;

    const weekday = date.getDay();

    if (weekday === 0 || weekday === 6) {
      records.push({
        date: dateKey,
        checkIn: "--",
        checkOut: "--",
        hours: 0,
        status: "Weekend",
      });
      continue;
    }

    if (day % 13 === 0) {
      records.push({
        date: dateKey,
        checkIn: "--",
        checkOut: "--",
        hours: 0,
        status: "Leave",
      });
      continue;
    }

    if (day % 17 === 0) {
      records.push({
        date: dateKey,
        checkIn: "--",
        checkOut: "--",
        hours: 0,
        status: "Absent",
      });
      continue;
    }

    const late = day % 5 === 0;
    const checkIn = late ? "09:18" : day % 3 === 0 ? "08:47" : "08:55";
    const hours = day % 4 === 0 ? 7.5 : day % 3 === 0 ? 8.25 : 8;

    const [inHour, inMinute] = checkIn.split(":").map(Number);
    const totalMinutes = inHour * 60 + inMinute + Math.round(hours * 60);
    const checkOut = `${String(Math.floor(totalMinutes / 60) % 24).padStart(
      2,
      "0"
    )}:${String(totalMinutes % 60).padStart(2, "0")}`;

    records.push({
      date: dateKey,
      checkIn,
      checkOut,
      hours,
      status: late ? "Late" : "Present",
    });
  }

  return records;
}

const statusStyles: Record<AttendanceStatus, string> = {
  Present: "bg-emerald-50 text-emerald-700",
  Late: "bg-amber-50 text-amber-700",
  Absent: "bg-red-50 text-red-600",
  Leave: "bg-violet-50 text-violet-700",
  Weekend: "bg-gray-100 text-gray-500",
};

export default function MyAttendancePage() {
  const [now, setNow] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(null);
  const [checkedOutAt, setCheckedOutAt] = useState<Date | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const current = new Date();

    setNow(current);
    setSelectedMonth(
      new Date(current.getFullYear(), current.getMonth(), 1)
    );

    setRecords(
      createMockAttendance(
        current.getFullYear(),
        current.getMonth(),
        formatDateKey(current)
      )
    );

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const todayKey = now ? formatDateKey(now) : "";
  const isCheckedIn = Boolean(checkedInAt && !checkedOutAt);
  const hasCheckedOut = Boolean(checkedInAt && checkedOutAt);

  const elapsedSeconds =
    checkedInAt && now
      ? Math.max(
          0,
          Math.floor(
            ((checkedOutAt ?? now).getTime() - checkedInAt.getTime()) / 1000
          )
        )
      : 0;

  const completedHours = useMemo(
    () => records.reduce((total, record) => total + record.hours, 0),
    [records]
  );

  const presentDays = records.filter(
    (record) => record.status === "Present" || record.status === "Late"
  ).length;

  const lateDays = records.filter(
    (record) => record.status === "Late"
  ).length;

  const attendanceRate =
    records.filter(
      (record) =>
        record.status !== "Weekend" && record.status !== "Leave"
    ).length > 0
      ? Math.round(
          (presentDays /
            records.filter(
              (record) =>
                record.status !== "Weekend" && record.status !== "Leave"
            ).length) *
            100
        )
      : 100;

  const currentMonthRecords = useMemo(() => {
    if (!selectedMonth) return [];

    return createMockAttendance(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      todayKey
    );
  }, [selectedMonth, todayKey]);

  const displayedRecords = useMemo(() => {
    const todayRecord: AttendanceRecord[] =
      checkedInAt && now
        ? [
            {
              date: todayKey,
              checkIn: formatTime(checkedInAt),
              checkOut: checkedOutAt ? formatTime(checkedOutAt) : "--",
              hours:
                elapsedSeconds > 0
                  ? Math.round((elapsedSeconds / 3600) * 100) / 100
                  : 0,
              status:
                checkedInAt.getHours() > 9 ||
                (checkedInAt.getHours() === 9 &&
                  checkedInAt.getMinutes() > 0)
                  ? "Late"
                  : "Present",
            },
          ]
        : [];

    const allRecords = [...todayRecord, ...records].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    return allRecords.filter((record) => {
      if (filter === "All") return true;
      return record.status === filter;
    });
  }, [
    records,
    checkedInAt,
    checkedOutAt,
    now,
    todayKey,
    elapsedSeconds,
    filter,
  ]);

  const calendarDays = useMemo(() => {
    if (!selectedMonth) return [];

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = Array(firstDay).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) days.push(null);

    return days;
  }, [selectedMonth]);

  const getCalendarStatus = (date: Date): AttendanceStatus | "Today" | null => {
    const key = formatDateKey(date);

    if (key === todayKey) {
      if (checkedInAt) {
        return checkedInAt.getHours() > 9 ? "Late" : "Present";
      }
      return "Today";
    }

    const record = currentMonthRecords.find((item) => item.date === key);

    return record?.status ?? null;
  };

  const changeMonth = (amount: number) => {
    if (!selectedMonth) return;

    setSelectedMonth(
      new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + amount,
        1
      )
    );
  };

  const handleCheckIn = () => {
    if (checkedInAt) return;

    const current = new Date();

    setNow(current);
    setCheckedInAt(current);
    setCheckedOutAt(null);
  };

  const handleCheckOut = () => {
    if (!checkedInAt || checkedOutAt) return;

    const current = new Date();

    setNow(current);
    setCheckedOutAt(current);
  };

  const exportAttendance = () => {
    const headers = ["Date", "Check In", "Check Out", "Hours", "Status"];

    const rows = displayedRecords.map((record) => [
      record.date,
      record.checkIn,
      record.checkOut,
      record.hours.toFixed(2),
      record.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "my-attendance.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  if (!now || !selectedMonth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#FDC517]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-gray-900">My Attendance</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
              My Attendance
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Keep track of your work hours and attendance history.
            </p>
          </div>

          <button
            onClick={exportAttendance}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:self-auto"
          >
            <Download size={16} />
            Export attendance
          </button>
        </div>

        {/* Check in / check out panel */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1fr_340px]">
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                  <CalendarDays size={14} />
                  {formatDisplayDate(now)}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    hasCheckedOut
                      ? "bg-gray-100 text-gray-600"
                      : isCheckedIn
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      hasCheckedOut
                        ? "bg-gray-400"
                        : isCheckedIn
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                    }`}
                  />
                  {hasCheckedOut
                    ? "Day completed"
                    : isCheckedIn
                      ? "Currently working"
                      : "Not checked in"}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-semibold text-gray-900 sm:text-2xl">
                {hasCheckedOut
                  ? "You've completed your workday."
                  : isCheckedIn
                    ? "You're checked in. Have a productive day!"
                    : "Ready to start your workday?"}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                {hasCheckedOut
                  ? "Your check-out time has been recorded for today. See your hours below."
                  : isCheckedIn
                    ? "Your working time is being tracked. Remember to check out when you're done."
                    : "Check in when you arrive at work to record your attendance and start tracking your working hours."}
              </p>

              <div className="mt-7 grid max-w-xl grid-cols-2 gap-3 sm:gap-5">
                <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <LogIn size={16} />
                    Check-in time
                  </div>

                  <p className="mt-3 text-xl font-semibold tabular-nums text-gray-900 sm:text-2xl">
                    {checkedInAt ? formatTime(checkedInAt) : "--:--"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {checkedInAt ? "Recorded today" : "Awaiting check-in"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <LogOut size={16} />
                    Check-out time
                  </div>

                  <p className="mt-3 text-xl font-semibold tabular-nums text-gray-900 sm:text-2xl">
                    {checkedOutAt ? formatTime(checkedOutAt) : "--:--"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {checkedOutAt
                      ? "Recorded today"
                      : isCheckedIn
                        ? "Not checked out yet"
                        : "Awaiting check-in"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between border-t border-gray-100 bg-[#FCFCFA] p-5 sm:p-7 lg:border-l lg:border-t-0">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Timer size={17} />
                  Time worked today
                </div>

                <p className="mt-4 font-mono text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                  {formatDuration(elapsedSeconds)}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {hasCheckedOut
                    ? "Final recorded session duration"
                    : isCheckedIn
                      ? "Your timer updates automatically"
                      : "Your timer starts when you check in"}
                </p>
              </div>

              <div className="mt-7">
                {!checkedInAt ? (
                  <button
                    onClick={handleCheckIn}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-5 py-3.5 text-sm font-semibold text-[#191919] shadow-sm transition hover:bg-[#edb900] active:scale-[0.99]"
                  >
                    <LogIn size={18} />
                    Check In
                  </button>
                ) : !checkedOutAt ? (
                  <button
                    onClick={handleCheckOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#191919] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.99]"
                  >
                    <LogOut size={18} />
                    Check Out
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={18} />
                    Attendance completed
                  </div>
                )}

                <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                  {hasCheckedOut
                    ? "Your attendance for today is complete."
                    : "Your attendance time is recorded when you use this button."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Days Present"
            value={String(presentDays + (checkedInAt ? 1 : 0))}
            subtitle="Including today's attendance"
            icon={<CheckCircle2 size={19} />}
            iconClass="bg-emerald-50 text-emerald-600"
            trend={<ArrowUpRight size={15} />}
          />

          <SummaryCard
            title="Late Arrivals"
            value={String(
              lateDays +
                (checkedInAt &&
                (checkedInAt.getHours() > 9 ||
                  (checkedInAt.getHours() === 9 &&
                    checkedInAt.getMinutes() > 0))
                  ? 1
                  : 0)
            )}
            subtitle="Recorded this month"
            icon={<Clock3 size={19} />}
            iconClass="bg-amber-50 text-amber-600"
            trend={<ArrowDownRight size={15} />}
          />

          <SummaryCard
            title="Hours Worked"
            value={formatHours(completedHours + elapsedSeconds / 3600)}
            subtitle="Total for the month"
            icon={<Timer size={19} />}
            iconClass="bg-blue-50 text-blue-600"
            trend={<TrendingUp size={15} />}
          />

          <SummaryCard
            title="Attendance Rate"
            value={`${Math.min(
              100,
              Math.round(
                (presentDays + (checkedInAt ? 1 : 0)) /
                  Math.max(
                    1,
                    records.filter(
                      (record) =>
                        record.status !== "Weekend" &&
                        record.status !== "Leave"
                    ).length + (checkedInAt ? 1 : 0)
                  ) *
                  100
              )
            )}%`}
            subtitle="Based on scheduled workdays"
            icon={<CalendarDays size={19} />}
            iconClass="bg-violet-50 text-violet-600"
            trend={<TrendingUp size={15} />}
          />
        </section>

        {/* Calendar and attendance details */}
        <div className="grid items-start gap-6 xl:grid-cols-[1.05fr_1.45fr]">
          {/* Calendar */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Attendance calendar
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Your monthly attendance overview
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
                >
                  <ArrowLeft size={15} />
                </button>

                <button
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
                >
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm font-semibold text-gray-800">
              {formatMonth(selectedMonth)}
            </div>

            <div className="mt-5 grid grid-cols-7 gap-y-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div
                    key={day}
                    className="pb-2 text-[11px] font-medium text-gray-400"
                  >
                    {day}
                  </div>
                )
              )}

              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-10" />;
                }

                const status = getCalendarStatus(date);
                const isToday = formatDateKey(date) === todayKey;

                let dayClass = "text-gray-700 hover:bg-gray-100";

                if (status === "Present") {
                  dayClass = "bg-emerald-50 text-emerald-700";
                } else if (status === "Late") {
                  dayClass = "bg-amber-50 text-amber-700";
                } else if (status === "Absent") {
                  dayClass = "bg-red-50 text-red-600";
                } else if (status === "Leave") {
                  dayClass = "bg-violet-50 text-violet-700";
                } else if (status === "Weekend") {
                  dayClass = "text-gray-300";
                } else if (status === "Today") {
                  dayClass = "bg-[#FFF6D6] font-semibold text-gray-900";
                }

                return (
                  <div
                    key={formatDateKey(date)}
                    title={`${formatDisplayDate(date)}${
                      status ? ` · ${status}` : ""
                    }`}
                    className="flex h-10 items-center justify-center"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition ${dayClass} ${
                        isToday ? "ring-2 ring-[#FDC517] ring-offset-1" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="mb-3 text-xs font-medium text-gray-500">
                Attendance legend
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-3">
                <Legend color="bg-emerald-500" label="Present" />
                <Legend color="bg-amber-400" label="Late" />
                <Legend color="bg-red-400" label="Absent" />
                <Legend color="bg-violet-400" label="Leave" />
                <Legend color="bg-gray-300" label="Weekend" />
              </div>
            </div>
          </section>

          {/* Attendance history */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Attendance history
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Review your daily check-in and check-out records.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:border-gray-400"
                >
                  <option value="All">All records</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                  <option value="Weekend">Weekend</option>
                </select>

                <button
                  onClick={() => setShowAll((value) => !value)}
                  className="whitespace-nowrap text-xs font-medium text-gray-700 hover:text-black"
                >
                  {showAll ? "Show less" : "View all"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:px-6">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Check in
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Check out
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Hours
                    </th>
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:px-6">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {(showAll
                    ? displayedRecords
                    : displayedRecords.slice(0, 7)
                  ).map((record) => {
                    const date = new Date(`${record.date}T12:00:00`);

                    return (
                      <tr
                        key={record.date}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-4 sm:px-6">
                          <p className="text-sm font-medium text-gray-800">
                            {date.toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-400">
                            {date.toLocaleDateString("en-GB", {
                              weekday: "long",
                            })}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-sm tabular-nums text-gray-600">
                          {record.checkIn}
                        </td>

                        <td className="px-4 py-4 text-sm tabular-nums text-gray-600">
                          {record.checkOut}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {record.hours > 0
                            ? formatHours(record.hours)
                            : "--"}
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[record.status]}`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {displayedRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                          <CalendarDays size={18} />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-700">
                          No attendance records found
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Try selecting another status.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 sm:px-6">
              <p className="text-xs text-gray-400">
                Showing {Math.min(showAll ? displayedRecords.length : 7, displayedRecords.length)} of{" "}
                {displayedRecords.length} records
              </p>

              <button
                onClick={exportAttendance}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 transition hover:text-gray-900"
              >
                <Download size={14} />
                Download CSV
              </button>
            </div>
          </section>
        </div>

        {/* Attendance notice */}
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Info size={17} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-800">
              A quick reminder
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Always check in when you start work and check out when you finish.
              If you notice an incorrect attendance record, contact HR for
              assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
  trend: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          {trend}
        </span>
      </div>

      <p className="mt-5 text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
        {value}
      </p>
      <p className="mt-2 text-xs text-gray-400">{subtitle}</p>
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
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-[11px] text-gray-500">{label}</span>
    </div>
  );
}