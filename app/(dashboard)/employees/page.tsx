"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Ellipsis,
  Eye,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  UsersRound,
  UserCheck,
  UserRoundX,
  UserRoundPlus,
  X,
} from "lucide-react";

type EmployeeStatus = "Active" | "Inactive" | "Probation";
type EmployeeType = "Full time" | "Part time" | "Contract" | "Intern";

type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  type: EmployeeType;
  status: EmployeeStatus;
  joined: string;
  avatar: string;
};

const departments = [
  "Content Studio",
  "Andara Studio",
  "Creative Studio",
  "Finance",
  "Operations",
];

const employeeSeed: Employee[] = [
  { id: "NK001", name: "Amara Okafor", role: "Content Strategist", email: "amara.okafor@neukleos.com", department: "Content Studio", type: "Full time", status: "Active", joined: "12 Feb 2023", avatar: "https://i.pravatar.cc/120?img=47" },
  { id: "NK002", name: "Daniel Adeyemi", role: "Brand Designer", email: "daniel.adeyemi@neukleos.com", department: "Creative Studio", type: "Full time", status: "Active", joined: "04 Jun 2022", avatar: "https://i.pravatar.cc/120?img=12" },
  { id: "NK003", name: "Zara Bello", role: "Operations Associate", email: "zara.bello@neukleos.com", department: "Operations", type: "Full time", status: "Probation", joined: "07 Sep 2026", avatar: "https://i.pravatar.cc/120?img=44" },
  { id: "NK004", name: "Tunde Balogun", role: "Finance Officer", email: "tunde.balogun@neukleos.com", department: "Finance", type: "Full time", status: "Active", joined: "18 Jan 2024", avatar: "https://i.pravatar.cc/120?img=53" },
  { id: "NK005", name: "Grace Eze", role: "Social Media Manager", email: "grace.eze@neukleos.com", department: "Andara Studio", type: "Contract", status: "Active", joined: "22 Mar 2025", avatar: "https://i.pravatar.cc/120?img=49" },
  { id: "NK006", name: "Femi Adebayo", role: "Video Editor", email: "femi.adebayo@neukleos.com", department: "Creative Studio", type: "Contract", status: "Inactive", joined: "11 Aug 2023", avatar: "https://i.pravatar.cc/120?img=59" },
  { id: "NK007", name: "Nneka Obi", role: "Copywriter", email: "nneka.obi@neukleos.com", department: "Content Studio", type: "Part time", status: "Active", joined: "03 Apr 2024", avatar: "https://i.pravatar.cc/120?img=25" },
  { id: "NK008", name: "Ibrahim Musa", role: "Studio Coordinator", email: "ibrahim.musa@neukleos.com", department: "Andara Studio", type: "Full time", status: "Probation", joined: "15 Oct 2026", avatar: "https://i.pravatar.cc/120?img=60" },
  { id: "NK009", name: "Damilola James", role: "People Operations Intern", email: "damilola.james@neukleos.com", department: "Operations", type: "Intern", status: "Active", joined: "01 Jul 2026", avatar: "https://i.pravatar.cc/120?img=32" },
  { id: "NK010", name: "Chisom Nwosu", role: "Accountant", email: "chisom.nwosu@neukleos.com", department: "Finance", type: "Part time", status: "Inactive", joined: "09 Nov 2022", avatar: "https://i.pravatar.cc/120?img=5" },
  { id: "NK011", name: "Kehinde Lawal", role: "Art Director", email: "kehinde.lawal@neukleos.com", department: "Creative Studio", type: "Full time", status: "Active", joined: "27 May 2021", avatar: "https://i.pravatar.cc/120?img=14" },
  { id: "NK012", name: "Mariam Yusuf", role: "Content Assistant", email: "mariam.yusuf@neukleos.com", department: "Content Studio", type: "Intern", status: "Probation", joined: "14 Sep 2026", avatar: "https://i.pravatar.cc/120?img=45" },
];

const statusStyles: Record<EmployeeStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Inactive: "bg-neutral-100 text-neutral-600 ring-neutral-500/15",
  Probation: "bg-amber-50 text-amber-700 ring-amber-600/15",
};

export default function EmployeesPage() {
  const [employees] = useState<Employee[]>(employeeSeed);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All department");
  const [type, setType] = useState("All types");
  const [status, setStatus] = useState("All status");
  const [page, setPage] = useState(1);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const pageSize = 8;

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        [
          employee.name,
          employee.id,
          employee.role,
          employee.email,
          employee.department,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesDepartment =
        department === "All department" ||
        employee.department === department;

      const matchesType = type === "All types" || employee.type === type;
      const matchesStatus =
        status === "All status" || employee.status === status;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesType &&
        matchesStatus
      );
    });
  }, [employees, search, department, type, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize),
  );
  const safePage = Math.min(page, totalPages);

  const visibleEmployees = filteredEmployees.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const activeCount = employees.filter(
    (employee) => employee.status === "Active",
  ).length;

  const probationCount = employees.filter(
    (employee) => employee.status === "Probation",
  ).length;

  const inactiveCount = employees.filter(
    (employee) => employee.status === "Inactive",
  ).length;

  function resetFilters() {
    setSearch("");
    setDepartment("All department");
    setType("All types");
    setStatus("All status");
    setPage(1);
    setMenuFor(null);
  }

  function exportCsv() {
    const headers = [
      "Employee ID",
      "Name",
      "Role",
      "Email",
      "Department",
      "Type",
      "Status",
      "Date joined",
    ];

    const rows = filteredEmployees.map((employee) => [
      employee.id,
      employee.name,
      employee.role,
      employee.email,
      employee.department,
      employee.type,
      employee.status,
      employee.joined,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${value.replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "neukleos-employees.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const hasActiveFilters =
    search !== "" ||
    department !== "All department" ||
    type !== "All types" ||
    status !== "All status";

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
            <span>HR Management</span>
            <ChevronRight size={13} />
            <span className="text-[var(--foreground)]">Employees</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Employees
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage your people, teams, and employment details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--surface-hover)]"
          >
            <Download size={16} />
            Export
          </button>

          <button
            type="button"
            onClick={() =>
              alert("The add employee form can be connected here next.")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717] shadow-sm transition hover:bg-[#e9b600]"
          >
            <Plus size={17} />
            Add employee
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<UsersRound size={18} />}
          label="Total employees"
          value={employees.length}
          note="Across all departments"
          tone="yellow"
        />

        <StatCard
          icon={<UserCheck size={18} />}
          label="Active employees"
          value={activeCount}
          note="Currently employed"
          tone="green"
        />

        <StatCard
          icon={<UserRoundX size={18} />}
          label="Inactive / probation"
          value={inactiveCount + probationCount}
          note={`${inactiveCount} inactive · ${probationCount} on probation`}
          tone="neutral"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_3px_14px_rgba(0,0,0,0.025)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-base font-semibold">Employee directory</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Browse and filter employee records.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#FDC517]" />
            Demo employee data
          </div>
        </div>

        <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(150px,1fr))_auto]">
            <label className="relative block">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search employees..."
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-9 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[#FDC517] focus:ring-2 focus:ring-[#FDC517]/20"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <FilterSelect
              label="Department"
              value={department}
              onChange={(value) => {
                setDepartment(value);
                setPage(1);
              }}
              options={["All department", ...departments]}
            />

            <FilterSelect
              label="Employment type"
              value={type}
              onChange={(value) => {
                setType(value);
                setPage(1);
              }}
              options={[
                "All types",
                "Full time",
                "Part time",
                "Contract",
                "Intern",
              ]}
            />

            <FilterSelect
              label="Status"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={["All status", "Active", "Inactive", "Probation"]}
            />

            <button
              type="button"
              onClick={resetFilters}
              title="Reset filters"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            >
              <SlidersHorizontal size={15} />
              <span>Reset</span>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
            <p>
              <span className="font-semibold text-[var(--foreground)]">
                {filteredEmployees.length}
              </span>{" "}
              employees found
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-[var(--foreground)] underline decoration-[#FDC517] underline-offset-4"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                <th className="px-6 py-4">
                  <span className="inline-flex items-center gap-2">
                    Employee <ArrowDownUp size={12} />
                  </span>
                </th>
                <th className="px-4 py-4">Employee ID</th>
                <th className="px-4 py-4">Department</th>
                <th className="px-4 py-4">Employment type</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Date joined</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {visibleEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="group transition hover:bg-[var(--surface)]/70"
                >
                  <td className="px-6 py-4">
                    <div className="flex min-w-[230px] items-center gap-3">
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        loading="lazy"
                        className="h-10 w-10 shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-hover)] object-cover"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                          {employee.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-[var(--muted)]">
                          {employee.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-xs font-medium text-[var(--muted)]">
                    {employee.id}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-lg bg-[var(--surface-hover)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)]">
                      {employee.department}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-sm text-[var(--muted)]">
                    {employee.type}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[employee.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          employee.status === "Active"
                            ? "bg-emerald-500"
                            : employee.status === "Inactive"
                              ? "bg-neutral-400"
                              : "bg-amber-500"
                        }`}
                      />
                      {employee.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-sm text-[var(--muted)]">
                    {employee.joined}
                  </td>

                  <td className="relative px-5 py-4 text-right">
                    <button
                      type="button"
                      aria-label={`Actions for ${employee.name}`}
                      aria-expanded={menuFor === employee.id}
                      onClick={() =>
                        setMenuFor(
                          menuFor === employee.id ? null : employee.id,
                        )
                      }
                      className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                    >
                      <Ellipsis size={18} />
                    </button>

                    {menuFor === employee.id && (
                      <div className="absolute right-8 top-12 z-20 w-40 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 text-left shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuFor(null);
                            alert(
                              `Demo profile: ${employee.name}\n${employee.role}\n${employee.email}`,
                            );
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-[var(--surface-hover)]"
                        >
                          <Eye size={14} />
                          View profile
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMenuFor(null);
                            alert(
                              `Editing ${employee.name} can be connected here next.`,
                            );
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-[var(--surface-hover)]"
                        >
                          <UserRoundPlus size={14} />
                          Edit details
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {visibleEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-hover)] text-[var(--muted)]">
                      <Filter size={18} />
                    </div>

                    <p className="text-sm font-semibold">
                      No employees found
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Try changing your search or filters.
                    </p>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-4 rounded-lg bg-[#FDC517] px-3 py-2 text-xs font-semibold text-[#171717]"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-xs text-[var(--muted)]">
            Showing{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {filteredEmployees.length
                ? (safePage - 1) * pageSize + 1
                : 0}
              –{Math.min(safePage * pageSize, filteredEmployees.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {filteredEmployees.length}
            </span>{" "}
            employees
          </p>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              aria-label="Previous page"
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 min-w-9 rounded-lg px-3 text-xs font-semibold transition ${
                    safePage === pageNumber
                      ? "bg-[#FDC517] text-[#171717]"
                      : "border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1),
                )
              }
              aria-label="Next page"
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <p className="pt-1 text-center text-[11px] text-[var(--muted)]">
        Neukleos People · HR workspace · Demo data
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 pr-9 text-sm text-[var(--foreground)] outline-none transition focus:border-[#FDC517] focus:ring-2 focus:ring-[#FDC517]/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
      />
    </label>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  note: string;
  tone: "yellow" | "green" | "neutral";
}) {
  const iconTone =
    tone === "yellow"
      ? "bg-[#FDC517]/20 text-[#7a5a00]"
      : tone === "green"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-neutral-100 text-neutral-600";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_3px_14px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
        <span className={`rounded-xl p-2.5 ${iconTone}`}>{icon}</span>
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
    </div>
  );
}