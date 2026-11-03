"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Building2,
  ChevronRight,
  Layers3,
  Network,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UsersRound,
  BriefcaseBusiness,
  X,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";
import {
  createBusinessUnit,
  createDepartment,
  createPosition,
  createTeam,
  deleteBusinessUnit,
  deleteDepartment,
  deletePosition,
  deleteTeam,
  listBusinessUnits,
  listDepartments,
  listPositions,
  listTeams,
  updateBusinessUnit,
  updateDepartment,
  updatePosition,
  updateTeam,
} from "@/lib/organisation/api";
import type {
  BusinessUnit,
  Department,
  Position,
  StructureTab,
  Team,
} from "@/lib/organisation/types";

const PAGE_SIZE = 10;

type Notice = { tone: "ok" | "error"; text: string } | null;

type EditorState =
  | { kind: "business-unit"; mode: "create" | "edit"; item?: BusinessUnit }
  | { kind: "department"; mode: "create" | "edit"; item?: Department }
  | { kind: "team"; mode: "create" | "edit"; item?: Team }
  | { kind: "position"; mode: "create" | "edit"; item?: Position }
  | null;

function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "_");
}

export default function OrganisationPage() {
  const { hasPermission } = useAuth();
  const canRead = hasPermission("organisation.structure.read");
  const canManage = hasPermission("organisation.structure.manage");

  const [tab, setTab] = useState<StructureTab>("business-units");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [editor, setEditor] = useState<EditorState>(null);

  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filterBusinessUnitId, setFilterBusinessUnitId] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");

  const [allBusinessUnits, setAllBusinessUnits] = useState<BusinessUnit[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);

  const loadLookups = useCallback(async () => {
    if (!canRead) return;
    try {
      const [bu, dept] = await Promise.all([
        listBusinessUnits({ page: 1, size: 100 }),
        listDepartments({ page: 1, size: 100 }),
      ]);
      setAllBusinessUnits(bu.data);
      setAllDepartments(dept.data);
    } catch {
      // Lookups are best-effort for filters/forms.
    }
  }, [canRead]);

  const loadTab = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    setNotice(null);
    try {
      if (tab === "business-units") {
        const result = await listBusinessUnits({
          page,
          size: PAGE_SIZE,
          search: search.trim() || undefined,
        });
        setBusinessUnits(result.data);
        setTotalItems(result.meta.totalItems);
        setTotalPages(Math.max(1, result.meta.totalPages));
      } else if (tab === "departments") {
        const result = await listDepartments({
          page,
          size: PAGE_SIZE,
          search: search.trim() || undefined,
          businessUnitId: filterBusinessUnitId || undefined,
        });
        setDepartments(result.data);
        setTotalItems(result.meta.totalItems);
        setTotalPages(Math.max(1, result.meta.totalPages));
      } else if (tab === "teams") {
        const result = await listTeams({
          page,
          size: PAGE_SIZE,
          search: search.trim() || undefined,
          departmentId: filterDepartmentId || undefined,
        });
        setTeams(result.data);
        setTotalItems(result.meta.totalItems);
        setTotalPages(Math.max(1, result.meta.totalPages));
      } else {
        const result = await listPositions({
          page,
          size: PAGE_SIZE,
          search: search.trim() || undefined,
          departmentId: filterDepartmentId || undefined,
        });
        setPositions(result.data);
        setTotalItems(result.meta.totalItems);
        setTotalPages(Math.max(1, result.meta.totalPages));
      }
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Could not load organisation structure.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    canRead,
    tab,
    page,
    search,
    filterBusinessUnitId,
    filterDepartmentId,
  ]);

  useEffect(() => {
    void loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    void loadTab();
  }, [loadTab]);

  const tabs = useMemo(
    () =>
      [
        {
          id: "business-units" as const,
          label: "Business units",
          icon: Building2,
        },
        {
          id: "departments" as const,
          label: "Departments",
          icon: Layers3,
        },
        { id: "teams" as const, label: "Teams", icon: UsersRound },
        {
          id: "positions" as const,
          label: "Positions",
          icon: BriefcaseBusiness,
        },
      ] as const,
    [],
  );

  function switchTab(next: StructureTab) {
    setTab(next);
    setPage(1);
    setSearch("");
    setFilterBusinessUnitId("");
    setFilterDepartmentId("");
    setEditor(null);
  }

  async function handleDelete(
    kind: StructureTab,
    id: string,
    label: string,
  ) {
    if (!canManage) return;
    const confirmed = window.confirm(
      `Delete ${label}? This fails if dependent records still reference it.`,
    );
    if (!confirmed) return;

    try {
      if (kind === "business-units") await deleteBusinessUnit(id);
      if (kind === "departments") await deleteDepartment(id);
      if (kind === "teams") await deleteTeam(id);
      if (kind === "positions") await deletePosition(id);
      setNotice({ tone: "ok", text: `${label} deleted.` });
      await Promise.all([loadTab(), loadLookups()]);
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof ApiError
            ? error.message
            : `Could not delete ${label}.`,
      });
    }
  }

  if (!canRead) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-sm text-[var(--muted)]">
        You need the{" "}
        <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">
          organisation.structure.read
        </code>{" "}
        permission to view organisation structure. Sync permissions and ensure
        your role includes it.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
            <span>Administration</span>
            <ChevronRight size={13} />
            <span className="text-[var(--foreground)]">Organisation</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Organisation structure
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Business unit → department → team / position. These records power
            employee placement and later HR workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void Promise.all([loadTab(), loadLookups()])}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--surface-hover)]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          {canManage && (
            <button
              type="button"
              onClick={() => {
                if (tab === "business-units") {
                  setEditor({ kind: "business-unit", mode: "create" });
                } else if (tab === "departments") {
                  setEditor({ kind: "department", mode: "create" });
                } else if (tab === "teams") {
                  setEditor({ kind: "team", mode: "create" });
                } else {
                  setEditor({ kind: "position", mode: "create" });
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717] shadow-sm transition hover:bg-[#e9b600]"
            >
              <Plus size={17} />
              Add{" "}
              {tab === "business-units"
                ? "business unit"
                : tab === "departments"
                  ? "department"
                  : tab === "teams"
                    ? "team"
                    : "position"}
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

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_3px_14px_rgba(0,0,0,0.025)]">
        <div className="flex flex-wrap gap-1 border-b border-[var(--border)] px-3 py-3 sm:px-4">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                  active
                    ? "bg-[#111115] font-medium text-white"
                    : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,1.4fr)_minmax(180px,1fr)_auto]">
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
                placeholder="Search by name or code…"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-9 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[#FDC517] focus:ring-2 focus:ring-[#FDC517]/20"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            {tab === "departments" ? (
              <select
                value={filterBusinessUnitId}
                onChange={(event) => {
                  setFilterBusinessUnitId(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus:border-[#FDC517]"
              >
                <option value="">All business units</option>
                {allBusinessUnits.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            ) : tab === "teams" || tab === "positions" ? (
              <select
                value={filterDepartmentId}
                onChange={(event) => {
                  setFilterDepartmentId(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus:border-[#FDC517]"
              >
                <option value="">All departments</option>
                {allDepartments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            ) : (
              <div className="hidden md:block" />
            )}

            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <Network size={14} />
              {loading ? "Loading…" : `${totalItems} record(s)`}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {tab === "business-units" && (
            <StructureTable
              loading={loading}
              empty="No business units yet."
              headers={["Name", "Code", "Departments", "Updated", ""]}
              rows={businessUnits.map((item) => [
                item.name,
                item.code,
                String(item.departmentCount),
                new Date(item.updatedAt).toLocaleDateString(),
                canManage ? (
                  <RowActions
                    key={item.id}
                    onEdit={() =>
                      setEditor({
                        kind: "business-unit",
                        mode: "edit",
                        item,
                      })
                    }
                    onDelete={() =>
                      void handleDelete(
                        "business-units",
                        item.id,
                        item.name,
                      )
                    }
                  />
                ) : null,
              ])}
            />
          )}

          {tab === "departments" && (
            <StructureTable
              loading={loading}
              empty="No departments yet."
              headers={["Name", "Code", "Business unit", "Teams", "Positions", ""]}
              rows={departments.map((item) => [
                item.name,
                item.code,
                item.businessUnitCode,
                String(item.teamCount),
                String(item.positionCount),
                canManage ? (
                  <RowActions
                    key={item.id}
                    onEdit={() =>
                      setEditor({
                        kind: "department",
                        mode: "edit",
                        item,
                      })
                    }
                    onDelete={() =>
                      void handleDelete("departments", item.id, item.name)
                    }
                  />
                ) : null,
              ])}
            />
          )}

          {tab === "teams" && (
            <StructureTable
              loading={loading}
              empty="No teams yet."
              headers={["Name", "Code", "Department", ""]}
              rows={teams.map((item) => [
                item.name,
                item.code,
                item.departmentCode,
                canManage ? (
                  <RowActions
                    key={item.id}
                    onEdit={() =>
                      setEditor({ kind: "team", mode: "edit", item })
                    }
                    onDelete={() =>
                      void handleDelete("teams", item.id, item.name)
                    }
                  />
                ) : null,
              ])}
            />
          )}

          {tab === "positions" && (
            <StructureTable
              loading={loading}
              empty="No positions yet."
              headers={["Title", "Code", "Department", ""]}
              rows={positions.map((item) => [
                item.title,
                item.code,
                item.departmentCode,
                canManage ? (
                  <RowActions
                    key={item.id}
                    onEdit={() =>
                      setEditor({ kind: "position", mode: "edit", item })
                    }
                    onDelete={() =>
                      void handleDelete("positions", item.id, item.title)
                    }
                  />
                ) : null,
              ])}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4 sm:px-6">
          <p className="text-xs text-[var(--muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {editor && canManage && (
        <StructureEditorModal
          state={editor}
          businessUnits={allBusinessUnits}
          departments={allDepartments}
          onClose={() => setEditor(null)}
          onSaved={async (message) => {
            setEditor(null);
            setNotice({ tone: "ok", text: message });
            await Promise.all([loadTab(), loadLookups()]);
          }}
          onError={(message) => setNotice({ tone: "error", text: message })}
        />
      )}
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        aria-label="Edit"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-700"
        aria-label="Delete"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function StructureTable({
  headers,
  rows,
  loading,
  empty,
}: {
  headers: string[];
  rows: Array<Array<ReactNode>>;
  loading: boolean;
  empty: string;
}) {
  if (loading) {
    return (
      <div className="px-6 py-16 text-center text-sm text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-sm text-[var(--muted)]">
        {empty}
      </div>
    );
  }

  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-[var(--surface)]/80 text-xs uppercase tracking-wide text-[var(--muted)]">
        <tr>
          {headers.map((header) => (
            <th key={header || "actions"} className="px-5 py-3 font-medium sm:px-6">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={index}
            className="border-t border-[var(--border)] hover:bg-[var(--surface)]/40"
          >
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-5 py-3.5 sm:px-6">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StructureEditorModal({
  state,
  businessUnits,
  departments,
  onClose,
  onSaved,
  onError,
}: {
  state: Exclude<EditorState, null>;
  businessUnits: BusinessUnit[];
  departments: Department[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const isEdit = state.mode === "edit";
  const [name, setName] = useState(
    state.kind === "position"
      ? state.item?.title ?? ""
      : "item" in state && state.item && "name" in state.item
        ? state.item.name
        : "",
  );
  const [code, setCode] = useState(state.item?.code ?? "");
  const [businessUnitId, setBusinessUnitId] = useState(
    state.kind === "department" ? state.item?.businessUnitId ?? "" : "",
  );
  const [departmentId, setDepartmentId] = useState(
    state.kind === "team" || state.kind === "position"
      ? state.item?.departmentId ?? ""
      : "",
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const normalizedCode = normalizeCode(code);
      if (state.kind === "business-unit") {
        if (isEdit && state.item) {
          await updateBusinessUnit(state.item.id, {
            name: name.trim(),
            code: normalizedCode,
          });
          await onSaved("Business unit updated.");
        } else {
          await createBusinessUnit({
            name: name.trim(),
            code: normalizedCode,
          });
          await onSaved("Business unit created.");
        }
      } else if (state.kind === "department") {
        if (!businessUnitId) throw new Error("Select a business unit.");
        if (isEdit && state.item) {
          await updateDepartment(state.item.id, {
            name: name.trim(),
            code: normalizedCode,
            businessUnitId,
          });
          await onSaved("Department updated.");
        } else {
          await createDepartment({
            businessUnitId,
            name: name.trim(),
            code: normalizedCode,
          });
          await onSaved("Department created.");
        }
      } else if (state.kind === "team") {
        if (!departmentId) throw new Error("Select a department.");
        if (isEdit && state.item) {
          await updateTeam(state.item.id, {
            name: name.trim(),
            code: normalizedCode,
            departmentId,
          });
          await onSaved("Team updated.");
        } else {
          await createTeam({
            departmentId,
            name: name.trim(),
            code: normalizedCode,
          });
          await onSaved("Team created.");
        }
      } else {
        if (!departmentId) throw new Error("Select a department.");
        if (isEdit && state.item) {
          await updatePosition(state.item.id, {
            title: name.trim(),
            code: normalizedCode,
            departmentId,
          });
          await onSaved("Position updated.");
        } else {
          await createPosition({
            departmentId,
            title: name.trim(),
            code: normalizedCode,
          });
          await onSaved("Position created.");
        }
      }
    } catch (error) {
      onError(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Save failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  const title =
    state.kind === "business-unit"
      ? isEdit
        ? "Edit business unit"
        : "Add business unit"
      : state.kind === "department"
        ? isEdit
          ? "Edit department"
          : "Add department"
        : state.kind === "team"
          ? isEdit
            ? "Edit team"
            : "Add team"
          : isEdit
            ? "Edit position"
            : "Add position";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {state.kind === "department" && (
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Business unit</span>
              <select
                required
                value={businessUnitId}
                onChange={(event) => setBusinessUnitId(event.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
              >
                <option value="">Select…</option>
                {businessUnits.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            </label>
          )}

          {(state.kind === "team" || state.kind === "position") && (
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Department</span>
              <select
                required
                value={departmentId}
                onChange={(event) => setDepartmentId(event.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
              >
                <option value="">Select…</option>
                {departments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">
              {state.kind === "position" ? "Title" : "Name"}
            </span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={150}
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Code</span>
            <input
              required
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              maxLength={50}
              pattern="[A-Z0-9_-]+"
              title="Uppercase letters, digits, underscore, or hyphen"
              className="h-11 w-full rounded-xl border border-[var(--border)] px-3 font-mono text-sm outline-none focus:border-[#FDC517]"
            />
          </label>

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
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
