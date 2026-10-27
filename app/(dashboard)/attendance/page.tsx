
"use client";

import { useMemo, useState } from "react";
import { EmployeeAvatar } from "@/components/employee-avatar";
import {
  CalendarDays,
  Clock3,
  UsersRound,
  CheckCircle2,
  CircleAlert,
  Search,
  Download,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  RotateCcw,
  X,
  LogIn,
  LogOut,
  Timer,
} from "lucide-react";

type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "On leave"
  | "Not checked in";

type AttendanceRecord = {
  id: number;
  name: string;
  initials: string;
  avatar: string | null;
  department: string;
  role: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: AttendanceStatus;
};

const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 1,
    name: "Amara Okafor",
    initials: "AO",
    avatar: "https://i.pravatar.cc/120?img=47",
    department: "Marketing",
    role: "Marketing Executive",
    date: "2026-10-24",
    checkIn: "08:42 AM",
    checkOut: "05:10 PM",
    hours: "8h 28m",
    status: "Present",
  },
  {
    id: 2,
    name: "Daniel Adeyemi",
    initials: "DA",
    avatar: "https://i.pravatar.cc/120?img=12",
    department: "Engineering",
    role: "Frontend Engineer",
    date: "2026-10-24",
    checkIn: "09:18 AM",
    checkOut: "—",
    hours: "In progress",
    status: "Late",
  },
  {
    id: 3,
    name: "Grace Eze",
    initials: "GE",
    avatar: "https://i.pravatar.cc/120?img=44",
    department: "Human Resources",
    role: "HR Executive",
    date: "2026-10-24",
    checkIn: "08:35 AM",
    checkOut: "—",
    hours: "In progress",
    status: "Present",
  },
  {
    id: 4,
    name: "Sarah Williams",
    initials: "SW",
    avatar: "https://i.pravatar.cc/120?img=45",
    department: "Finance",
    role: "Accountant",
    date: "2026-10-24",
    checkIn: "—",
    checkOut: "—",
    hours: "—",
    status: "On leave",
  },
  {
    id: 5,
    name: "Tunde Bello",
    initials: "TB",
    avatar: "https://i.pravatar.cc/120?img=13",
    department: "Engineering",
    role: "Backend Engineer",
    date: "2026-10-24",
    checkIn: "—",
    checkOut: "—",
    hours: "—",
    status: "Not checked in",
  },
  {
    id: 6,
    name: "Michael James",
    initials: "MJ",
    avatar: "https://i.pravatar.cc/120?img=68",
    department: "Design",
    role: "Product Designer",
    date: "2026-10-24",
    checkIn: "08:51 AM",
    checkOut: "—",
    hours: "In progress",
    status: "Present",
  },
  {
    id: 7,
    name: "Esther Adebayo",
    initials: "EA",
    avatar: "https://i.pravatar.cc/120?img=49",
    department: "Marketing",
    role: "Content Strategist",
    date: "2026-10-24",
    checkIn: "09:24 AM",
    checkOut: "—",
    hours: "In progress",
    status: "Late",
  },
  {
    id: 8,
    name: "David Okoro",
    initials: "DO",
    avatar: "https://i.pravatar.cc/120?img=14",
    department: "Operations",
    role: "Operations Associate",
    date: "2026-10-24",
    checkIn: "—",
    checkOut: "—",
    hours: "—",
    status: "Absent",
  },
];

const departments = [
  "All departments",
  "Engineering",
  "Finance",
  "Human Resources",
  "Marketing",
  "Design",
  "Operations",
];

const statusOptions = [
  "All statuses",
  "Present",
  "Late",
  "Absent",
  "On leave",
  "Not checked in",
];

const statusStyles: Record<AttendanceStatus, string> = {
  Present: "bg-emerald-50 text-emerald-700",
  Late: "bg-amber-50 text-amber-700",
  Absent: "bg-rose-50 text-rose-700",
  "On leave": "bg-blue-50 text-blue-700",
  "Not checked in": "bg-gray-100 text-gray-600",
};

function formatDate(date: string) {
  if (!date) return "";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function downloadCsv(records: AttendanceRecord[]) {
  const headers = [
    "Employee",
    "Department",
    "Role",
    "Date",
    "Check in",
    "Check out",
    "Working hours",
    "Status",
  ];

  const rows = records.map((record) => [
    record.name,
    record.department,
    record.role,
    record.date,
    record.checkIn,
    record.checkOut,
    record.hours,
    record.status,
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
  link.download = `neukleos-attendance-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof UsersRound;
  iconBg: string;
  iconColor: string;
  trend?: "up" | "down";
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

      <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-[#858680]">
        {trend && (
          <span
            className={
              trend === "up"
                ? "inline-flex items-center gap-0.5 font-medium text-emerald-700"
                : "inline-flex items-center gap-0.5 font-medium text-rose-600"
            }
          >
            {trend === "up" ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
          </span>
        )}
        <span>{description}</span>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const [records, setRecords] =
    useState<AttendanceRecord[]>(INITIAL_RECORDS);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("All statuses");
  const [selectedDate, setSelectedDate] = useState("2026-10-24");
  const [selectedRecord, setSelectedRecord] =
    useState<AttendanceRecord | null>(null);

  const [activeTab, setActiveTab] = useState<
    "All" | "Present" | "Late" | "Exceptions"
  >("All");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(search.toLowerCase()) ||
        record.department.toLowerCase().includes(search.toLowerCase()) ||
        record.role.toLowerCase().includes(search.toLowerCase());

      const matchesDepartment =
        department === "All departments" ||
        record.department === department;

      const matchesStatus =
        status === "All statuses" || record.status === status;

      const matchesDate = record.date === selectedDate;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Present" && record.status === "Present") ||
        (activeTab === "Late" && record.status === "Late") ||
        (activeTab === "Exceptions" &&
          ["Absent", "Not checked in"].includes(record.status));

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesDate &&
        matchesTab
      );
    });
  }, [
    records,
    search,
    department,
    status,
    selectedDate,
    activeTab,
  ]);

  const dailyRecords = records.filter(
    (record) => record.date === selectedDate
  );

  const presentCount = dailyRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const lateCount = dailyRecords.filter(
    (record) => record.status === "Late"
  ).length;

  const absentCount = dailyRecords.filter(
    (record) =>
      record.status === "Absent" ||
      record.status === "Not checked in"
  ).length;

  const checkedInCount = dailyRecords.filter(
    (record) => record.checkIn !== "—"
  ).length;

  const attendanceRate = dailyRecords.length
    ? Math.round((checkedInCount / dailyRecords.length) * 100)
    : 0;

  function resetFilters() {
    setSearch("");
    setDepartment("All departments");
    setStatus("All statuses");
    setActiveTab("All");
  }

  function updateStatus(id: number, nextStatus: AttendanceStatus) {
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status: nextStatus,
              checkIn:
                nextStatus === "Present" && record.checkIn === "—"
                  ? "09:00 AM"
                  : record.checkIn,
            }
          : record
      )
    );

    setSelectedRecord((current) =>
      current?.id === id
        ? {
            ...current,
            status: nextStatus,
            checkIn:
              nextStatus === "Present" && current.checkIn === "—"
                ? "09:00 AM"
                : current.checkIn,
          }
        : current
    );
  }

  return (
    <div className="min-w-0 space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#898A84]">
            <span>HR Management</span>
            <span>/</span>
            <span className="text-[#343530]">Attendance</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#191919] sm:text-[28px]">
            Attendance
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#777873]">
            Monitor employee attendance, working hours, check-ins and
            attendance exceptions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadCsv(filteredRecords)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#E5E5E0] bg-white px-4 text-sm font-medium text-[#33342F] transition hover:bg-[#F7F7F4] sm:w-auto"
        >
          <Download size={16} />
          Export report
        </button>
      </div>

      {/* Date selection */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#EAEAE7] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FDC517]/20">
            <CalendarDays size={19} className="text-[#8A6A00]" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#22231F]">
              Daily attendance
            </p>
            <p className="mt-0.5 text-xs text-[#858680]">
              Review attendance records for a selected date.
            </p>
          </div>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 text-sm text-[#33342F] outline-none focus:border-[#D2A500] sm:w-auto"
          aria-label="Select attendance date"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Employees recorded"
          value={dailyRecords.length}
          description="Records for selected date"
          icon={UsersRound}
          iconBg="bg-[#F0F0ED]"
          iconColor="text-[#484943]"
        />

        <StatCard
          title="Present"
          value={presentCount}
          description={`${attendanceRate}% checked in`}
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          trend="up"
        />

        <StatCard
          title="Late arrivals"
          value={lateCount}
          description="Require attendance review"
          icon={Clock3}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
        />

        <StatCard
          title="Attendance exceptions"
          value={absentCount}
          description="Absent or not checked in"
          icon={CircleAlert}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
      </div>

      {/* Attendance table */}
      <section className="overflow-hidden rounded-xl border border-[#EAEAE7] bg-white">
        <div className="border-b border-[#EEEEEA] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#20211D]">
                Employee attendance
              </h2>
              <p className="mt-1 text-sm text-[#858680]">
                View and review attendance records for your organisation.
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
            {(["All", "Present", "Late", "Exceptions"] as const).map(
              (tab) => {
                const count =
                  tab === "All"
                    ? dailyRecords.length
                    : tab === "Present"
                      ? dailyRecords.filter(
                          (record) => record.status === "Present"
                        ).length
                      : tab === "Late"
                        ? dailyRecords.filter(
                            (record) => record.status === "Late"
                          ).length
                        : dailyRecords.filter((record) =>
                            ["Absent", "Not checked in"].includes(
                              record.status
                            )
                          ).length;

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
              }
            )}
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
                placeholder="Search employee, role or department..."
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
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E0] bg-white px-3 pr-9 text-sm text-[#454640] outline-none focus:border-[#D2A500]"
                aria-label="Filter by attendance status"
              >
                {statusOptions.map((item) => (
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

        {/* Responsive table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#FAFAF8]">
                {[
                  "Employee",
                  "Department",
                  "Check in",
                  "Check out",
                  "Working hours",
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
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="transition hover:bg-[#FCFCFA]"
                >
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      className="flex items-center gap-3 text-left"
                    >
                      <EmployeeAvatar
                        name={record.name}
                        src={record.avatar}
                        size="md"
                      />
                      <span>
                        <span className="block whitespace-nowrap text-sm font-medium text-[#292A25]">
                          {record.name}
                        </span>
                        <span className="mt-1 block whitespace-nowrap text-xs text-[#898A84]">
                          {record.role}
                        </span>
                      </span>
                    </button>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#62635D]">
                    {record.department}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#44453F]">
                    <span className="inline-flex items-center gap-2">
                      <LogIn size={14} className="text-[#92938D]" />
                      {record.checkIn}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#44453F]">
                    <span className="inline-flex items-center gap-2">
                      <LogOut size={14} className="text-[#92938D]" />
                      {record.checkOut}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#62635D]">
                    <span className="inline-flex items-center gap-2">
                      <Timer size={14} className="text-[#92938D]" />
                      {record.hours}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[record.status]}`}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#777873] transition hover:bg-[#F0F0ED] hover:text-[#242520]"
                      aria-label={`View ${record.name} attendance`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F5F2]">
                      <Search size={20} className="text-[#898A84]" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#343530]">
                      No attendance records found
                    </p>
                    <p className="mt-1 text-sm text-[#858680]">
                      Try another date or adjust your filters.
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
            Showing {filteredRecords.length} of {dailyRecords.length} records
          </span>
          <span>Attendance date: {formatDate(selectedDate)}</span>
        </div>
      </section>

      {/* Attendance details panel */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-detail-title"
            className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <EmployeeAvatar
                  name={selectedRecord.name}
                  src={selectedRecord.avatar}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#898A84]">
                    Attendance details
                  </p>
                  <h2
                    id="attendance-detail-title"
                    className="mt-1 text-xl font-semibold text-[#20211D]"
                  >
                    {selectedRecord.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#777873]">
                    {selectedRecord.role} · {selectedRecord.department}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-[#F3F3F0]"
                aria-label="Close attendance details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-[#F8F8F5] p-4">
              <p className="text-xs text-[#858680]">Attendance date</p>
              <p className="mt-1 text-sm font-medium text-[#292A25]">
                {formatDate(selectedRecord.date)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#858680]">Check in</p>
                  <p className="mt-1 text-sm font-medium text-[#292A25]">
                    {selectedRecord.checkIn}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#858680]">Check out</p>
                  <p className="mt-1 text-sm font-medium text-[#292A25]">
                    {selectedRecord.checkOut}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#858680]">Working hours</p>
                  <p className="mt-1 text-sm font-medium text-[#292A25]">
                    {selectedRecord.hours}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#858680]">Current status</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[selectedRecord.status]}`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="attendance-status"
                className="mb-2 block text-sm font-medium text-[#343530]"
              >
                Update attendance status
              </label>

              <select
                id="attendance-status"
                value={selectedRecord.status}
                onChange={(event) =>
                  updateStatus(
                    selectedRecord.id,
                    event.target.value as AttendanceStatus
                  )
                }
                className="h-11 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 text-sm outline-none focus:border-[#D2A500]"
              >
                {(
                  [
                    "Present",
                    "Late",
                    "Absent",
                    "On leave",
                    "Not checked in",
                  ] as AttendanceStatus[]
                ).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs leading-5 text-[#858680]">
                This demo updates the local page state only. In the live
                system, changes will be saved to the attendance record
                and restricted to authorised users.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="mt-5 min-h-11 w-full rounded-lg bg-[#FDC517] px-4 text-sm font-semibold text-[#24210F] transition hover:bg-[#EDB900]"
            >
              Done
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
