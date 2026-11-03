"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Ellipsis,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  UsersRound,
  UserCheck,
  UserRoundX,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";
import {
  changeEmployeeStatus,
  createEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from "@/lib/hr/api";
import type {
  CreateEmployeeInput,
  Employee,
  EmploymentStatus,
  EmploymentType,
  UpdateEmployeeInput,
} from "@/lib/hr/types";
import { listDepartments } from "@/lib/organisation/api";
import type { Department } from "@/lib/organisation/types";

const PAGE_SIZE = 8;

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERN",
  "TEMPORARY",
  "OTHER",
];

const EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "TERMINATED",
];

const statusStyles: Record<EmploymentStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/15",
  SUSPENDED: "bg-orange-50 text-orange-700 ring-orange-600/15",
  TERMINATED: "bg-neutral-100 text-neutral-600 ring-neutral-500/15",
};

const statusDot: Record<EmploymentStatus, string> = {
  ACTIVE: "bg-emerald-500",
  PENDING: "bg-amber-500",
  SUSPENDED: "bg-orange-500",
  TERMINATED: "bg-neutral-400",
};

type Notice = { tone: "ok" | "error"; text: string } | null;
type Modal =
  | { type: "create" }
  | { type: "view"; employeeId: string }
  | { type: "edit"; employee: Employee }
  | { type: "status"; employee: Employee }
  | null;

export default function EmployeesPage() {
  const { hasPermission } = useAuth();
  const canRead = hasPermission("employee.read");
  const canCreate = hasPermission("employee.create");
  const canUpdate = hasPermission("employee.update");
  const canChangeStatus = hasPermission("employee.status.change");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managerOptions, setManagerOptions] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    try {
      const result = await listEmployees({
        page,
        size: PAGE_SIZE,
        search: search.trim() || undefined,
        departmentId: departmentId || undefined,
        employmentType: (employmentType as EmploymentType) || undefined,
        status: (status as EmploymentStatus) || undefined,
      });
      setEmployees(result.data);
      setTotalItems(result.meta.totalItems);
      setTotalPages(Math.max(1, result.meta.totalPages));
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Could not load employees.",
      });
    } finally {
      setLoading(false);
    }
  }, [canRead, page, search, departmentId, employmentType, status]);

  const loadMeta = useCallback(async () => {
    if (!canRead) return;
    try {
      const [deps, active, pending, managers] = await Promise.all([
        listDepartments({ page: 1, size: 100 }),
        listEmployees({ page: 1, size: 1, status: "ACTIVE" }),
        listEmployees({ page: 1, size: 1, status: "PENDING" }),
        listEmployees({ page: 1, size: 100, status: "ACTIVE" }),
      ]);
      setDepartments(deps.data);
      setActiveCount(active.meta.totalItems);
      setPendingCount(pending.meta.totalItems);
      setManagerOptions(managers.data);
    } catch {
      // Non-blocking for directory load.
    }
  }, [canRead]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  function resetFilters() {
    setSearch("");
    setDepartmentId("");
    setEmploymentType("");
    setStatus("");
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
    const rows = employees.map((employee) => [
      employee.employeeNumber,
      displayName(employee),
      employee.jobTitle,
      employee.workEmail,
      employee.departmentName,
      formatEmploymentType(employee.employmentType),
      formatStatus(employee.status),
      formatDate(employee.hireDate),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
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
    departmentId !== "" ||
    employmentType !== "" ||
    status !== "";

  if (!canRead) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-sm text-[var(--muted)]">
        You need{" "}
        <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">
          employee.read
        </code>{" "}
        to view employees.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
            <span>HR Management</span>
            <ChevronRight size={13} />
            <span className="text-[var(--foreground)]">Employees</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage people records, departments, and employment status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--surface-hover)]"
          >
            <Download size={16} />
            Export page
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={() => setModal({ type: "create" })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717] shadow-sm transition hover:bg-[#e9b600]"
            >
              <Plus size={17} />
              Add employee
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.tone === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<UsersRound size={18} />}
          label="Matching employees"
          value={totalItems}
          note="For current filters"
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
          label="Pending onboarding"
          value={pendingCount}
          note="Awaiting activation"
          tone="neutral"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_3px_14px_rgba(0,0,0,0.025)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-base font-semibold">Employee directory</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Live records from the HR API.
            </p>
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
              value={departmentId}
              onChange={(value) => {
                setDepartmentId(value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All departments" },
                ...departments.map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
            />

            <FilterSelect
              label="Employment type"
              value={employmentType}
              onChange={(value) => {
                setEmploymentType(value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All types" },
                ...EMPLOYMENT_TYPES.map((item) => ({
                  value: item,
                  label: formatEmploymentType(item),
                })),
              ]}
            />

            <FilterSelect
              label="Status"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All status" },
                ...EMPLOYMENT_STATUSES.map((item) => ({
                  value: item,
                  label: formatStatus(item),
                })),
              ]}
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
                {loading ? "…" : totalItems}
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
                <th className="px-6 py-4">Employee</th>
                <th className="px-4 py-4">Employee ID</th>
                <th className="px-4 py-4">Department</th>
                <th className="px-4 py-4">Employment type</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Date joined</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-sm text-[var(--muted)]"
                  >
                    Loading…
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-hover)] text-[var(--muted)]">
                      <Filter size={18} />
                    </div>
                    <p className="text-sm font-semibold">No employees found</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {canCreate
                        ? "Add an employee or adjust filters."
                        : "Try changing your search or filters."}
                    </p>
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="group transition hover:bg-[var(--surface)]/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex min-w-[230px] items-center gap-3">
                        <Avatar name={displayName(employee)} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                            {displayName(employee)}
                          </p>
                          <p className="mt-1 truncate text-xs text-[var(--muted)]">
                            {employee.jobTitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-[var(--muted)]">
                      {employee.employeeNumber}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-lg bg-[var(--surface-hover)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)]">
                        {employee.departmentName}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--muted)]">
                      {formatEmploymentType(employee.employmentType)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[employee.status]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusDot[employee.status]}`}
                        />
                        {formatStatus(employee.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--muted)]">
                      {formatDate(employee.hireDate)}
                    </td>
                    <td className="relative px-5 py-4 text-right">
                      <button
                        type="button"
                        aria-label={`Actions for ${displayName(employee)}`}
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
                        <div className="absolute right-8 top-12 z-20 w-44 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 text-left shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setMenuFor(null);
                              setModal({
                                type: "view",
                                employeeId: employee.id,
                              });
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-[var(--surface-hover)]"
                          >
                            <Eye size={14} />
                            View profile
                          </button>
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuFor(null);
                                setModal({ type: "edit", employee });
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-[var(--surface-hover)]"
                            >
                              <Pencil size={14} />
                              Edit details
                            </button>
                          )}
                          {canChangeStatus && (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuFor(null);
                                setModal({ type: "status", employee });
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-[var(--surface-hover)]"
                            >
                              <UserCheck size={14} />
                              Change status
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-xs text-[var(--muted)]">
            Page{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {totalPages}
            </span>{" "}
            · {totalItems} total
          </p>
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Previous page"
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Next page"
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {modal?.type === "create" && canCreate && (
        <EmployeeFormModal
          title="Add employee"
          departments={departments}
          managers={managerOptions}
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            await createEmployee(values);
            setModal(null);
            setNotice({ tone: "ok", text: "Employee created." });
            setPage(1);
            await load();
            await loadMeta();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "edit" && canUpdate && (
        <EmployeeFormModal
          title="Edit employee"
          departments={departments}
          managers={managerOptions}
          initial={modal.employee}
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            const body: UpdateEmployeeInput = {
              firstName: values.firstName,
              lastName: values.lastName,
              preferredName: values.preferredName || null,
              workEmail: values.workEmail,
              phone: values.phone || null,
              departmentId: values.departmentId,
              jobTitle: values.jobTitle,
              employmentType: values.employmentType,
              hireDate: values.hireDate,
              managerId: values.managerId || null,
              positionId: values.positionId || null,
              teamId: values.teamId || null,
            };
            await updateEmployee(modal.employee.id, body);
            setModal(null);
            setNotice({ tone: "ok", text: "Employee updated." });
            await load();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "view" && (
        <ViewEmployeeModal
          employeeId={modal.employeeId}
          onClose={() => setModal(null)}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "status" && canChangeStatus && (
        <StatusModal
          employee={modal.employee}
          onClose={() => setModal(null)}
          onSubmit={async (nextStatus, terminationDate, reason) => {
            await changeEmployeeStatus(modal.employee.id, {
              status: nextStatus,
              terminationDate:
                nextStatus === "TERMINATED"
                  ? terminationDate || new Date().toISOString()
                  : undefined,
              reason: reason || undefined,
            });
            setModal(null);
            setNotice({ tone: "ok", text: "Employment status updated." });
            await load();
            await loadMeta();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}
    </div>
  );
}

function EmployeeFormModal({
  title,
  departments,
  managers,
  initial,
  onClose,
  onSubmit,
  onError,
}: {
  title: string;
  departments: Department[];
  managers: Employee[];
  initial?: Employee;
  onClose: () => void;
  onSubmit: (values: CreateEmployeeInput) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [employeeNumber, setEmployeeNumber] = useState(
    initial?.employeeNumber ?? "",
  );
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [preferredName, setPreferredName] = useState(
    initial?.preferredName ?? "",
  );
  const [workEmail, setWorkEmail] = useState(initial?.workEmail ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [departmentId, setDepartmentId] = useState(
    initial?.departmentId ?? "",
  );
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle ?? "");
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    initial?.employmentType ?? "FULL_TIME",
  );
  const [hireDate, setHireDate] = useState(
    initial ? toDateInput(initial.hireDate) : "",
  );
  const [managerId, setManagerId] = useState(initial?.managerId ?? "");
  const [saving, setSaving] = useState(false);
  const editing = Boolean(initial);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!departmentId) {
      onError("Select a department.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        employeeNumber: employeeNumber.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        preferredName: preferredName.trim() || undefined,
        workEmail: workEmail.trim(),
        phone: phone.trim() || undefined,
        departmentId,
        jobTitle: jobTitle.trim(),
        employmentType,
        hireDate: new Date(hireDate).toISOString(),
        managerId: managerId || undefined,
      });
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={title} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Employee number"
            required
            value={employeeNumber}
            onChange={setEmployeeNumber}
            disabled={editing}
            placeholder="NK-0042"
          />
          <Field
            label="Work email"
            required
            type="email"
            value={workEmail}
            onChange={setWorkEmail}
          />
          <Field
            label="First name"
            required
            value={firstName}
            onChange={setFirstName}
          />
          <Field
            label="Last name"
            required
            value={lastName}
            onChange={setLastName}
          />
          <Field
            label="Preferred name"
            value={preferredName}
            onChange={setPreferredName}
          />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <Field
            label="Job title"
            required
            value={jobTitle}
            onChange={setJobTitle}
          />
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Department</span>
            <select
              required
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
            >
              <option value="">Select department</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Employment type</span>
            <select
              value={employmentType}
              onChange={(event) =>
                setEmploymentType(event.target.value as EmploymentType)
              }
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
            >
              {EMPLOYMENT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {formatEmploymentType(item)}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Hire date"
            required
            type="date"
            value={hireDate}
            onChange={setHireDate}
          />
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="font-medium">Manager (optional)</span>
            <select
              value={managerId}
              onChange={(event) => setManagerId(event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
            >
              <option value="">No manager</option>
              {managers
                .filter((item) => item.id !== initial?.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {displayName(item)} · {item.employeeNumber}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <ModalActions
          saving={saving}
          onClose={onClose}
          submitLabel={editing ? "Save changes" : "Create employee"}
        />
      </form>
    </ModalShell>
  );
}

function ViewEmployeeModal({
  employeeId,
  onClose,
  onError,
}: {
  employeeId: string;
  onClose: () => void;
  onError: (message: string) => void;
}) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setEmployee(await getEmployee(employeeId));
      } catch (error) {
        onError(
          error instanceof ApiError
            ? error.message
            : "Could not load employee.",
        );
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [employeeId, onClose, onError]);

  return (
    <ModalShell title="Employee profile" onClose={onClose}>
      {loading || !employee ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <Avatar name={displayName(employee)} large />
            <div>
              <p className="text-base font-semibold">{displayName(employee)}</p>
              <p className="text-[var(--muted)]">{employee.jobTitle}</p>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail label="Employee ID" value={employee.employeeNumber} />
            <Detail label="Work email" value={employee.workEmail} />
            <Detail label="Phone" value={employee.phone ?? "—"} />
            <Detail label="Department" value={employee.departmentName} />
            <Detail
              label="Type"
              value={formatEmploymentType(employee.employmentType)}
            />
            <Detail label="Status" value={formatStatus(employee.status)} />
            <Detail label="Hire date" value={formatDate(employee.hireDate)} />
            <Detail label="Manager" value={employee.managerName ?? "—"} />
            <Detail
              label="Login linked"
              value={employee.userAccountId ? "Yes" : "No"}
            />
          </dl>
        </div>
      )}
    </ModalShell>
  );
}

function StatusModal({
  employee,
  onClose,
  onSubmit,
  onError,
}: {
  employee: Employee;
  onClose: () => void;
  onSubmit: (
    status: EmploymentStatus,
    terminationDate: string,
    reason: string,
  ) => Promise<void>;
  onError: (message: string) => void;
}) {
  const options = nextStatuses(employee.status);
  const [status, setStatus] = useState<EmploymentStatus>(
    options[0] ?? employee.status,
  );
  const [terminationDate, setTerminationDate] = useState(
    toDateInput(new Date().toISOString()),
  );
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(
        status,
        new Date(terminationDate).toISOString(),
        reason.trim(),
      );
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : "Status change failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={`Change status · ${displayName(employee)}`} onClose={onClose}>
      {options.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No further status transitions are allowed from{" "}
          {formatStatus(employee.status)}.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-[var(--muted)]">
            Current status:{" "}
            <strong className="text-[var(--foreground)]">
              {formatStatus(employee.status)}
            </strong>
          </p>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">New status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as EmploymentStatus)
              }
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
            >
              {options.map((item) => (
                <option key={item} value={item}>
                  {formatStatus(item)}
                </option>
              ))}
            </select>
          </label>
          {status === "TERMINATED" && (
            <Field
              label="Termination date"
              required
              type="date"
              value={terminationDate}
              onChange={setTerminationDate}
            />
          )}
          <Field label="Reason (optional)" value={reason} onChange={setReason} />
          <ModalActions
            saving={saving}
            onClose={onClose}
            submitLabel="Update status"
          />
        </form>
      )}
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className={`w-full rounded-2xl border border-[var(--border)] bg-white shadow-xl ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        required={required}
        disabled={disabled}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517] disabled:bg-[var(--surface)]"
      />
    </label>
  );
}

function ModalActions({
  saving,
  onClose,
  submitLabel,
}: {
  saving: boolean;
  onClose: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#111115] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
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
  options: Array<{ value: string; label: string }>;
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
          <option key={option.value || "all"} value={option.value}>
            {option.label}
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
  icon: ReactNode;
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

function Avatar({ name, large }: { name: string; large?: boolean }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[#FFF4C7] font-semibold text-[#7a5a00] ${
        large ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"
      }`}
    >
      {initials || "?"}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function displayName(employee: Employee): string {
  return (
    employee.preferredName?.trim() ||
    `${employee.firstName} ${employee.lastName}`.trim()
  );
}

function formatEmploymentType(type: EmploymentType): string {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatStatus(status: EmploymentStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInput(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function nextStatuses(current: EmploymentStatus): EmploymentStatus[] {
  switch (current) {
    case "PENDING":
      return ["ACTIVE", "TERMINATED"];
    case "ACTIVE":
      return ["SUSPENDED", "TERMINATED"];
    case "SUSPENDED":
      return ["ACTIVE", "TERMINATED"];
    default:
      return [];
  }
}
