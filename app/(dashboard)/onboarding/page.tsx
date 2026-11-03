"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";
import {
  changeOnboardingStatus,
  changeOnboardingTaskStatus,
  createOnboardingPlan,
  createOnboardingTask,
  getOnboardingPlan,
  listEmployees,
  listOnboardingPlans,
  updateOnboardingPlan,
} from "@/lib/hr/api";
import type {
  CreateOnboardingInput,
  Employee,
  OnboardingPlan,
  OnboardingStatus,
  OnboardingTask,
  OnboardingTaskStatus,
  UpdateOnboardingInput,
} from "@/lib/hr/types";

const PAGE_SIZE = 8;

const PLAN_STATUSES: OnboardingStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const planStatusStyles: Record<OnboardingStatus, string> = {
  NOT_STARTED: "bg-neutral-100 text-neutral-700 ring-neutral-500/15",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-600/15",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/15",
};

type Notice = { tone: "ok" | "error"; text: string } | null;
type Modal =
  | { type: "create" }
  | { type: "edit"; plan: OnboardingPlan }
  | { type: "status"; plan: OnboardingPlan }
  | { type: "detail"; planId: string }
  | null;

export default function OnboardingPage() {
  const { hasPermission } = useAuth();
  const canRead = hasPermission("onboarding.read");
  const canCreate = hasPermission("onboarding.create");
  const canUpdate = hasPermission("onboarding.update");
  const canChangeStatus = hasPermission("onboarding.status.change");
  const canManageTasks = hasPermission("onboarding.task.manage");

  const [plans, setPlans] = useState<OnboardingPlan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    try {
      const result = await listOnboardingPlans({
        page,
        size: PAGE_SIZE,
        status: (status as OnboardingStatus) || undefined,
      });
      const query = search.trim().toLowerCase();
      const data = query
        ? result.data.filter((plan) =>
            [plan.employeeName, plan.employeeNumber, plan.name]
              .join(" ")
              .toLowerCase()
              .includes(query),
          )
        : result.data;
      setPlans(data);
      setTotalItems(result.meta.totalItems);
      setTotalPages(Math.max(1, result.meta.totalPages));
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Could not load onboarding plans.",
      });
    } finally {
      setLoading(false);
    }
  }, [canRead, page, status, search]);

  const loadMeta = useCallback(async () => {
    if (!canRead) return;
    try {
      const [emps, inProgress, completed] = await Promise.all([
        listEmployees({ page: 1, size: 100 }),
        listOnboardingPlans({ page: 1, size: 1, status: "IN_PROGRESS" }),
        listOnboardingPlans({ page: 1, size: 1, status: "COMPLETED" }),
      ]);
      setEmployees(emps.data);
      setInProgressCount(inProgress.meta.totalItems);
      setCompletedCount(completed.meta.totalItems);
    } catch {
      // Non-blocking.
    }
  }, [canRead]);

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
          onboarding.read
        </code>{" "}
        to view onboarding..
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
            <span className="text-[var(--foreground)]">Onboarding</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Create plans for new hires, track required tasks, then mark the plan
            complete when everything required is done.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717] hover:bg-[#e9b600]"
          >
            <Plus size={17} />
            Start onboarding
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
        <StatCard
          label="Matching plans"
          value={totalItems}
          note="For current filters"
          tone="yellow"
          icon={<ClipboardList size={18} />}
        />
        <StatCard
          label="In progress"
          value={inProgressCount}
          note="Active onboarding"
          tone="amber"
          icon={<ClipboardList size={18} />}
        />
        <StatCard
          label="Completed"
          value={completedCount}
          note="Finished plans"
          tone="green"
          icon={<CheckCircle2 size={18} />}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_220px]">
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
                placeholder="Filter this page by employee or plan…"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-sm outline-none focus:border-[#FDC517]"
              />
            </label>
            <label className="relative block">
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 pr-9 text-sm outline-none focus:border-[#FDC517]"
              >
                <option value="">All statuses</option>
                {PLAN_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {formatPlanStatus(item)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface)]/80 text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3 font-medium sm:px-6">Employee</th>
                <th className="px-5 py-3 font-medium sm:px-6">Plan</th>
                <th className="px-5 py-3 font-medium sm:px-6">Start</th>
                <th className="px-5 py-3 font-medium sm:px-6">Tasks</th>
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
              ) : plans.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-[var(--muted)]"
                  >
                    No onboarding plans yet. Create one for a pending or new
                    employee.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => {
                  const done = plan.tasks.filter(
                    (task) => task.status === "COMPLETED",
                  ).length;
                  return (
                    <tr
                      key={plan.id}
                      className="border-t border-[var(--border)] hover:bg-[var(--surface)]/40"
                    >
                      <td className="px-5 py-3.5 sm:px-6">
                        <p className="font-medium">{plan.employeeName}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {plan.employeeNumber}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">{plan.name}</td>
                      <td className="px-5 py-3.5 text-[var(--muted)] sm:px-6">
                        {formatDate(plan.startDate)}
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">
                        {done}/{plan.tasks.length}
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${planStatusStyles[plan.status]}`}
                        >
                          {formatPlanStatus(plan.status)}
                        </span>
                      </td>
                      <td className="relative px-5 py-3.5 text-right sm:px-6">
                        <button
                          type="button"
                          aria-label="Actions"
                          onClick={() =>
                            setMenuFor(menuFor === plan.id ? null : plan.id)
                          }
                          className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)]"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {menuFor === plan.id && (
                          <div className="absolute right-8 top-12 z-20 w-44 rounded-xl border border-[var(--border)] bg-white p-1.5 text-left shadow-xl">
                            <MenuItem
                              icon={<Eye size={14} />}
                              label="Open plan"
                              onClick={() => {
                                setMenuFor(null);
                                setModal({ type: "detail", planId: plan.id });
                              }}
                            />
                            {canUpdate &&
                              plan.status !== "COMPLETED" &&
                              plan.status !== "CANCELLED" && (
                                <MenuItem
                                  icon={<Pencil size={14} />}
                                  label="Edit plan"
                                  onClick={() => {
                                    setMenuFor(null);
                                    setModal({ type: "edit", plan });
                                  }}
                                />
                              )}
                            {canChangeStatus &&
                              nextPlanStatuses(plan.status).length > 0 && (
                                <MenuItem
                                  icon={<CheckCircle2 size={14} />}
                                  label="Change status"
                                  onClick={() => {
                                    setMenuFor(null);
                                    setModal({ type: "status", plan });
                                  }}
                                />
                              )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      {modal?.type === "create" && canCreate && (
        <PlanFormModal
          title="Start onboarding"
          employees={employees}
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            await createOnboardingPlan(values);
            setModal(null);
            setNotice({ tone: "ok", text: "Onboarding plan created." });
            setPage(1);
            await load();
            await loadMeta();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "edit" && canUpdate && (
        <PlanFormModal
          title="Edit onboarding plan"
          employees={employees}
          initial={modal.plan}
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            const body: UpdateOnboardingInput = {
              name: values.name,
              notes: values.notes || null,
              startDate: values.startDate,
              targetCompletionDate: values.targetCompletionDate || null,
            };
            await updateOnboardingPlan(modal.plan.id, body);
            setModal(null);
            setNotice({ tone: "ok", text: "Plan updated." });
            await load();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "status" && canChangeStatus && (
        <PlanStatusModal
          plan={modal.plan}
          onClose={() => setModal(null)}
          onSubmit={async (nextStatus, reason) => {
            await changeOnboardingStatus(modal.plan.id, {
              status: nextStatus,
              reason: reason || undefined,
            });
            setModal(null);
            setNotice({ tone: "ok", text: "Plan status updated." });
            await load();
            await loadMeta();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "detail" && (
        <PlanDetailModal
          planId={modal.planId}
          canManageTasks={canManageTasks}
          canChangeStatus={canChangeStatus}
          onClose={() => setModal(null)}
          onChanged={async () => {
            await load();
            await loadMeta();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
          onOk={(text) => setNotice({ tone: "ok", text })}
        />
      )}
    </div>
  );
}

function PlanFormModal({
  title,
  employees,
  initial,
  onClose,
  onSubmit,
  onError,
}: {
  title: string;
  employees: Employee[];
  initial?: OnboardingPlan;
  onClose: () => void;
  onSubmit: (values: CreateOnboardingInput) => Promise<void>;
  onError: (message: string) => void;
}) {
  const editing = Boolean(initial);
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? "");
  const [name, setName] = useState(initial?.name ?? "Standard employee onboarding");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [startDate, setStartDate] = useState(
    initial ? toDateInput(initial.startDate) : toDateInput(new Date().toISOString()),
  );
  const [targetCompletionDate, setTargetCompletionDate] = useState(
    initial?.targetCompletionDate
      ? toDateInput(initial.targetCompletionDate)
      : "",
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!editing && !employeeId) {
      onError("Select an employee.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        employeeId: editing ? initial!.employeeId : employeeId,
        name: name.trim(),
        notes: notes.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        targetCompletionDate: targetCompletionDate
          ? new Date(targetCompletionDate).toISOString()
          : undefined,
      });
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!editing && (
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
                  · {employee.employeeNumber} ({employee.status})
                </option>
              ))}
            </select>
          </label>
        )}
        <Field label="Plan name" required value={name} onChange={setName} />
        <Field
          label="Start date"
          required
          type="date"
          value={startDate}
          onChange={setStartDate}
        />
        <Field
          label="Target completion (optional)"
          type="date"
          value={targetCompletionDate}
          onChange={setTargetCompletionDate}
        />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[#FDC517]"
          />
        </label>
        <ModalActions
          saving={saving}
          onClose={onClose}
          submitLabel={editing ? "Save changes" : "Create plan"}
        />
      </form>
    </ModalShell>
  );
}

function PlanStatusModal({
  plan,
  onClose,
  onSubmit,
  onError,
}: {
  plan: OnboardingPlan;
  onClose: () => void;
  onSubmit: (status: OnboardingStatus, reason: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const options = nextPlanStatuses(plan.status);
  const [status, setStatus] = useState<OnboardingStatus>(
    options[0] ?? plan.status,
  );
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(status, reason.trim());
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : "Status change failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={`Change status · ${plan.name}`} onClose={onClose}>
      {options.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No further transitions from {formatPlanStatus(plan.status)}.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-[var(--muted)]">
            Current:{" "}
            <strong className="text-[var(--foreground)]">
              {formatPlanStatus(plan.status)}
            </strong>
            . Completing requires all required tasks to be completed.
          </p>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">New status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as OnboardingStatus)
              }
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
            >
              {options.map((item) => (
                <option key={item} value={item}>
                  {formatPlanStatus(item)}
                </option>
              ))}
            </select>
          </label>
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

function PlanDetailModal({
  planId,
  canManageTasks,
  canChangeStatus,
  onClose,
  onChanged,
  onError,
  onOk,
}: {
  planId: string;
  canManageTasks: boolean;
  canChangeStatus: boolean;
  onClose: () => void;
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
  onOk: (message: string) => void;
}) {
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setPlan(await getOnboardingPlan(planId));
    } catch (error) {
      onError(
        error instanceof ApiError
          ? error.message
          : "Could not load onboarding plan.",
      );
      onClose();
    } finally {
      setLoading(false);
    }
  }, [planId, onClose, onError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function addTask(event: FormEvent) {
    event.preventDefault();
    if (!plan || !title.trim()) return;
    setSaving(true);
    try {
      await createOnboardingTask(plan.id, {
        title: title.trim(),
        category: category.trim() || undefined,
        isRequired,
      });
      setTitle("");
      setCategory("");
      setIsRequired(true);
      onOk("Task added.");
      await reload();
      await onChanged();
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Could not add task.");
    } finally {
      setSaving(false);
    }
  }

  async function setTaskStatus(task: OnboardingTask, status: OnboardingTaskStatus) {
    if (!plan) return;
    try {
      await changeOnboardingTaskStatus(plan.id, task.id, { status });
      onOk(`Task marked ${formatTaskStatus(status).toLowerCase()}.`);
      await reload();
      await onChanged();
    } catch (error) {
      onError(
        error instanceof ApiError
          ? error.message
          : "Could not update task status.",
      );
    }
  }

  async function startPlan() {
    if (!plan) return;
    try {
      await changeOnboardingStatus(plan.id, { status: "IN_PROGRESS" });
      onOk("Plan started.");
      await reload();
      await onChanged();
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : "Could not start plan.",
      );
    }
  }

  return (
    <ModalShell title="Onboarding plan" onClose={onClose} wide>
      {loading || !plan ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold">{plan.name}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {plan.employeeName} · {plan.employeeNumber}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Starts {formatDate(plan.startDate)}
                {plan.targetCompletionDate
                  ? ` · Target ${formatDate(plan.targetCompletionDate)}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${planStatusStyles[plan.status]}`}
              >
                {formatPlanStatus(plan.status)}
              </span>
              {canChangeStatus && plan.status === "NOT_STARTED" && (
                <button
                  type="button"
                  onClick={() => void startPlan()}
                  className="rounded-lg bg-[#111115] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Start plan
                </button>
              )}
            </div>
          </div>

          {plan.notes && (
            <p className="rounded-xl bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
              {plan.notes}
            </p>
          )}

          <div>
            <h3 className="text-sm font-semibold">Tasks</h3>
            <div className="mt-3 space-y-2">
              {plan.tasks.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  No tasks yet. Add checklist items below.
                </p>
              ) : (
                plan.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {task.title}
                        {task.isRequired && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-700">
                            Required
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatTaskStatus(task.status)}
                        {task.category ? ` · ${task.category}` : ""}
                      </p>
                    </div>
                    {canManageTasks &&
                      plan.status !== "COMPLETED" &&
                      plan.status !== "CANCELLED" && (
                        <div className="flex flex-wrap gap-1">
                          {nextTaskStatuses(task).map((next) => (
                            <button
                              key={next}
                              type="button"
                              onClick={() => void setTaskStatus(task, next)}
                              className="rounded-lg border border-[var(--border)] px-2 py-1 text-[11px] hover:bg-[var(--surface)]"
                            >
                              {formatTaskStatus(next)}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>
          </div>

          {canManageTasks &&
            plan.status !== "COMPLETED" &&
            plan.status !== "CANCELLED" && (
              <form
                onSubmit={addTask}
                className="space-y-3 rounded-xl border border-dashed border-[var(--border)] p-3"
              >
                <p className="text-xs font-medium text-[var(--muted)]">
                  Add task
                </p>
                <Field
                  label="Title"
                  required
                  value={title}
                  onChange={setTitle}
                  placeholder="Complete IT equipment setup"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                  <Field
                    label="Category"
                    value={category}
                    onChange={setCategory}
                    placeholder="IT"
                  />
                  <label className="flex items-end gap-2 pb-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isRequired}
                      onChange={(event) => setIsRequired(event.target.checked)}
                    />
                    Required
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#111115] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Adding…" : "Add task"}
                </button>
              </form>
            )}
        </div>
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

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-[var(--surface)]"
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  note,
  tone,
  icon,
}: {
  label: string;
  value: number;
  note: string;
  tone: "yellow" | "amber" | "green";
  icon: ReactNode;
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

function formatPlanStatus(status: OnboardingStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTaskStatus(status: OnboardingTaskStatus): string {
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

function toDateInput(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function nextPlanStatuses(current: OnboardingStatus): OnboardingStatus[] {
  switch (current) {
    case "NOT_STARTED":
      return ["IN_PROGRESS", "CANCELLED"];
    case "IN_PROGRESS":
      return ["COMPLETED", "CANCELLED"];
    default:
      return [];
  }
}

function nextTaskStatuses(task: OnboardingTask): OnboardingTaskStatus[] {
  const map: Record<OnboardingTaskStatus, OnboardingTaskStatus[]> = {
    PENDING: ["IN_PROGRESS", "COMPLETED", "SKIPPED"],
    IN_PROGRESS: ["PENDING", "COMPLETED", "SKIPPED"],
    COMPLETED: ["IN_PROGRESS"],
    SKIPPED: ["PENDING", "IN_PROGRESS"],
  };
  return map[task.status].filter(
    (status) => !(status === "SKIPPED" && task.isRequired),
  );
}
