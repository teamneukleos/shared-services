import { apiRequest, apiRequestPaginated } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/types";
import type {
  BusinessUnit,
  Department,
  Position,
  Team,
} from "./types";

function withQuery(
  path: string,
  query: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function listBusinessUnits(query: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<Paginated<BusinessUnit>> {
  return apiRequestPaginated(
    withQuery("/organisation/business-units", query),
  );
}

export function createBusinessUnit(body: {
  name: string;
  code: string;
}): Promise<BusinessUnit> {
  return apiRequest("/organisation/business-units", {
    method: "POST",
    body,
  });
}

export function updateBusinessUnit(
  id: string,
  body: { name?: string; code?: string },
): Promise<BusinessUnit> {
  return apiRequest(`/organisation/business-units/${id}`, {
    method: "PATCH",
    body,
  });
}

export function deleteBusinessUnit(id: string): Promise<BusinessUnit> {
  return apiRequest(`/organisation/business-units/${id}`, {
    method: "DELETE",
  });
}

export function listDepartments(query: {
  page?: number;
  size?: number;
  search?: string;
  businessUnitId?: string;
}): Promise<Paginated<Department>> {
  return apiRequestPaginated(withQuery("/organisation/departments", query));
}

export function createDepartment(body: {
  businessUnitId: string;
  name: string;
  code: string;
}): Promise<Department> {
  return apiRequest("/organisation/departments", {
    method: "POST",
    body,
  });
}

export function updateDepartment(
  id: string,
  body: { businessUnitId?: string; name?: string; code?: string },
): Promise<Department> {
  return apiRequest(`/organisation/departments/${id}`, {
    method: "PATCH",
    body,
  });
}

export function deleteDepartment(id: string): Promise<Department> {
  return apiRequest(`/organisation/departments/${id}`, {
    method: "DELETE",
  });
}

export function listTeams(query: {
  page?: number;
  size?: number;
  search?: string;
  departmentId?: string;
}): Promise<Paginated<Team>> {
  return apiRequestPaginated(withQuery("/organisation/teams", query));
}

export function createTeam(body: {
  departmentId: string;
  name: string;
  code: string;
}): Promise<Team> {
  return apiRequest("/organisation/teams", {
    method: "POST",
    body,
  });
}

export function updateTeam(
  id: string,
  body: { departmentId?: string; name?: string; code?: string },
): Promise<Team> {
  return apiRequest(`/organisation/teams/${id}`, {
    method: "PATCH",
    body,
  });
}

export function deleteTeam(id: string): Promise<Team> {
  return apiRequest(`/organisation/teams/${id}`, {
    method: "DELETE",
  });
}

export function listPositions(query: {
  page?: number;
  size?: number;
  search?: string;
  departmentId?: string;
}): Promise<Paginated<Position>> {
  return apiRequestPaginated(withQuery("/organisation/positions", query));
}

export function createPosition(body: {
  departmentId: string;
  title: string;
  code: string;
}): Promise<Position> {
  return apiRequest("/organisation/positions", {
    method: "POST",
    body,
  });
}

export function updatePosition(
  id: string,
  body: { departmentId?: string; title?: string; code?: string },
): Promise<Position> {
  return apiRequest(`/organisation/positions/${id}`, {
    method: "PATCH",
    body,
  });
}

export function deletePosition(id: string): Promise<Position> {
  return apiRequest(`/organisation/positions/${id}`, {
    method: "DELETE",
  });
}
