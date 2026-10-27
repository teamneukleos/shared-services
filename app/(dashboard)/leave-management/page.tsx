"use client";

import { useMemo, useState } from "react";
import { EmployeeAvatar } from "@/components/employee-avatar"; // ← ADDED
import {
  CalendarDays,
  CalendarCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  UsersRound,
  Search,
  Download,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
  UserRound,
  UserCheck,
  ShieldCheck,
  FileText,
  Filter,
  X,
  MoreHorizontal,
  RotateCcw,
  CalendarRange,
  CircleAlert,
  Wallet,
} from "lucide-react";

type LeaveStatus =
  | "Pending manager"
  | "Pending HR"
  | "Approved"
  | "Rejected"
  | "Cancelled";

type LeaveRequest = {
  id: number;
  employee: string;
  initials: string;
  avatar: string | null; // ← ADDED
  department: string;
  role: string;
  manager: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  submittedDate: string;
  reason: string;
  status: LeaveStatus;
  managerComment?: string;
  hrComment?: string;
};

const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 1,
    employee: "Amara Okafor",
    initials: "AO",
    avatar: "https://i.pravatar.cc/120?img=47", // ← ADDED
    department: "Marketing",
    role: "Marketing Executive",
    manager: "Motola Olusoga",
    leaveType: "Annual leave",
    startDate: "2026-11-02",
    endDate: "2026-11-06",
    days: 5,
    submittedDate: "2026-10-22",
    reason: "Planned personal time off.",
    status: "Pending HR",
    managerComment: "Approved. Team coverage has been arranged.",
  },
  {
    id: 2,
    employee: "Daniel Adeyemi",
    initials: "DA",
    avatar: "https://i.pravatar.cc/120?img=12", // ← ADDED
    department: "Engineering",
    role: "Frontend Engineer",
    manager: "Oluwatobi James",
    leaveType: "Annual leave",
    startDate: "2026-11-09",
    endDate: "2026-11-11",
    days: 3,
    submittedDate: "2026-10-23",
    reason: "Family commitments.",
    status: "Pending manager",
  },
  {
    id: 3,
    employee: "Grace Eze",
    initials: "GE",
    avatar: "https://i.pravatar.cc/120?img=44", // ← ADDED
    department: "Human Resources",
    role: "HR Executive",
    manager: "HR Admin",
    leaveType: "Sick leave",
    startDate: "2026-10-26",
    endDate: "2026-10-27",
    days: 2,
    submittedDate: "2026-10-23",
    reason: "Medical rest and recovery.",
    status: "Pending manager",
  },
  {
    id: 4,
    employee: "Sarah Williams",
    initials: "SW",
    avatar: "https://i.pravatar.cc/120?img=45", // ← ADDED
    department: "Finance",
    role: "Accountant",
    manager: "Chinedu Okafor",
    leaveType: "Annual leave",
    startDate: "2026-10-28",
    endDate: "2026-10-30",
    days: 3,
    submittedDate: "2026-10-19",
    reason: "Personal travel.",
    status: "Approved",
    managerComment: "Approved. Work has been handed over.",
    hrComment: "Final approval granted.",
  },
  {
    id: 5,
    employee: "Tunde Bello",
    initials: "TB",
    avatar: "https://i.pravatar.cc/120?img=13", // ← ADDED
    department: "Engineering",
    role: "Backend Engineer",
    manager: "Oluwatobi James",
    leaveType: "Casual leave",
    startDate: "2026-11-13",
    endDate: "2026-11-13",
    days: 1,
    submittedDate: "2026-10-24",
    reason: "Personal appointment.",
    status: "Pending HR",
    managerComment: "Approved by line manager.",
  },
  {
    id: 6,
    employee: "Michael James",
    initials: "MJ",
    avatar: "https://i.pravatar.cc/120?img=68", // ← ADDED
    department: "Design",
    role: "Product Designer",
    manager: "Motola Olusoga",
    leaveType: "Annual leave",
    startDate: "2026-10-29",
    endDate: "2026-11-02",
    days: 3,
    submittedDate: "2026-10-20",
    reason: "Pre-planned family trip.",
    status: "Rejected",
    managerComment: "Noted.",
    hrComment: "Insufficient team coverage for the requested dates.",
  },
  {
    id: 7,
    employee: "Esther Adebayo",
    initials: "EA",
    avatar: "https://i.pravatar.cc/120?img=49", // ← ADDED
    department: "Marketing",
    role: "Content Strategist",
    manager: "Motola Olusoga",
    leaveType: "Casual leave",
    startDate: "2026-11-05",
    endDate: "2026-11-05",
    days: 1,
    submittedDate: "2026-10-24",
    reason: "Personal matters.",
    status: "Pending manager",
  },
];

const LEAVE_BALANCES = [
  {
    type: "Annual leave",
    used: 8,
    total: 20,
    description: "12 days remaining",
    color: "bg-[#FDC517]",
  },
  {
    type: "Sick leave",
    used: 2,
    total: 10,
    description: "8 days remaining",
    color: "bg-[#86B89B]",
  },
  {
    type: "Casual leave",
    used: 3,
    total: 7,
    description: "4 days remaining",
    color: "bg-[#8DA8D7]",
  },
];

const STATUS_STYLES: Record<LeaveStatus, string> = {
  "Pending manager": "bg-amber-50 text-amber-800",
  "Pending HR": "bg-blue-50 text-blue-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

const TABS = [
  "All requests",
  "Pending manager",
  "Pending HR",
  "Approved",
  "Rejected",
] as const;

type Tab = (typeof TABS)[number];

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function downloadCsv(requests: LeaveRequest[]) {
  const headers = [
    "Employee",
    "Department",
    "Leave type",
    "Start date",
    "End date",
    "Days",
    "Line manager",
    "Status",
    "Submitted date",
  ];

  const rows = requests.map((request) => [
    request.employee,
    request.department,
    request.leaveType,
    request.startDate,
    request.endDate,
    request.days,
    request.manager,
    request.status,
    request.submittedDate,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `neukleos-leave-requests-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  link.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  title,
  value,
  note,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: number | string;
  note: string;
  icon: typeof CalendarDays;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#EAEAE7] bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#777873]">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#191919] sm:text-[30px]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon size={19} className={iconColor} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#858680]">{note}</p>
    </div>
  );
}

export default function LeaveManagementPage() {
  const [requests, setRequests] =
    useState<LeaveRequest[]>(INITIAL_REQUESTS);

  const [activeTab, setActiveTab] = useState<Tab>("All requests");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [leaveType, setLeaveType] = useState("All leave types");
  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequest | null>(null);

  const departments = useMemo(
    () => [
      "All departments",
      ...Array.from(new Set(requests.map((item) => item.department))).sort(),
    ],
    [requests]
  );

  const leaveTypes = useMemo(
    () => [
      "All leave types",
      ...Array.from(new Set(requests.map((item) => item.leaveType))).sort(),
    ],
    [requests]
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const query = search.toLowerCase();

      const matchesSearch =
        request.employee.toLowerCase().includes(query) ||
        request.department.toLowerCase().includes(query) ||
        request.leaveType.toLowerCase().includes(query) ||
        request.manager.toLowerCase().includes(query);

      const matchesDepartment =
        department === "All departments" ||
        request.department === department;

      const matchesLeaveType =
        leaveType === "All leave types" ||
        request.leaveType === leaveType;

      const matchesTab =
        activeTab === "All requests" ||
        request.status === activeTab;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesLeaveType &&
        matchesTab
      );
    });
  }, [requests, search, department, leaveType, activeTab]);

  const pendingManagerCount = requests.filter(
    (item) => item.status === "Pending manager"
  ).length;

  const pendingHRCount = requests.filter(
    (item) => item.status === "Pending HR"
  ).length;

  const approvedCount = requests.filter(
    (item) => item.status === "Approved"
  ).length;

  const upcomingRequests = requests
    .filter(
      (item) =>
        item.status === "Approved" &&
        item.startDate >= "2026-10-24"
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);

  function resetFilters() {
    setSearch("");
    setDepartment("All departments");
    setLeaveType("All leave types");
    setActiveTab("All requests");
  }

  function updateRequest(
    id: number,
    status: LeaveStatus,
    comment: string
  ) {
    setRequests((current) =>
      current.map((request) => {
        if (request.id !== id) return request;

        if (status === "Pending HR") {
          return {
            ...request,
            status,
            managerComment: comment || "Approved by line manager.",
          };
        }

        if (status === "Approved" || status === "Rejected") {
          return {
            ...request,
            status,
            hrComment:
              comment ||
              (status === "Approved"
                ? "Final HR approval granted."
                : "Request rejected by HR."),
          };
        }

        return { ...request, status };
      })
    );

    setSelectedRequest((current) => {
      if (!current || current.id !== id) return current;

      if (status === "Pending HR") {
        return {
          ...current,
          status,
          managerComment: comment || "Approved by line manager.",
        };
      }

      if (status === "Approved" || status === "Rejected") {
        return {
          ...current,
          status,
          hrComment:
            comment ||
            (status === "Approved"
              ? "Final HR approval granted."
              : "Request rejected by HR."),
        };
      }

      return { ...current, status };
    });
  }

  return (
    <div className="min-w-0 space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#898A84]">
            <span>HR Management</span>
            <span>/</span>
            <span className="text-[#343530]">Leave Management</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#191919] sm:text-[28px]">
            Leave Management
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#777873]">
            Manage employee leave requests, balances and approvals across
            your organisation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadCsv(filteredRequests)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#E5E5E0] bg-white px-4 text-sm font-medium text-[#33342F] transition hover:bg-[#F7F7F4] sm:w-auto"
        >
          <Download size={16} />
          Export report
        </button>
      </div>

      {/* Approval pipeline */}
      <section className="rounded-xl border border-[#EAEAE7] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#20211D]">
              Approval pipeline
            </h2>
            <p className="mt-1 text-sm text-[#858680]">
              Every request passes through the line manager before HR.
            </p>
          </div>

          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#F8F4E4] px-2.5 py-1 text-xs font-medium text-[#806300] sm:mt-0">
            <ShieldCheck size={13} />
            Two-step approval
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
          <div className="flex items-center gap-3 rounded-xl border border-[#EEEEEA] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F2F2EF]">
              <UserRound size={19} className="text-[#55564F]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#292A25]">
                Employee request
              </p>
              <p className="mt-1 text-xs text-[#858680]">
                {requests.length} total requests
              </p>
            </div>
          </div>

          <div className="hidden justify-center text-[#A1A29B] md:flex">
            <ArrowRight size={18} />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <UserCheck size={19} className="text-amber-800" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#292A25]">
                Line manager
              </p>
              <p className="mt-1 text-xs text-[#8A6A22]">
                {pendingManagerCount} awaiting review
              </p>
            </div>
          </div>

          <div className="hidden justify-center text-[#A1A29B] md:flex">
            <ArrowRight size={18} />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <ShieldCheck size={19} className="text-blue-700" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#292A25]">
                HR final review
              </p>
              <p className="mt-1 text-xs text-blue-700">
                {pendingHRCount} awaiting decision
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total requests"
          value={requests.length}
          note="All leave requests in this view"
          icon={FileText}
          iconBg="bg-[#F0F0ED]"
          iconColor="text-[#484943]"
        />

        <StatCard
          title="Awaiting manager"
          value={pendingManagerCount}
          note="First-stage approval required"
          icon={Clock3}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
        />

        <StatCard
          title="Awaiting HR"
          value={pendingHRCount}
          note="Manager-approved requests"
          icon={ShieldCheck}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
        />

        <StatCard
          title="Approved requests"
          value={approvedCount}
          note="Final approval completed"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
      </div>

      {/* Leave balances */}
      <section className="rounded-xl border border-[#EAEAE7] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#20211D]">
              Leave balance overview
            </h2>
            <p className="mt-1 text-sm text-[#858680]">
              Illustrative leave balances for the employee account.
            </p>
          </div>

          <button
            type="button"
            className="mt-2 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#5D4B00] hover:text-[#29230C] sm:mt-0"
            onClick={() =>
              setSelectedRequest({
                id: -1,
                employee: "Employee leave balance",
                initials: "EL",
                avatar: null, // ← ADDED
                department: "All departments",
                role: "Leave summary",
                manager: "—",
                leaveType: "Annual leave",
                startDate: "",
                endDate: "",
                days: 0,
                submittedDate: "",
                reason:
                  "Detailed leave balances will be connected to employee records and leave policies.",
                status: "Approved",
              })
            }
          >
            <Wallet size={16} />
            View details
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {LEAVE_BALANCES.map((balance) => {
            const percentage = Math.min(
              100,
              Math.round((balance.used / balance.total) * 100)
            );

            return (
              <div key={balance.type} className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#343530]">
                    {balance.type}
                  </span>
                  <span className="text-xs text-[#777873]">
                    {balance.used} of {balance.total} days used
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0F0EC]">
                  <div
                    className={`h-full rounded-full ${balance.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-[#858680]">
                  {balance.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main requests table */}
      <section className="overflow-hidden rounded-xl border border-[#EAEAE7] bg-white">
        <div className="border-b border-[#EEEEEA] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#20211D]">
                Leave requests
              </h2>
              <p className="mt-1 text-sm text-[#858680]">
                Track request status and review the approval history.
              </p>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-lg px-3 text-sm font-medium text-[#62635D] transition hover:bg-[#F5F5F2]"
            >
              <RotateCcw size={14} />
              Reset filters
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex gap-5 overflow-x-auto border-b border-[#EEEEEA]">
            {TABS.map((tab) => {
              const count =
                tab === "All requests"
                  ? requests.length
                  : requests.filter((item) => item.status === tab).length;

              return (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm transition ${
                    activeTab === tab
                      ? "border-[#FDC517] font-semibold text-[#22231F]"
                      : "border-transparent text-[#858680] hover:text-[#33342F]"
                  }`}
                >
                  {tab}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs ${
                      activeTab === tab
                        ? "bg-[#FDC517]/20 text-[#705600]"
                        : "bg-[#F2F2EF] text-[#777873]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_200px_190px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969790]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee, manager or leave type..."
                className="h-11 w-full rounded-lg border border-[#E5E5E0] bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-[#A0A099] focus:border-[#D2A500]"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#898A84]"
              />
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E0] bg-white pl-9 pr-9 text-sm text-[#454640] outline-none focus:border-[#D2A500]"
                aria-label="Filter by department"
              >
                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#898A84]"
              />
            </div>

            <div className="relative">
              <select
                value={leaveType}
                onChange={(event) => setLeaveType(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E0] bg-white px-3 pr-9 text-sm text-[#454640] outline-none focus:border-[#D2A500]"
                aria-label="Filter by leave type"
              >
                {leaveTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#898A84]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="bg-[#FAFAF8]">
                {[
                  "Employee",
                  "Leave type",
                  "Duration",
                  "Days",
                  "Line manager",
                  "Status",
                  "",
                ].map((heading, index) => (
                  <th
                    key={`${heading}-${index}`}
                    className="whitespace-nowrap border-b border-[#EEEEEA] px-5 py-3.5 text-xs font-medium text-[#858680]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F0F0EC]">
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="transition hover:bg-[#FCFCFA]"
                >
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center gap-3 text-left"
                    >
                      {/* ← CHANGED: initials span → EmployeeAvatar */}
                      <EmployeeAvatar
                        name={request.employee}
                        src={request.avatar}
                        size="md"
                      />
                      <span>
                        <span className="block whitespace-nowrap text-sm font-medium text-[#292A25]">
                          {request.employee}
                        </span>
                        <span className="mt-1 block whitespace-nowrap text-xs text-[#898A84]">
                          {request.department}
                        </span>
                      </span>
                    </button>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-sm font-medium text-[#454640]">
                      {request.leaveType}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-sm text-[#454640]">
                      {formatDate(request.startDate)}
                    </span>
                    <span className="mt-1 block text-xs text-[#898A84]">
                      to {formatDate(request.endDate)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#454640]">
                    {request.days} {request.days === 1 ? "day" : "days"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#62635D]">
                    {request.manager}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#777873] transition hover:bg-[#F0F0ED] hover:text-[#242520]"
                      aria-label={`View ${request.employee} leave request`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F5F2]">
                      <Search size={20} className="text-[#898A84]" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#343530]">
                      No leave requests found
                    </p>
                    <p className="mt-1 text-sm text-[#858680]">
                      Try another search or adjust your filters.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 text-sm font-medium text-[#6D5700] underline underline-offset-4"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#EEEEEA] px-4 py-4 text-xs text-[#858680] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span>
            Showing {filteredRequests.length} of {requests.length} requests
          </span>
          <span>Approval order: Line manager → HR</span>
        </div>
      </section>

      {/* Upcoming approved leave */}
      <section className="rounded-xl border border-[#EAEAE7] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#20211D]">
              Upcoming approved leave
            </h2>
            <p className="mt-1 text-sm text-[#858680]">
              A quick view of upcoming employee absences.
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8F4E4]">
            <CalendarRange size={19} className="text-[#8A6A00]" />
          </div>
        </div>

        {upcomingRequests.length > 0 ? (
          <div className="mt-4 divide-y divide-[#F0F0EC]">
            {upcomingRequests.map((request) => (
              <button
                type="button"
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className="flex w-full flex-col gap-3 py-4 text-left transition hover:bg-[#FCFCFA] sm:flex-row sm:items-center sm:justify-between sm:px-2"
              >
                <span className="flex items-center gap-3">
                  {/* ← CHANGED: initials span → EmployeeAvatar */}
                  <EmployeeAvatar
                    name={request.employee}
                    src={request.avatar}
                    size="md"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[#292A25]">
                      {request.employee}
                    </span>
                    <span className="mt-1 block text-xs text-[#898A84]">
                      {request.leaveType} · {request.department}
                    </span>
                  </span>
                </span>

                <span className="flex flex-wrap items-center gap-2 pl-[52px] sm:pl-0">
                  <span className="text-sm text-[#62635D]">
                    {formatDate(request.startDate)}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Approved
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-[#FAFAF8] p-4 text-sm text-[#858680]">
            No upcoming approved leave in the current sample data.
          </p>
        )}
      </section>

      {/* Request details and approval panel */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-detail-title"
            className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-xl sm:rounded-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8F4E4]">
                  <CalendarCheck size={20} className="text-[#8A6A00]" />
                </span>
                <div>
                  <p className="text-xs font-medium text-[#898A84]">
                    Leave request
                  </p>
                  <h2
                    id="leave-detail-title"
                    className="mt-1 text-xl font-semibold text-[#20211D]"
                  >
                    {selectedRequest.employee}
                  </h2>
                  <p className="mt-1 text-sm text-[#777873]">
                    {selectedRequest.department} · {selectedRequest.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-[#F3F3F0]"
                aria-label="Close leave request"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[selectedRequest.status]}`}
              >
                {selectedRequest.status}
              </span>
              <span className="rounded-full bg-[#F3F3F0] px-2.5 py-1 text-xs text-[#62635D]">
                {selectedRequest.leaveType}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F8F8F5] p-4">
                <p className="text-xs text-[#858680]">Start date</p>
                <p className="mt-1 text-sm font-medium text-[#292A25]">
                  {formatDate(selectedRequest.startDate)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F8F5] p-4">
                <p className="text-xs text-[#858680]">End date</p>
                <p className="mt-1 text-sm font-medium text-[#292A25]">
                  {formatDate(selectedRequest.endDate)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F8F5] p-4">
                <p className="text-xs text-[#858680]">Duration</p>
                <p className="mt-1 text-sm font-medium text-[#292A25]">
                  {selectedRequest.days}{" "}
                  {selectedRequest.days === 1 ? "day" : "days"}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F8F5] p-4">
                <p className="text-xs text-[#858680]">Submitted</p>
                <p className="mt-1 text-sm font-medium text-[#292A25]">
                  {formatDate(selectedRequest.submittedDate)}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-[#343530]">
                Reason for leave
              </p>
              <p className="mt-2 rounded-lg border border-[#EEEEEA] p-3 text-sm leading-6 text-[#62635D]">
                {selectedRequest.reason}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-[#EEEEEA] p-4">
                <div className="flex items-center gap-2">
                  <UserCheck size={17} className="text-[#777873]" />
                  <p className="text-sm font-medium text-[#343530]">
                    Line manager review
                  </p>
                </div>
                <p className="mt-2 text-sm text-[#62635D]">
                  {selectedRequest.manager}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#858680]">
                  {selectedRequest.managerComment ||
                    (selectedRequest.status === "Pending manager"
                      ? "Awaiting the line manager's decision."
                      : "No manager comment recorded.")}
                </p>
                {selectedRequest.status === "Pending manager" && (
                  <span className="mt-3 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                    Awaiting first approval
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-[#EEEEEA] p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-[#777873]" />
                  <p className="text-sm font-medium text-[#343530]">
                    HR final review
                  </p>
                </div>
                <p className="mt-2 text-sm text-[#62635D]">
                  {selectedRequest.hrComment ||
                    (selectedRequest.status === "Pending HR"
                      ? "Manager has approved. Awaiting HR's final decision."
                      : selectedRequest.status === "Pending manager"
                        ? "HR review becomes available after manager approval."
                        : "No HR comment recorded.")}
                </p>
              </div>
            </div>

            {selectedRequest.id !== -1 &&
              selectedRequest.status === "Pending manager" && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-start gap-2">
                    <CircleAlert
                      size={18}
                      className="mt-0.5 shrink-0 text-amber-800"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#604A10]">
                        Manager approval required
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#806C37]">
                        This request has not passed the first approval stage.
                        HR cannot give final approval yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {selectedRequest.id !== -1 &&
              selectedRequest.status === "Pending HR" && (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    Ready for HR review
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-800">
                    The line manager has approved this request. HR can now
                    approve or reject it.
                  </p>
                </div>
              )}

            {selectedRequest.id !== -1 &&
              selectedRequest.status === "Pending HR" && (
                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      updateRequest(
                        selectedRequest.id,
                        "Rejected",
                        "Request rejected by HR."
                      )
                    }
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    <XCircle size={16} />
                    Reject request
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateRequest(
                        selectedRequest.id,
                        "Approved",
                        "Final HR approval granted."
                      )
                    }
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FDC517] px-4 text-sm font-semibold text-[#24210F] transition hover:bg-[#EDB900]"
                  >
                    <CheckCircle2 size={16} />
                    Approve leave
                  </button>
                </div>
              )}

            {selectedRequest.id !== -1 &&
              selectedRequest.status !== "Pending HR" && (
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="mt-5 min-h-11 w-full rounded-lg border border-[#E5E5E0] px-4 text-sm font-medium text-[#343530] transition hover:bg-[#F7F7F4]"
                >
                  Close details
                </button>
              )}

            {selectedRequest.id === -1 && (
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="mt-5 min-h-11 w-full rounded-lg bg-[#FDC517] px-4 text-sm font-semibold text-[#24210F] transition hover:bg-[#EDB900]"
              >
                Done
              </button>
            )}

            <p className="mt-4 text-xs leading-5 text-[#898A84]">
              Frontend demo only. The live system will enforce permissions,
              persist approval decisions, calculate balances, and notify the
              employee at each workflow stage through the backend.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}