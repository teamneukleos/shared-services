"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Search,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";
import {
  approveLeaveApplication,
  createLeaveBalance,
  createLeaveType,
  listEmployees,
  listLeaveApplications,
  listLeaveBalances,
  listLeaveTypes,
  rejectLeaveApplication,
  submitLeaveApplication,
  withdrawLeaveApplication,
} from "@/lib/hr/api";
import type {
  Employee,
  LeaveApplication,
  LeaveBalance,
  LeaveRequestStatus,
  LeaveType,
} from "@/lib/hr/types";

const PAGE_SIZE = 8;

const APPLICATION_STATUSES: LeaveRequestStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/15",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  REJECTED: "bg-red-50 text-red-700 ring-red-600/15",
  CANCELLED: "bg-neutral-100 text-neutral-600 ring-neutral-500/15",
};

type Notice = { tone: "ok" | "error"; text: string } | null;
type Modal =
  | { type: "review"; application: LeaveApplication }
  | { type: "reject"; application: LeaveApplication }
  | { type: "setup-type" }
  | { type: "setup-balance" }
  | { type: "submit" }
  | null;

export default function LeaveManagementPage() {
  const { hasPermission, user } = useAuth();
  const canRead = hasPermission("leave.application.read");
  const canReview = hasPermission("leave.application.review");
  const canSubmit = hasPermission("leave.application.submit");
  const canWithdraw = hasPermission("leave.application.withdraw");
  const canTypeCreate = hasPermission("leave.type.create");
  const canTypeRead = hasPermission("leave.type.read");
  const canBalanceCreate = hasPermission("leave.balance.create");
  const canBalanceRead = hasPermission("leave.balance.read");

  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [status, setStatus] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [modal, setModal] = useState<Modal>(null);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    try {
      const result = await listLeaveApplications({
        page,
        size: PAGE_SIZE,
        status: (status as LeaveRequestStatus) || undefined,
        leaveTypeId: leaveTypeId || undefined,
      });
      const query = search.trim().toLowerCase();
      setApplications(
        query
          ? result.data.filter((item) =>
              [item.employeeName, item.employeeNumber, item.leaveTypeName]
                .join(" ")
                .toLowerCase()
                .includes(query),
            )
          : result.data,
      );
      setTotalItems(result.meta.totalItems);
      setTotalPages(Math.max(1, result.meta.totalPages));
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Could not load leave applications.",
      });
    } finally {
      setLoading(false);
    }
  }, [canRead, page, status, leaveTypeId, search]);

  const loadMeta = useCallback(async () => {
    try {
      const jobs: Promise<unknown>[] = [];
      if (canTypeRead) {
        jobs.push(
          listLeaveTypes({ page: 1, size: 100, status: "ACTIVE" }).then(
            (result) => setLeaveTypes(result.data),
          ),
        );
      }
      if (canBalanceRead) {
        jobs.push(
          listLeaveBalances({ page: 1, size: 20 }).then((result) =>
            setBalances(result.data),
          ),
        );
      }
      if (canRead) {
        jobs.push(
          listLeaveApplications({ page: 1, size: 1, status: "PENDING" }).then(
            (result) => setPendingCount(result.meta.totalItems),
          ),
        );
      }
      if (canBalanceCreate) {
        jobs.push(
          listEmployees({ page: 1, size: 100 }).then((result) =>
            setEmployees(result.data),
          ),
        );
      }
      await Promise.all(jobs);
    } catch {
      // Non-blocking.
    }
  }, [canTypeRead, canBalanceRead, canRead, canBalanceCreate]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  if (!canRead) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-sm text-[var(--muted)]">
        You need{" "}
        <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">
          leave.application.read
        </code>{" "}
        to view leave applications.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
            <span>HR Management</span>
            <ChevronRightIcon />
            <span className="text-[var(--foreground)]">Leave management</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leave management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Review leave applications in a single approval step. Set up leave
            types and balances before staff can submit.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canTypeCreate && (
            <button
              type="button"
              onClick={() => setModal({ type: "setup-type" })}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-hover)]"
            >
              Add leave type
            </button>
          )}
          {canBalanceCreate && (
            <button
              type="button"
              onClick={() => setModal({ type: "setup-balance" })}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-hover)]"
            >
              Init balance
            </button>
          )}
          {canSubmit && (
            <button
              type="button"
              onClick={() => setModal({ type: "submit" })}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717] hover:bg-[#e9b600]"
            >
              <Plus size={17} />
              Request leave
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
          icon={<CalendarDays size={18} />}
          label="Applications"
          value={totalItems}
          note="Matching current filters"
          tone="yellow"
        />
        <StatCard
          icon={<Clock3 size={18} />}
          label="Pending review"
          value={pendingCount}
          note="Awaiting approve / reject"
          tone="amber"
        />
        <StatCard
          icon={<Wallet size={18} />}
          label="Balances loaded"
          value={balances.length}
          note="Recent balance rows"
          tone="green"
        />
      </section>

      {balances.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold">Leave balances</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Available = entitled − reserved − used.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--surface)]/80 text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium sm:px-6">Employee</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Type</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Entitled</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Available</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Reserved</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Used</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((balance) => (
                  <tr
                    key={balance.id}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-5 py-3 sm:px-6">
                      {balance.employeeName}
                      <span className="mt-0.5 block text-xs text-[var(--muted)]">
                        {balance.employeeNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3 sm:px-6">{balance.leaveTypeName}</td>
                    <td className="px-5 py-3 sm:px-6">{balance.entitled}</td>
                    <td className="px-5 py-3 sm:px-6">{balance.available}</td>
                    <td className="px-5 py-3 sm:px-6">{balance.reserved}</td>
                    <td className="px-5 py-3 sm:px-6">{balance.used}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_180px_200px]">
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
                placeholder="Filter this page…"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-sm outline-none focus:border-[#FDC517]"
              />
            </label>
            <FilterSelect
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All statuses" },
                ...APPLICATION_STATUSES.map((item) => ({
                  value: item,
                  label: formatStatus(item),
                })),
              ]}
            />
            <FilterSelect
              value={leaveTypeId}
              onChange={(value) => {
                setLeaveTypeId(value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All leave types" },
                ...leaveTypes.map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface)]/80 text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3 font-medium sm:px-6">Employee</th>
                <th className="px-5 py-3 font-medium sm:px-6">Type</th>
                <th className="px-5 py-3 font-medium sm:px-6">Dates</th>
                <th className="px-5 py-3 font-medium sm:px-6">Days</th>
                <th className="px-5 py-3 font-medium sm:px-6">Status</th>
                <th className="px-5 py-3 font-medium sm:px-6" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-[var(--muted)]"
                  >
                    Loading…
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-[var(--muted)]"
                  >
                    No leave applications yet. Create a leave type, initialise a
                    balance, then submit a request.
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--surface)]/40"
                  >
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-medium">{application.employeeName}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {application.employeeNumber}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      {application.leaveTypeName}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--muted)] sm:px-6">
                      {formatDate(application.startDate)} →{" "}
                      {formatDate(application.endDate)}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      {application.quantity}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                          statusStyles[application.status] ??
                          statusStyles.CANCELLED
                        }`}
                      >
                        {formatStatus(application.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right sm:px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setModal({ type: "review", application })
                          }
                          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs"
                        >
                          View
                        </button>
                        {canReview && application.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await approveLeaveApplication(application.id);
                                  setNotice({
                                    tone: "ok",
                                    text: "Leave approved.",
                                  });
                                  await load();
                                  await loadMeta();
                                } catch (error) {
                                  setNotice({
                                    tone: "error",
                                    text:
                                      error instanceof ApiError
                                        ? error.message
                                        : "Approve failed.",
                                  });
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                            >
                              <CheckCircle2 size={13} />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setModal({ type: "reject", application })
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          </>
                        )}
                        {canWithdraw &&
                          application.status === "PENDING" &&
                          user?.id && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await withdrawLeaveApplication(
                                    application.id,
                                  );
                                  setNotice({
                                    tone: "ok",
                                    text: "Leave withdrawn.",
                                  });
                                  await load();
                                  await loadMeta();
                                } catch (error) {
                                  setNotice({
                                    tone: "error",
                                    text:
                                      error instanceof ApiError
                                        ? error.message
                                        : "Withdraw failed.",
                                  });
                                }
                              }}
                              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs"
                            >
                              Withdraw
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4 sm:px-6">
          <p className="text-xs text-[var(--muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-[var(--border)] p-2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-[var(--border)] p-2 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {modal?.type === "review" && (
        <ModalShell
          title={`Leave · ${modal.application.employeeName}`}
          onClose={() => setModal(null)}
        >
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Detail label="Type" value={modal.application.leaveTypeName} />
            <Detail
              label="Status"
              value={formatStatus(modal.application.status)}
            />
            <Detail
              label="Start"
              value={formatDate(modal.application.startDate)}
            />
            <Detail
              label="End"
              value={formatDate(modal.application.endDate)}
            />
            <Detail label="Days" value={String(modal.application.quantity)} />
            <Detail
              label="Submitted"
              value={formatDate(modal.application.submittedAt)}
            />
            <div className="sm:col-span-2">
              <Detail
                label="Reason"
                value={modal.application.reason ?? "—"}
              />
            </div>
            {modal.application.reviewComment && (
              <div className="sm:col-span-2">
                <Detail
                  label="Review comment"
                  value={modal.application.reviewComment}
                />
              </div>
            )}
          </dl>
        </ModalShell>
      )}

      {modal?.type === "reject" && (
        <RejectModal
          application={modal.application}
          onClose={() => setModal(null)}
          onSubmit={async (reason) => {
            await rejectLeaveApplication(modal.application.id, { reason });
            setModal(null);
            setNotice({ tone: "ok", text: "Leave rejected." });
            await load();
            await loadMeta();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "setup-type" && canTypeCreate && (
        <LeaveTypeModal
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            await createLeaveType(values);
            setModal(null);
            setNotice({ tone: "ok", text: "Leave type created." });
            await loadMeta();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "setup-balance" && canBalanceCreate && (
        <BalanceModal
          employees={employees}
          leaveTypes={leaveTypes}
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            await createLeaveBalance(values);
            setModal(null);
            setNotice({ tone: "ok", text: "Leave balance initialised." });
            await loadMeta();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "submit" && canSubmit && (
        <SubmitLeaveModal
          leaveTypes={leaveTypes}
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            await submitLeaveApplication(values);
            setModal(null);
            setNotice({
              tone: "ok",
              text: "Leave request submitted (balance reserved).",
            });
            await load();
            await loadMeta();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}
    </div>
  );
}

function LeaveTypeModal({
  onClose,
  onSubmit,
  onError,
}: {
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    code: string;
    description?: string;
    paid?: boolean;
  }) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState("Annual Leave");
  const [code, setCode] = useState("ANNUAL");
  const [description, setDescription] = useState("");
  const [paid, setPaid] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        paid,
      });
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Add leave type" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" required value={name} onChange={setName} />
        <Field
          label="Code"
          required
          value={code}
          onChange={(value) => setCode(value.toUpperCase())}
          placeholder="ANNUAL"
        />
        <Field
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={paid}
            onChange={(event) => setPaid(event.target.checked)}
          />
          Paid leave
        </label>
        <ModalActions saving={saving} onClose={onClose} submitLabel="Create" />
      </form>
    </ModalShell>
  );
}

function BalanceModal({
  employees,
  leaveTypes,
  onClose,
  onSubmit,
  onError,
}: {
  employees: Employee[];
  leaveTypes: LeaveType[];
  onClose: () => void;
  onSubmit: (values: {
    employeeId: string;
    leaveTypeId: string;
    entitled: number;
  }) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [entitled, setEntitled] = useState("20");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        employeeId,
        leaveTypeId,
        entitled: Number(entitled),
      });
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Initialise leave balance" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Employee</span>
          <select
            required
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.preferredName ||
                  `${employee.firstName} ${employee.lastName}`}{" "}
                · {employee.employeeNumber}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Leave type</span>
          <select
            required
            value={leaveTypeId}
            onChange={(event) => setLeaveTypeId(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
          >
            <option value="">Select type</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.code})
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Entitled days"
          required
          type="number"
          value={entitled}
          onChange={setEntitled}
        />
        <ModalActions
          saving={saving}
          onClose={onClose}
          submitLabel="Initialise"
        />
      </form>
    </ModalShell>
  );
}

function SubmitLeaveModal({
  leaveTypes,
  onClose,
  onSubmit,
  onError,
}: {
  leaveTypes: LeaveType[];
  onClose: () => void;
  onSubmit: (values: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        leaveTypeId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason: reason.trim() || undefined,
      });
    } catch (error) {
      onError(
        error instanceof ApiError
          ? error.message
          : "Submit failed. Your user must be linked to an employee with a leave balance.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Request leave" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="rounded-xl bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
          Submitted for the employee linked to your login. Days are inclusive
          calendar days and reserved on submit.
        </p>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Leave type</span>
          <select
            required
            value={leaveTypeId}
            onChange={(event) => setLeaveTypeId(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
          >
            <option value="">Select type</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Start date"
          required
          type="date"
          value={startDate}
          onChange={setStartDate}
        />
        <Field
          label="End date"
          required
          type="date"
          value={endDate}
          onChange={setEndDate}
        />
        <Field label="Reason" value={reason} onChange={setReason} />
        <ModalActions saving={saving} onClose={onClose} submitLabel="Submit" />
      </form>
    </ModalShell>
  );
}

function RejectModal({
  application,
  onClose,
  onSubmit,
  onError,
}: {
  application: LeaveApplication;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(reason.trim());
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Reject failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={`Reject · ${application.employeeName}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Reason"
          required
          value={reason}
          onChange={setReason}
          placeholder="Insufficient coverage"
        />
        <ModalActions saving={saving} onClose={onClose} submitLabel="Reject" />
      </form>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white shadow-xl">
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
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
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 pr-9 text-sm outline-none focus:border-[#FDC517]"
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
  tone: "yellow" | "amber" | "green";
}) {
  const iconTone =
    tone === "yellow"
      ? "bg-[#FDC517]/20 text-[#7a5a00]"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-emerald-700";
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
        <span className={`rounded-xl p-2.5 ${iconTone}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
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

function ChevronRightIcon() {
  return <ChevronRight size={13} />;
}

function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
