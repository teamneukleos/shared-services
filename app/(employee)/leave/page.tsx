"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  CalendarCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Palmtree,
  HeartPulse,
  Baby,
  BriefcaseBusiness,
  X,
  FileText,
  ArrowUpRight,
  Info,
  CalendarClock,
} from "lucide-react";

type LeaveType =
  | "Annual Leave"
  | "Sick Leave"
  | "Compassionate Leave"
  | "Parental Leave"
  | "Unpaid Leave";

type LeaveStatus = "Pending" | "Approved" | "Rejected";

type LeaveRequest = {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
  reviewer?: string;
  comment?: string;
};

type LeaveBalance = {
  name: LeaveType;
  allowance: number;
  used: number;
  color: string;
  icon: typeof Palmtree;
};

// Hardcoded "today" anchor for the demo.
const TODAY = "2026-10-24"; // ← ADDED

const initialBalances: LeaveBalance[] = [
  {
    name: "Annual Leave",
    allowance: 20,
    used: 5,
    color: "#FDC517",
    icon: Palmtree,
  },
  {
    name: "Sick Leave",
    allowance: 10,
    used: 2,
    color: "#60A5FA",
    icon: HeartPulse,
  },
  {
    name: "Compassionate Leave",
    allowance: 5,
    used: 0,
    color: "#C084FC",
    icon: HeartPulse,
  },
  {
    name: "Parental Leave",
    allowance: 90,
    used: 0,
    color: "#34D399",
    icon: Baby,
  },
];

const initialRequests: LeaveRequest[] = [
  {
    id: "LV-2026-008",
    type: "Annual Leave",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    days: 5,
    reason: "Personal time off",
    status: "Approved",
    submittedAt: "2026-09-22",
    reviewer: "HR Team",
  },
  {
    id: "LV-2026-007",
    type: "Sick Leave",
    startDate: "2026-09-03",
    endDate: "2026-09-04",
    days: 2,
    reason: "Medical rest",
    status: "Approved",
    submittedAt: "2026-09-02",
    reviewer: "HR Team",
  },
  {
    id: "LV-2026-006",
    type: "Annual Leave",
    startDate: "2026-11-09",
    endDate: "2026-11-13",
    days: 5,
    reason: "Family visit",
    status: "Pending",
    submittedAt: "2026-10-20",
  },
  {
    id: "LV-2026-005",
    type: "Annual Leave",
    startDate: "2026-07-06",
    endDate: "2026-07-08",
    days: 3,
    reason: "Personal plans",
    status: "Rejected",
    submittedAt: "2026-06-24",
    reviewer: "Line Manager",
    comment:
      "Please select dates that do not overlap with the team delivery period.",
  },
];

const leaveOptions: {
  value: LeaveType;
  description: string;
  icon: typeof Palmtree;
}[] = [
  {
    value: "Annual Leave",
    description: "Holiday, rest or personal time off",
    icon: Palmtree,
  },
  {
    value: "Sick Leave",
    description: "Time off for illness or recovery",
    icon: HeartPulse,
  },
  {
    value: "Compassionate Leave",
    description: "Urgent family or personal circumstances",
    icon: HeartPulse,
  },
  {
    value: "Parental Leave",
    description: "Leave related to welcoming a child",
    icon: Baby,
  },
  {
    value: "Unpaid Leave",
    description: "Time off outside your paid leave balance",
    icon: BriefcaseBusiness,
  },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-[#E4E4E4] bg-white px-4 py-3 text-sm text-[#202020] outline-none transition placeholder:text-[#999999] focus:border-[#FDC517]";

function formatDate(value: string) {
  if (!value) return "—";

  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getWorkingDays(start: string, end: string) {
  if (!start || !end || end < start) return 0;

  const current = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  let days = 0;

  while (current <= last) {
    const day = current.getDay();

    if (day !== 0 && day !== 6) {
      days += 1;
    }

    current.setDate(current.getDate() + 1);
  }

  return days;
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const styles: Record<LeaveStatus, string> = {
    Approved:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Rejected: "border-red-200 bg-red-50 text-red-700",
  };

  const Icon =
    status === "Approved"
      ? CheckCircle2
      : status === "Rejected"
        ? XCircle
        : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
}

export default function MyLeavePage() {
  const [balances] = useState(initialBalances);
  const [requests, setRequests] = useState(initialRequests);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"requests" | "calendar">(
    "requests"
  );
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequest | null>(null);

  // ← CHANGED: hardcoded anchor month instead of new Date()
  const [calendarMonth, setCalendarMonth] = useState(() => ({
    year: 2026,
    month: 9, // October (0-indexed)
  }));

  const [leaveType, setLeaveType] = useState<LeaveType>("Annual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [handover, setHandover] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const requestedDays = getWorkingDays(startDate, endDate);

  const annualBalance = balances.find(
    (balance) => balance.name === "Annual Leave"
  );

  const totalPending = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const totalApproved = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const filteredRequests = useMemo(() => {
    return requests.filter(
      (request) =>
        statusFilter === "All" || request.status === statusFilter
    );
  }, [requests, statusFilter]);

  const calendarData = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return {
      firstDay,
      daysInMonth,
      year,
      month,
    };
  }, [calendarMonth]);

  function resetForm() {
    setLeaveType("Annual Leave");
    setStartDate("");
    setEndDate("");
    setReason("");
    setHandover("");
    setError("");
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!startDate || !endDate || !reason.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (startDate < TODAY) {
      setError("The start date cannot be in the past.");
      return;
    }

    if (endDate < startDate) {
      setError("The end date cannot be before the start date.");
      return;
    }

    if (requestedDays < 1) {
      setError("Please select at least one working day.");
      return;
    }

    const overlap = requests.some((request) => {
      if (request.status === "Rejected") return false;

      return (
        startDate <= request.endDate && endDate >= request.startDate
      );
    });

    if (overlap) {
      setError(
        "These dates overlap with an existing pending or approved leave request."
      );
      return;
    }

    if (leaveType === "Annual Leave" && annualBalance) {
      const remaining = annualBalance.allowance - annualBalance.used;

      if (requestedDays > remaining) {
        setError(
          `You have ${remaining} annual leave day(s) remaining. Please select fewer days or choose another leave type.`
        );
        return;
      }
    }

    const nextRequestNumber =
      Math.max(
        0,
        ...requests.map((request) => {
          const match = request.id.match(/LV-\d{4}-(\d+)/);
          return match ? Number(match[1]) : 0;
        })
      ) + 1;

    // ← CHANGED: year pulled from TODAY instead of new Date()
    const newRequest: LeaveRequest = {
      id: `LV-${TODAY.slice(0, 4)}-${String(
        nextRequestNumber
      ).padStart(3, "0")}`,
      type: leaveType,
      startDate,
      endDate,
      days: requestedDays,
      reason: reason.trim(),
      status: "Pending",
      submittedAt: TODAY,
      comment: handover.trim()
        ? `Handover: ${handover.trim()}`
        : undefined,
    };

    setRequests((current) => [newRequest, ...current]);
    setSuccessMessage(
      "Your leave request has been submitted and is awaiting review."
    );
    setShowForm(false);
    setActiveTab("requests");
    setStatusFilter("All");
    resetForm();
  }

  function changeMonth(direction: number) {
    // ← CHANGED: operate on the plain {year, month} object
    setCalendarMonth((current) => {
      const date = new Date(
        current.year,
        current.month + direction,
        1
      );
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function getRequestsForDay(day: number) {
    const date = `${calendarData.year}-${String(
      calendarData.month + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return requests.filter(
      (request) =>
        request.status === "Approved" &&
        date >= request.startDate &&
        date <= request.endDate
    );
  }

  const nextApprovedLeave = requests
    .filter(
      (request) =>
        request.status === "Approved" && request.startDate >= TODAY
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  return (
    <div className="min-h-screen bg-[#F7F7F8] p-4 text-[#202020] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px] space-y-7">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-[#888888]">
              <span>Employee Portal</span>
              <span>/</span>
              <span className="text-[#444444]">My Leave</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              My Leave
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#777777]">
              Manage your time off, check your leave balance and keep track
              of your requests.
            </p>
          </div>

          <button
            onClick={() => {
              setSuccessMessage("");
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#FDC517] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e8b600]"
          >
            <Plus size={18} />
            Apply for leave
          </button>
        </div>

        {/* Feedback */}
        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">{successMessage}</div>
            <button
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss message"
              className="rounded-md p-1 transition hover:bg-emerald-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Overview cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#777777]">
                Annual leave remaining
              </span>
              <span className="rounded-xl bg-[#FDC517]/15 p-2 text-[#8A6A00]">
                <Palmtree size={19} />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold">
                {annualBalance
                  ? annualBalance.allowance - annualBalance.used
                  : 0}
              </span>
              <span className="text-sm text-[#888888]">days</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#EEEEEE]">
              <div
                className="h-full rounded-full bg-[#FDC517]"
                style={{
                  width: `${
                    annualBalance
                      ? (annualBalance.used / annualBalance.allowance) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-[#888888]">
              {annualBalance?.used ?? 0} used of{" "}
              {annualBalance?.allowance ?? 0} allocated days
            </p>
          </div>

          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#777777]">
                Pending requests
              </span>
              <span className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Clock3 size={19} />
              </span>
            </div>
            <div className="mt-4 text-3xl font-semibold">{totalPending}</div>
            <p className="mt-2 text-xs text-[#888888]">
              Waiting for a decision
            </p>
          </div>

          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#777777]">
                Approved requests
              </span>
              <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 size={19} />
              </span>
            </div>
            <div className="mt-4 text-3xl font-semibold">{totalApproved}</div>
            <p className="mt-2 text-xs text-[#888888]">
              Across your leave history
            </p>
          </div>

          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#777777]">
                Next approved leave
              </span>
              <span className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <CalendarCheck size={19} />
              </span>
            </div>
            <div className="mt-4 text-xl font-semibold">
              {nextApprovedLeave
                ? formatDate(nextApprovedLeave.startDate)
                : "None scheduled"}
            </div>
            <p className="mt-2 text-xs text-[#888888]">
              Based on approved requests
            </p>
          </div>
        </div>

        {/* Leave balances */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Leave balances</h2>
              <p className="mt-1 text-sm text-[#777777]">
                Your current allocation by leave type.
              </p>
            </div>
            <span className="hidden items-center gap-1.5 text-xs text-[#888888] sm:flex">
              <Info size={14} />
              Sample policy balances
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {balances.map((balance) => {
              const Icon = balance.icon;
              const remaining = Math.max(
                0,
                balance.allowance - balance.used
              );

              return (
                <div
                  key={balance.name}
                  className="rounded-2xl border border-[#EAEAEA] bg-white p-5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-xl p-2.5"
                      style={{
                        color: balance.color,
                        backgroundColor: `${balance.color}15`,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{balance.name}</p>
                      <p className="mt-1 text-xs text-[#888888]">
                        {balance.allowance} days allocated
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-semibold">
                        {remaining}
                      </span>
                      <span className="ml-1.5 text-xs text-[#888888]">
                        remaining
                      </span>
                    </div>
                    <span className="text-xs text-[#888888]">
                      {balance.used} used
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EEEEEE]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${
                          balance.allowance > 0
                            ? Math.min(
                                100,
                                (balance.used / balance.allowance) * 100
                              )
                            : 0
                        }%`,
                        backgroundColor: balance.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Requests and calendar */}
        <section className="overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white">
          <div className="flex flex-col gap-4 border-b border-[#EAEAEA] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">Leave activity</h2>
              <p className="mt-1 text-sm text-[#777777]">
                View your requests and approved time off.
              </p>
            </div>

            <div className="flex w-fit rounded-xl border border-[#EAEAEA] bg-[#F7F7F8] p-1">
              <button
                onClick={() => setActiveTab("requests")}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                  activeTab === "requests"
                    ? "bg-white text-[#202020] shadow-sm"
                    : "text-[#777777] hover:text-[#202020]"
                }`}
              >
                My requests
              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                  activeTab === "calendar"
                    ? "bg-white text-[#202020] shadow-sm"
                    : "text-[#777777] hover:text-[#202020]"
                }`}
              >
                Leave calendar
              </button>
            </div>
          </div>

          {activeTab === "requests" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEAEA] px-5 py-4 sm:px-6">
                <span className="text-sm text-[#777777]">
                  {filteredRequests.length} request
                  {filteredRequests.length !== 1 ? "s" : ""}
                </span>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-[#E4E4E4] bg-white px-3 py-2 text-sm text-[#444444] outline-none focus:border-[#FDC517]"
                  aria-label="Filter requests by status"
                >
                  <option value="All">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <CalendarDays
                    size={30}
                    className="mx-auto text-[#BBBBBB]"
                  />
                  <h3 className="mt-3 font-medium">No requests found</h3>
                  <p className="mt-1 text-sm text-[#888888]">
                    Try another filter or submit a new leave request.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-[#FAFAFA] text-xs uppercase tracking-wider text-[#888888]">
                      <tr>
                        <th className="px-6 py-4 font-medium">Leave type</th>
                        <th className="px-6 py-4 font-medium">Dates</th>
                        <th className="px-6 py-4 font-medium">Days</th>
                        <th className="px-6 py-4 font-medium">Submitted</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEEEE]">
                      {filteredRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="transition hover:bg-[#FAFAFA]"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">
                              {request.type}
                            </p>
                            <p className="mt-1 text-xs text-[#888888]">
                              {request.id}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#444444]">
                            <div>{formatDate(request.startDate)}</div>
                            <div className="mt-1 text-xs text-[#888888]">
                              to {formatDate(request.endDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#444444]">
                            {request.days}{" "}
                            {request.days === 1 ? "day" : "days"}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#777777]">
                            {formatDate(request.submittedAt)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="inline-flex items-center gap-1.5 text-sm text-[#777777] transition hover:text-[#8A6A00]"
                            >
                              View
                              <ArrowUpRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="p-5 sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-3">
                <button
                  onClick={() => changeMonth(-1)}
                  className="rounded-lg border border-[#E4E4E4] p-2 text-[#777777] transition hover:bg-[#F7F7F8] hover:text-[#202020]"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="text-center">
                  <h3 className="font-semibold">
                    {new Date(
                      calendarMonth.year,
                      calendarMonth.month,
                      1
                    ).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="mt-1 text-xs text-[#888888]">
                    Approved leave dates
                  </p>
                </div>

                <button
                  onClick={() => changeMonth(1)}
                  className="rounded-lg border border-[#E4E4E4] p-2 text-[#777777] transition hover:bg-[#F7F7F8] hover:text-[#202020]"
                  aria-label="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-2 text-center text-[10px] font-medium uppercase tracking-wide text-[#888888] sm:text-xs"
                    >
                      {day}
                    </div>
                  )
                )}

                {Array.from(
                  { length: calendarData.firstDay },
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="min-h-16 sm:min-h-24"
                    />
                  )
                )}

                {Array.from(
                  { length: calendarData.daysInMonth },
                  (_, index) => {
                    const day = index + 1;
                    const dayRequests = getRequestsForDay(day);
                    const date = `${calendarData.year}-${String(
                      calendarData.month + 1
                    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isToday = TODAY === date;

                    return (
                      <div
                        key={day}
                        className={`min-h-16 rounded-lg border p-1.5 sm:min-h-24 sm:p-2 ${
                          isToday
                            ? "border-[#FDC517]/70 bg-[#FFF9E5]"
                            : "border-[#EEEEEE] bg-white"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                            isToday
                              ? "bg-[#FDC517] font-semibold text-black"
                              : "text-[#555555]"
                          }`}
                        >
                          {day}
                        </span>

                        <div className="mt-1 space-y-1">
                          {dayRequests.slice(0, 2).map((request) => (
                            <button
                              key={request.id}
                              onClick={() => setSelectedRequest(request)}
                              title={`${request.type}: ${request.reason}`}
                              className="block w-full truncate rounded bg-emerald-50 px-1 py-1 text-left text-[9px] text-emerald-700 sm:text-[10px]"
                            >
                              {request.type}
                            </button>
                          ))}
                          {dayRequests.length > 2 && (
                            <p className="text-[9px] text-[#888888]">
                              +{dayRequests.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-[#777777]">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                Approved leave
                <span className="ml-auto text-right">
                  Pending requests are not shown on this calendar.
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Policy note */}
        <div className="flex items-start gap-3 rounded-xl border border-[#EAEAEA] bg-white p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-[#9A7600]" />
          <div>
            <p className="text-sm font-medium text-[#333333]">
              Before submitting a request
            </p>
            <p className="mt-1 text-xs leading-5 text-[#777777]">
              Leave balances and requests on this page are sample data.
              Working days exclude weekends, but public holidays and company
              leave policies will need to be configured in the system. Your
              request will appear as pending until it is reviewed.
            </p>
          </div>
        </div>
      </div>

      {/* Apply for leave modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#EEEEEE] p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-semibold">Apply for leave</h2>
                <p className="mt-1 text-sm text-[#777777]">
                  Enter the details of your time off.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-[#777777] transition hover:bg-[#F5F5F5] hover:text-[#202020]"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitRequest} className="space-y-5 p-5 sm:p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-[#444444]">
                  Leave type <span className="text-[#9A7600]">*</span>
                </label>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {leaveOptions.map((option) => {
                    const Icon = option.icon;
                    const selected = leaveType === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLeaveType(option.value)}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-[#FDC517] bg-[#FFFBEA]"
                            : "border-[#EAEAEA] bg-white hover:border-[#D5D5D5] hover:bg-[#FAFAFA]"
                        }`}
                      >
                        <span
                          className={`rounded-lg p-2 ${
                            selected
                              ? "bg-[#FDC517]/20 text-[#8A6A00]"
                              : "bg-[#F5F5F5] text-[#777777]"
                          }`}
                        >
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-[#333333]">
                            {option.value}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[#777777]">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="leave-start"
                    className="text-sm font-medium text-[#444444]"
                  >
                    Start date <span className="text-[#9A7600]">*</span>
                  </label>
                  <input
                    id="leave-start"
                    type="date"
                    min={TODAY}
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                      if (endDate && event.target.value > endDate) {
                        setEndDate("");
                      }
                    }}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="leave-end"
                    className="text-sm font-medium text-[#444444]"
                  >
                    End date <span className="text-[#9A7600]">*</span>
                  </label>
                  <input
                    id="leave-end"
                    type="date"
                    min={startDate || TODAY}
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
                <div className="flex items-center gap-3">
                  <CalendarClock size={20} className="text-[#9A7600]" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="mt-1 text-xs text-[#777777]">
                      Weekends are excluded from this estimate.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-semibold">
                    {requestedDays}
                  </span>
                  <p className="text-xs text-[#777777]">
                    {requestedDays === 1 ? "working day" : "working days"}
                  </p>
                </div>
              </div>

              {leaveType === "Annual Leave" && annualBalance && (
                <p className="text-xs text-[#777777]">
                  Annual leave available:{" "}
                  <span className="font-medium text-[#333333]">
                    {annualBalance.allowance - annualBalance.used} days
                  </span>
                </p>
              )}

              <div>
                <label
                  htmlFor="leave-reason"
                  className="text-sm font-medium text-[#444444]"
                >
                  Reason for leave{" "}
                  <span className="text-[#9A7600]">*</span>
                </label>
                <textarea
                  id="leave-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Briefly explain why you need the time off..."
                  rows={3}
                  maxLength={500}
                  className={`${inputClass} resize-y`}
                  required
                />
                <p className="mt-1 text-right text-xs text-[#888888]">
                  {reason.length}/500
                </p>
              </div>

              <div>
                <label
                  htmlFor="leave-handover"
                  className="text-sm font-medium text-[#444444]"
                >
                  Handover notes{" "}
                  <span className="text-xs font-normal text-[#888888]">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="leave-handover"
                  value={handover}
                  onChange={(event) => setHandover(event.target.value)}
                  placeholder="Who will handle your tasks while you're away?"
                  rows={2}
                  maxLength={500}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-[#F7F7F8] p-3 text-xs leading-5 text-[#666666]">
                <FileText size={16} className="mt-0.5 shrink-0 text-[#777777]" />
                Your request will be submitted for review. The assigned
                approver will be determined by the organisation&apos;s approval
                workflow.
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#EEEEEE] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-[#E4E4E4] px-5 py-3 text-sm font-medium text-[#444444] transition hover:bg-[#F7F7F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e8b600]"
                >
                  <Plus size={17} />
                  Submit request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request details modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#EEEEEE] p-5">
              <div>
                <p className="text-xs text-[#888888]">
                  {selectedRequest.id}
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {selectedRequest.type}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-[#777777] transition hover:bg-[#F5F5F5] hover:text-[#202020]"
                aria-label="Close request details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-xs text-[#888888]">Current status</p>
                <StatusBadge status={selectedRequest.status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
                  <p className="text-xs text-[#888888]">Start date</p>
                  <p className="mt-2 text-sm font-medium">
                    {formatDate(selectedRequest.startDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
                  <p className="text-xs text-[#888888]">End date</p>
                  <p className="mt-2 text-sm font-medium">
                    {formatDate(selectedRequest.endDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
                  <p className="text-xs text-[#888888]">Duration</p>
                  <p className="mt-2 text-sm font-medium">
                    {selectedRequest.days}{" "}
                    {selectedRequest.days === 1 ? "day" : "days"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
                  <p className="text-xs text-[#888888]">Submitted</p>
                  <p className="mt-2 text-sm font-medium">
                    {formatDate(selectedRequest.submittedAt)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#888888]">Reason</p>
                <p className="mt-2 text-sm leading-6 text-[#444444]">
                  {selectedRequest.reason}
                </p>
              </div>

              {selectedRequest.reviewer && (
                <div>
                  <p className="text-xs text-[#888888]">Reviewed by</p>
                  <p className="mt-2 text-sm text-[#444444]">
                    {selectedRequest.reviewer}
                  </p>
                </div>
              )}

              {selectedRequest.comment && (
                <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
                  <p className="text-xs font-medium text-[#666666]">
                    Review notes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#444444]">
                    {selectedRequest.comment}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full rounded-xl border border-[#E4E4E4] px-4 py-3 text-sm font-medium text-[#444444] transition hover:bg-[#F7F7F8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}