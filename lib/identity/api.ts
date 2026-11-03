import { apiRequest, apiRequestPaginated } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/types";
import type {
  Permission,
  RecordStatus,
  Role,
  RoleAssignment,
  UserAccount,
} from "./types";

function withQuery(
  path: string,
  query: Record<string, string | number | boolean | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function listUsers(query: {
  page?: number;
  size?: number;
  search?: string;
  status?: RecordStatus;
}): Promise<Paginated<UserAccount>> {
  return apiRequestPaginated(withQuery("/identity/users", query));
}

export function inviteUser(body: {
  officialEmail: string;
  googleSubject?: string;
  googleEmail?: string;
  status?: RecordStatus;
  employeeId?: string;
}): Promise<UserAccount> {
  return apiRequest("/identity/users/invite", {
    method: "POST",
    body,
  });
}

export function createUser(body: {
  officialEmail: string;
  status?: RecordStatus;
  employeeId?: string;
}): Promise<UserAccount> {
  return apiRequest("/identity/users", {
    method: "POST",
    body,
  });
}

export function updateUser(
  userId: string,
  body: {
    officialEmail?: string;
    status?: RecordStatus;
    employeeId?: string | null;
  },
): Promise<UserAccount> {
  return apiRequest(`/identity/users/${userId}`, {
    method: "PATCH",
    body,
  });
}

export function linkGoogleIdentity(
  userId: string,
  body: { subject: string; email?: string },
): Promise<UserAccount> {
  return apiRequest(`/identity/users/${userId}/google-identity`, {
    method: "POST",
    body,
  });
}

export function unlinkGoogleIdentity(userId: string): Promise<UserAccount> {
  return apiRequest(`/identity/users/${userId}/google-identity`, {
    method: "DELETE",
  });
}

export function listUserRoles(
  userId: string,
  query: { page?: number; size?: number; includeEnded?: boolean } = {},
): Promise<Paginated<RoleAssignment>> {
  return apiRequestPaginated(
    withQuery(`/identity/users/${userId}/roles`, query),
  );
}

export function assignRoleToUser(
  userId: string,
  roleId: string,
): Promise<RoleAssignment> {
  return apiRequest(`/identity/users/${userId}/roles`, {
    method: "POST",
    body: { roleId },
  });
}

export function removeRoleFromUser(
  userId: string,
  roleId: string,
): Promise<RoleAssignment> {
  return apiRequest(`/identity/users/${userId}/roles/${roleId}`, {
    method: "DELETE",
  });
}

export function listRoles(query: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<Paginated<Role>> {
  return apiRequestPaginated(withQuery("/identity/roles", query));
}

export function getRole(roleId: string): Promise<Role> {
  return apiRequest(`/identity/roles/${roleId}`);
}

export function createRole(body: {
  name: string;
  code: string;
  permissionCodes?: string[];
}): Promise<Role> {
  return apiRequest("/identity/roles", {
    method: "POST",
    body,
  });
}

export function updateRole(
  roleId: string,
  body: { name?: string },
): Promise<Role> {
  return apiRequest(`/identity/roles/${roleId}`, {
    method: "PATCH",
    body,
  });
}

export function deleteRole(roleId: string): Promise<Role> {
  return apiRequest(`/identity/roles/${roleId}`, {
    method: "DELETE",
  });
}

export function assignPermissionsToRole(
  roleId: string,
  permissionCodes: string[],
): Promise<Role> {
  return apiRequest(`/identity/roles/${roleId}/permissions`, {
    method: "POST",
    body: { permissionCodes },
  });
}

export function removePermissionFromRole(
  roleId: string,
  permissionCode: string,
): Promise<Role> {
  return apiRequest(
    `/identity/roles/${roleId}/permissions/${encodeURIComponent(permissionCode)}`,
    { method: "DELETE" },
  );
}

export function listPermissions(query: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<Paginated<Permission>> {
  return apiRequestPaginated(withQuery("/identity/permissions", query));
}

export function syncPermissions(): Promise<{
  created: number;
  updated: number;
  total: number;
}> {
  return apiRequest("/identity/permissions/sync", {
    method: "POST",
  });
}
