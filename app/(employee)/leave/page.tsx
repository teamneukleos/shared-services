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
  Clock3,
  Plus,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";
import {
  listLeaveApplications,
  listLeaveBalances,
  listLeaveTypes,
  submitLeaveApplication,
  withdrawLeaveApplication,
} from "@/lib/hr/api";
import type {
  LeaveApplication,
  LeaveBalance,
  LeaveType,
} from "@/lib/hr/types";

type Notice = { tone: "ok" | "error"; text: string } | null;

export default function EmployeeLeavePage() {
  const { user, hasPermission } = useAuth();
  const canRead = hasPermission("leave.application.read");
  const canSubmit = hasPermission("leave.application.submit");
  const canWithdraw = hasPermission("leave.application.withdraw");
  const canBalanceRead = hasPermission("leave.balance.read");
  const canTypeRead = hasPermission("leave.type.read");

  const employeeId = user?.employeeId ?? null;
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!canRead || !employeeId) return;
    setLoading(true);
    try {
      const jobs: Promise<void>[] = [
        listLeaveApplications({
          page: 1,
          size: 50,
          employeeId,
        }).then((result) => setApplications(result.data)),
      ];
      if (canBalanceRead) {
        jobs.push(
          listLeaveBalances({ page: 1, size: 50, employeeId }).then((result) =>
            setBalances(result.data),
          ),
        );
      }
      if (canTypeRead) {
        jobs.push(
          listLeaveTypes({ page: 1, size: 50, status: "ACTIVE" }).then(
            (result) => setLeaveTypes(result.data),
          ),
        );
      }
      await Promise.all(jobs);
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Could not load your leave data.",
      });
    } finally {
      setLoading(false);
    }
  }, [canRead, canBalanceRead, canTypeRead, employeeId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!employeeId) {
    return (
      <EmptyState
        title="No employee profile linked"
        body="Your login is not linked to an employee record yet. Ask HR to link your user account to your employee profile before requesting leave."
      />
    );
  }

  if (!canRead) {
    return (
      <EmptyState
        title="Leave access needed"
        body="You need leave.application.read to view your leave requests."
      />
    );
  }

  const pending = applications.filter((item) => item.status === "PENDING");
  const approved = applications.filter((item) => item.status === "APPROVED");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My leave</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Check balances, submit requests, and track approvals.
          </p>
        </div>
        {canSubmit && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717] hover:bg-[#e9b600]"
          >
            <Plus size={17} />
            Request leave
          </button>
        )}
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
        <Stat
          icon={<Wallet size={18} />}
          label="Leave types with balance"
          value={balances.length}
        />
        <Stat
          icon={<Clock3 size={18} />}
          label="Pending requests"
          value={pending.length}
        />
        <Stat
          icon={<CheckCircle2 size={18} />}
          label="Approved requests"
          value={approved.length}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-semibold">Balances</h2>
        </div>
        {balances.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[var(--muted)]">
            No balances yet. HR needs to initialise leave balances for your
            employee record.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {balances.map((balance) => (
              <div
                key={balance.id}
                className="rounded-xl border border-[var(--border)] p-4"
              >
                <p className="text-sm font-semibold">{balance.leaveTypeName}</p>
                <p className="mt-3 text-2xl font-semibold">
                  {balance.available}
                  <span className="ml-1 text-sm font-normal text-[var(--muted)]">
                    available
                  </span>
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Entitled {balance.entitled} · Reserved {balance.reserved} ·
                  Used {balance.used}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-semibold">My requests</h2>
        </div>
        {loading ? (
          <p className="px-5 py-10 text-sm text-[var(--muted)]">Loading…</p>
        ) : applications.length === 0 ? (
          <p className="px-5 py-10 text-sm text-[var(--muted)]">
            You have not submitted any leave yet.
          </p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {applications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{application.leaveTypeName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {formatDate(application.startDate)} →{" "}
                    {formatDate(application.endDate)} · {application.quantity}{" "}
                    day(s)
                  </p>
                  {application.reason && (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {application.reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={application.status} />
                  {canWithdraw && application.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await withdrawLeaveApplication(application.id);
                          setNotice({
                            tone: "ok",
                            text: "Request withdrawn.",
                          });
                          await load();
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
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && canSubmit && (
        <SubmitModal
          leaveTypes={leaveTypes}
          onClose={() => setShowForm(false)}
          onSubmit={async (values) => {
            await submitLeaveApplication(values);
            setShowForm(false);
            setNotice({
              tone: "ok",
              text: "Leave submitted. Days are reserved until approved or rejected.",
            });
            await load();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}
    </div>
  );
}

function SubmitModal({
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
      onError(error instanceof ApiError ? error.message : "Submit failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold">Request leave</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
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
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Start date</span>
            <input
              required
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">End date</span>
            <input
              required
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Reason</span>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
            />
          </label>
          <div className="flex justify-end gap-2">
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
              {saving ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs text-[var(--muted)]">{label}</p>
        <span className="rounded-xl bg-[#FFF4C7] p-2.5 text-[#7a5a00]">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    APPROVED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-red-50 text-red-700",
    CANCELLED: "bg-neutral-100 text-neutral-600",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        styles[status] ?? styles.CANCELLED
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
      <CalendarDays className="mx-auto text-[var(--muted)]" size={28} />
      <h1 className="mt-4 text-lg font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
