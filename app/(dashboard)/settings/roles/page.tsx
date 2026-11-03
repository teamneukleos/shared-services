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
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";
import {
  assignPermissionsToRole,
  createRole,
  deleteRole,
  listPermissions,
  listRoles,
  removePermissionFromRole,
  syncPermissions,
  updateRole,
} from "@/lib/identity/api";
import type { Permission, Role } from "@/lib/identity/types";

const PAGE_SIZE = 10;

type Notice = { tone: "ok" | "error"; text: string } | null;
type Modal =
  | { type: "create" }
  | { type: "edit"; role: Role }
  | { type: "permissions"; role: Role }
  | null;

export default function RolesSettingsPage() {
  const { hasPermission } = useAuth();
  const canRead = hasPermission("identity.role.read");
  const canManage = hasPermission("identity.role.manage");

  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    try {
      const result = await listRoles({
        page,
        size: PAGE_SIZE,
        search: search.trim() || undefined,
      });
      setRoles(result.data);
      setTotalItems(result.meta.totalItems);
      setTotalPages(Math.max(1, result.meta.totalPages));
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Could not load roles.",
      });
    } finally {
      setLoading(false);
    }
  }, [canRead, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canRead) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-sm text-[var(--muted)]">
        You need{" "}
        <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">
          identity.role.read
        </code>{" "}
        to view roles.
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
            <span className="text-[var(--foreground)]">Roles & permissions</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Roles & permissions
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Define org roles and attach permission codes. Assign roles to users
            from the Users screen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-hover)]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          {canManage && (
            <button
              type="button"
              disabled={syncing}
              onClick={async () => {
                setSyncing(true);
                try {
                  const result = await syncPermissions();
                  setNotice({
                    tone: "ok",
                    text: `Permission catalogue synced (${result.created} created, ${result.updated} updated, ${result.total} total).`,
                  });
                } catch (error) {
                  setNotice({
                    tone: "error",
                    text:
                      error instanceof ApiError
                        ? error.message
                        : "Sync failed.",
                  });
                } finally {
                  setSyncing(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              {syncing ? "Syncing…" : "Sync catalogue"}
            </button>
          )}
          {canManage && (
            <button
              type="button"
              onClick={() => setModal({ type: "create" })}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717] hover:bg-[#e9b600]"
            >
              <Plus size={17} />
              Add role
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

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_auto]">
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
                placeholder="Search roles…"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-9 text-sm outline-none focus:border-[#FDC517]"
              />
            </label>
            <div className="flex items-center text-xs text-[var(--muted)]">
              {loading ? "Loading…" : `${totalItems} role(s)`}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-6 py-16 text-center text-sm text-[var(--muted)]">
              Loading…
            </p>
          ) : roles.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-[var(--muted)]">
              No roles yet.
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--surface)]/80 text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium sm:px-6">Name</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Code</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Permissions</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Assignments</th>
                  <th className="px-5 py-3 font-medium sm:px-6" />
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--surface)]/40"
                  >
                    <td className="px-5 py-3.5 font-medium sm:px-6">
                      {role.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs sm:px-6">
                      {role.code}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex max-w-md flex-wrap gap-1">
                        {role.permissions.length === 0 && (
                          <span className="text-[var(--muted)]">None</span>
                        )}
                        {role.permissions.slice(0, 4).map((permission) => (
                          <span
                            key={permission.id}
                            className="rounded-full bg-[var(--surface)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]"
                          >
                            {permission.code}
                          </span>
                        ))}
                        {role.permissions.length > 4 && (
                          <span className="text-xs text-[var(--muted)]">
                            +{role.permissions.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      {role.assignmentCount}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex justify-end gap-1">
                        {canManage && (
                          <>
                            <button
                              type="button"
                              aria-label="Edit"
                              onClick={() =>
                                setModal({ type: "edit", role })
                              }
                              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)]"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              aria-label="Permissions"
                              onClick={() =>
                                setModal({ type: "permissions", role })
                              }
                              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)]"
                            >
                              <ShieldCheck size={15} />
                            </button>
                            <button
                              type="button"
                              aria-label="Delete"
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    `Delete role ${role.name}? Assignments will be removed.`,
                                  )
                                ) {
                                  return;
                                }
                                try {
                                  await deleteRole(role.id);
                                  setNotice({
                                    tone: "ok",
                                    text: "Role deleted.",
                                  });
                                  await load();
                                } catch (error) {
                                  setNotice({
                                    tone: "error",
                                    text:
                                      error instanceof ApiError
                                        ? error.message
                                        : "Delete failed.",
                                  });
                                }
                              }}
                              className="rounded-lg p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {modal?.type === "create" && canManage && (
        <RoleFormModal
          title="Create role"
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            await createRole({
              name: values.name,
              code: values.code,
              permissionCodes: values.permissionCodes,
            });
            setModal(null);
            setNotice({ tone: "ok", text: "Role created." });
            await load();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "edit" && canManage && (
        <RoleFormModal
          title="Edit role"
          initialName={modal.role.name}
          initialCode={modal.role.code}
          codeLocked
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            await updateRole(modal.role.id, { name: values.name });
            setModal(null);
            setNotice({ tone: "ok", text: "Role updated." });
            await load();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "permissions" && canManage && (
        <RolePermissionsModal
          role={modal.role}
          onClose={() => setModal(null)}
          onChanged={async () => {
            setNotice({ tone: "ok", text: "Role permissions updated." });
            await load();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}
    </div>
  );
}

function RoleFormModal({
  title,
  initialName = "",
  initialCode = "",
  codeLocked,
  onClose,
  onSubmit,
  onError,
}: {
  title: string;
  initialName?: string;
  initialCode?: string;
  codeLocked?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    code: string;
    permissionCodes?: string[];
  }) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
      });
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Code</span>
          <input
            required
            disabled={codeLocked}
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            pattern="[A-Z0-9_-]+"
            className="h-11 w-full rounded-xl border border-[var(--border)] px-3 font-mono text-sm outline-none focus:border-[#FDC517] disabled:bg-[var(--surface)]"
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
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RolePermissionsModal({
  role,
  onClose,
  onChanged,
  onError,
}: {
  role: Role;
  onClose: () => void;
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [catalogue, setCatalogue] = useState<Permission[]>([]);
  const [current, setCurrent] = useState<Role>(role);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const assigned = useMemo(
    () => new Set(current.permissions.map((item) => item.code)),
    [current.permissions],
  );

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const result = await listPermissions({ page: 1, size: 100 });
        setCatalogue(result.data);
      } catch (error) {
        onError(
          error instanceof ApiError
            ? error.message
            : "Could not load permission catalogue.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [onError]);

  const filtered = catalogue.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.code.toLowerCase().includes(q) ||
      (item.description ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <Modal title={`Permissions · ${role.name}`} onClose={onClose}>
      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading catalogue…</p>
      ) : (
        <div className="space-y-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter permissions…"
            className="h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm outline-none focus:border-[#FDC517]"
          />
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {filtered.map((permission) => {
              const checked = assigned.has(permission.code);
              return (
                <label
                  key={permission.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm hover:bg-[var(--surface)]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={async () => {
                      try {
                        const updated = checked
                          ? await removePermissionFromRole(
                              current.id,
                              permission.code,
                            )
                          : await assignPermissionsToRole(current.id, [
                              permission.code,
                            ]);
                        setCurrent(updated);
                        await onChanged();
                      } catch (error) {
                        onError(
                          error instanceof ApiError
                            ? error.message
                            : "Could not update permission.",
                        );
                      }
                    }}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-mono text-xs">{permission.code}</span>
                    {permission.description && (
                      <span className="mt-0.5 block text-xs text-[var(--muted)]">
                        {permission.description}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

function Modal({
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
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
