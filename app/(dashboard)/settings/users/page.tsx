"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ChevronRight,
  Link2,
  Link2Off,
  Plus,
  RefreshCw,
  Search,
  ShieldPlus,
  UserRoundPlus,
  X,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";
import {
  assignRoleToUser,
  inviteUser,
  linkGoogleIdentity,
  listRoles,
  listUserRoles,
  listUsers,
  removeRoleFromUser,
  unlinkGoogleIdentity,
  updateUser,
} from "@/lib/identity/api";
import type {
  RecordStatus,
  Role,
  RoleAssignment,
  UserAccount,
} from "@/lib/identity/types";

const PAGE_SIZE = 10;

type Notice = { tone: "ok" | "error"; text: string } | null;
type Modal =
  | { type: "invite" }
  | { type: "edit"; user: UserAccount }
  | { type: "link-google"; user: UserAccount }
  | { type: "roles"; user: UserAccount }
  | null;

export default function UsersSettingsPage() {
  const { hasPermission } = useAuth();
  const canRead = hasPermission("identity.user.read");
  const canManage = hasPermission("identity.user.manage");
  const canReadRoles = hasPermission("identity.role.read");
  const canManageRoles = hasPermission("identity.role.manage");

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | RecordStatus>("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [modal, setModal] = useState<Modal>(null);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    try {
      const result = await listUsers({
        page,
        size: PAGE_SIZE,
        search: search.trim() || undefined,
        status: status || undefined,
      });
      setUsers(result.data);
      setTotalItems(result.meta.totalItems);
      setTotalPages(Math.max(1, result.meta.totalPages));
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Could not load users.",
      });
    } finally {
      setLoading(false);
    }
  }, [canRead, page, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canRead) {
    return (
      <PermissionGate
        code="identity.user.read"
        label="view user accounts"
      />
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <Header
        canManage={canManage}
        onInvite={() => setModal({ type: "invite" })}
        onRefresh={() => void load()}
      />

      {notice && <NoticeBanner notice={notice} />}

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <Filters
          search={search}
          status={status}
          totalItems={totalItems}
          loading={loading}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatus={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />

        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-6 py-16 text-center text-sm text-[var(--muted)]">
              Loading…
            </p>
          ) : users.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-[var(--muted)]">
              No users yet. Invite a Workspace account to enable Google sign-in.
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--surface)]/80 text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium sm:px-6">Email</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Status</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Google</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Updated</th>
                  <th className="px-5 py-3 font-medium sm:px-6" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const google = user.externalIdentities.find(
                    (item) => item.provider === "GOOGLE_WORKSPACE",
                  );
                  return (
                    <tr
                      key={user.id}
                      className="border-t border-[var(--border)] hover:bg-[var(--surface)]/40"
                    >
                      <td className="px-5 py-3.5 sm:px-6">
                        <p className="font-medium">{user.officialEmail}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-[var(--muted)]">
                          {user.id.slice(0, 8)}…
                        </p>
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">
                        <StatusPill status={user.status} />
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">
                        {google ? (
                          <div>
                            <p className="text-emerald-700">Linked</p>
                            <p className="mt-0.5 max-w-[180px] truncate font-mono text-[11px] text-[var(--muted)]">
                              {google.subject}
                            </p>
                          </div>
                        ) : (
                          <span className="text-amber-700">
                            Awaiting first sign-in
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[var(--muted)] sm:px-6">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">
                        <div className="flex justify-end gap-1">
                          {canManage && (
                            <IconButton
                              label="Edit"
                              onClick={() => setModal({ type: "edit", user })}
                            >
                              <Pencil size={15} />
                            </IconButton>
                          )}
                          {canManage && !google && (
                            <IconButton
                              label="Link Google"
                              onClick={() =>
                                setModal({ type: "link-google", user })
                              }
                            >
                              <Link2 size={15} />
                            </IconButton>
                          )}
                          {canManage && google && (
                            <IconButton
                              label="Unlink Google"
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    `Unlink Google for ${user.officialEmail}? They will not be able to sign in until re-linked.`,
                                  )
                                ) {
                                  return;
                                }
                                try {
                                  await unlinkGoogleIdentity(user.id);
                                  setNotice({
                                    tone: "ok",
                                    text: "Google identity unlinked.",
                                  });
                                  await load();
                                } catch (error) {
                                  setNotice({
                                    tone: "error",
                                    text:
                                      error instanceof ApiError
                                        ? error.message
                                        : "Unlink failed.",
                                  });
                                }
                              }}
                            >
                              <Link2Off size={15} />
                            </IconButton>
                          )}
                          {(canReadRoles || canManageRoles) && (
                            <IconButton
                              label="Roles"
                              onClick={() => setModal({ type: "roles", user })}
                            >
                              <ShieldPlus size={15} />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <Pager
          page={page}
          totalPages={totalPages}
          loading={loading}
          onPage={setPage}
        />
      </section>

      {modal?.type === "invite" && canManage && (
        <InviteModal
          onClose={() => setModal(null)}
          onSaved={async (message) => {
            setModal(null);
            setNotice({ tone: "ok", text: message });
            setPage(1);
            await load();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "edit" && canManage && (
        <EditUserModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={async (message) => {
            setModal(null);
            setNotice({ tone: "ok", text: message });
            await load();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "link-google" && canManage && (
        <LinkGoogleModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={async (message) => {
            setModal(null);
            setNotice({ tone: "ok", text: message });
            await load();
          }}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}

      {modal?.type === "roles" && (
        <UserRolesModal
          user={modal.user}
          canManage={canManageRoles}
          onClose={() => setModal(null)}
          onError={(text) => setNotice({ tone: "error", text })}
        />
      )}
    </div>
  );
}

function Header({
  canManage,
  onInvite,
  onRefresh,
}: {
  canManage: boolean;
  onInvite: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
          <span>Administration</span>
          <ChevronRight size={13} />
          <span className="text-[var(--foreground)]">Users</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Invite by Workspace email. Google identity is linked automatically on
          their first sign-in. Manual Google link remains available if needed.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-hover)]"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
        {canManage && (
          <button
            type="button"
            onClick={onInvite}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717] hover:bg-[#e9b600]"
          >
            <UserRoundPlus size={17} />
            Invite user
          </button>
        )}
      </div>
    </div>
  );
}

function Filters({
  search,
  status,
  totalItems,
  loading,
  onSearch,
  onStatus,
}: {
  search: string;
  status: "" | RecordStatus;
  totalItems: number;
  loading: boolean;
  onSearch: (value: string) => void;
  onStatus: (value: "" | RecordStatus) => void;
}) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 px-5 py-4 sm:px-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_auto]">
        <label className="relative block">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by email…"
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-9 text-sm outline-none focus:border-[#FDC517]"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            >
              <X size={15} />
            </button>
          )}
        </label>
        <select
          value={status}
          onChange={(event) =>
            onStatus(event.target.value as "" | RecordStatus)
          }
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus:border-[#FDC517]"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <div className="flex items-center text-xs text-[var(--muted)]">
          {loading ? "Loading…" : `${totalItems} user(s)`}
        </div>
      </div>
    </div>
  );
}

function InviteModal({
  onClose,
  onSaved,
  onError,
}: {
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [officialEmail, setOfficialEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await inviteUser({
        officialEmail: officialEmail.trim(),
      });
      await onSaved(
        "User invited and email sent (if mail is configured). They sign in with Google using this Workspace email; the account links on first login.",
      );
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : "Invite failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Invite Workspace user" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="rounded-xl border border-[#F0D77B] bg-[#FFF9DF] px-3 py-2.5 text-xs leading-5 text-[#6C5700]">
          Enter their Workspace email only. The account starts inactive and is
          activated when they sign in with Google for the first time — Google&apos;s
          account ID is linked automatically then. No public signup.
        </p>
        <Field
          label="Workspace email"
          required
          type="email"
          value={officialEmail}
          onChange={setOfficialEmail}
          placeholder="ada@neukleos.com"
        />
        <ModalActions
          saving={saving}
          onClose={onClose}
          submitLabel="Invite user"
        />
      </form>
    </ModalShell>
  );
}

function EditUserModal({
  user,
  onClose,
  onSaved,
  onError,
}: {
  user: UserAccount;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [officialEmail, setOfficialEmail] = useState(user.officialEmail);
  const [status, setStatus] = useState<RecordStatus>(user.status);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateUser(user.id, {
        officialEmail: officialEmail.trim(),
        status,
      });
      await onSaved("User updated.");
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : "Update failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Edit user" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Official email"
          required
          type="email"
          value={officialEmail}
          onChange={setOfficialEmail}
        />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as RecordStatus)
            }
            className="h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517]"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </label>
        <ModalActions saving={saving} onClose={onClose} submitLabel="Save" />
      </form>
    </ModalShell>
  );
}

function LinkGoogleModal({
  user,
  onClose,
  onSaved,
  onError,
}: {
  user: UserAccount;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState(user.officialEmail);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await linkGoogleIdentity(user.id, {
        subject: subject.trim(),
        email: email.trim() || undefined,
      });
      await onSaved("Google identity linked.");
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Link failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={`Link Google · ${user.officialEmail}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Google subject (sub)"
          required
          value={subject}
          onChange={setSubject}
          mono
        />
        <Field
          label="Google email"
          type="email"
          value={email}
          onChange={setEmail}
        />
        <ModalActions
          saving={saving}
          onClose={onClose}
          submitLabel="Link Google"
        />
      </form>
    </ModalShell>
  );
}

function UserRolesModal({
  user,
  canManage,
  onClose,
  onError,
}: {
  user: UserAccount;
  canManage: boolean;
  onClose: () => void;
  onError: (message: string) => void;
}) {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [assigned, available] = await Promise.all([
        listUserRoles(user.id, { page: 1, size: 50 }),
        listRoles({ page: 1, size: 100 }),
      ]);
      setAssignments(assigned.data);
      setRoles(available.data);
    } catch (error) {
      onError(
        error instanceof ApiError
          ? error.message
          : "Could not load role assignments.",
      );
    } finally {
      setLoading(false);
    }
  }, [user.id, onError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <ModalShell title={`Roles · ${user.officialEmail}`} onClose={onClose}>
      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-2">
            {assignments.length === 0 && (
              <li className="text-sm text-[var(--muted)]">No active roles.</li>
            )}
            {assignments.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium">{item.roleName}</p>
                  <p className="font-mono text-[11px] text-[var(--muted)]">
                    {item.roleCode}
                  </p>
                </div>
                {canManage && (
                  <button
                    type="button"
                    className="text-xs text-red-700 hover:underline"
                    onClick={async () => {
                      try {
                        await removeRoleFromUser(user.id, item.roleId);
                        await reload();
                      } catch (error) {
                        onError(
                          error instanceof ApiError
                            ? error.message
                            : "Could not remove role.",
                        );
                      }
                    }}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          {canManage && (
            <div className="flex gap-2">
              <select
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
                className="h-11 flex-1 rounded-xl border border-[var(--border)] px-3 text-sm outline-none focus:border-[#FDC517]"
              >
                <option value="">Assign a role…</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!roleId}
                onClick={async () => {
                  try {
                    await assignRoleToUser(user.id, roleId);
                    setRoleId("");
                    await reload();
                  } catch (error) {
                    onError(
                      error instanceof ApiError
                        ? error.message
                        : "Could not assign role.",
                    );
                  }
                }}
                className="rounded-xl bg-[#111115] px-4 text-sm font-medium text-white disabled:opacity-40"
              >
                Assign
              </button>
            </div>
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

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  mono?: boolean;
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
        className={`h-11 w-full rounded-xl border border-[var(--border)] px-3 outline-none focus:border-[#FDC517] ${
          mono ? "font-mono text-xs" : ""
        }`}
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

function StatusPill({ status }: { status: RecordStatus }) {
  const styles: Record<RecordStatus, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    INACTIVE: "bg-neutral-100 text-neutral-600",
    ARCHIVED: "bg-amber-50 text-amber-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
    >
      {children}
    </button>
  );
}

function NoticeBanner({ notice }: { notice: Exclude<Notice, null> }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        notice.tone === "ok"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {notice.text}
    </div>
  );
}

function Pager({
  page,
  totalPages,
  loading,
  onPage,
}: {
  page: number;
  totalPages: number;
  loading: boolean;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4 sm:px-6">
      <p className="text-xs text-[var(--muted)]">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPage(Math.max(1, page - 1))}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function PermissionGate({ code, label }: { code: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-sm text-[var(--muted)]">
      You need{" "}
      <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs">
        {code}
      </code>{" "}
      to {label}.
    </div>
  );
}
