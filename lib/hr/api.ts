import { apiRequest, apiRequestPaginated } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/types";
import type {
  CreateEmployeeInput,
  CreateLeaveApplicationInput,
  CreateLeaveBalanceInput,
  CreateLeaveTypeInput,
  CreateOnboardingInput,
  CreateOnboardingTaskInput,
  Employee,
  EmploymentStatus,
  EmploymentType,
  LeaveApplication,
  LeaveBalance,
  LeaveRequestStatus,
  LeaveType,
  OnboardingPlan,
  OnboardingStatus,
  OnboardingTask,
  OnboardingTaskStatus,
  UpdateEmployeeInput,
  UpdateOnboardingInput,
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

export function listEmployees(query: {
  page?: number;
  size?: number;
  search?: string;
  departmentId?: string;
  status?: EmploymentStatus;
  employmentType?: EmploymentType;
  managerId?: string;
}): Promise<Paginated<Employee>> {
  return apiRequestPaginated(withQuery("/hr/employees", query));
}

export function getEmployee(employeeId: string): Promise<Employee> {
  return apiRequest(`/hr/employees/${employeeId}`);
}

export function createEmployee(body: CreateEmployeeInput): Promise<Employee> {
  return apiRequest("/hr/employees", {
    method: "POST",
    body,
  });
}

export function updateEmployee(
  employeeId: string,
  body: UpdateEmployeeInput,
): Promise<Employee> {
  return apiRequest(`/hr/employees/${employeeId}`, {
    method: "PATCH",
    body,
  });
}

export function changeEmployeeStatus(
  employeeId: string,
  body: {
    status: EmploymentStatus;
    terminationDate?: string | null;
    reason?: string;
  },
): Promise<Employee> {
  return apiRequest(`/hr/employees/${employeeId}/status`, {
    method: "PATCH",
    body,
  });
}

export function listOnboardingPlans(query: {
  page?: number;
  size?: number;
  employeeId?: string;
  status?: OnboardingStatus;
  startDateFrom?: string;
  startDateTo?: string;
}): Promise<Paginated<OnboardingPlan>> {
  return apiRequestPaginated(withQuery("/hr/onboarding", query));
}

export function getOnboardingPlan(planId: string): Promise<OnboardingPlan> {
  return apiRequest(`/hr/onboarding/${planId}`);
}

export function createOnboardingPlan(
  body: CreateOnboardingInput,
): Promise<OnboardingPlan> {
  return apiRequest("/hr/onboarding", {
    method: "POST",
    body,
  });
}

export function updateOnboardingPlan(
  planId: string,
  body: UpdateOnboardingInput,
): Promise<OnboardingPlan> {
  return apiRequest(`/hr/onboarding/${planId}`, {
    method: "PATCH",
    body,
  });
}

export function changeOnboardingStatus(
  planId: string,
  body: { status: OnboardingStatus; reason?: string },
): Promise<OnboardingPlan> {
  return apiRequest(`/hr/onboarding/${planId}/status`, {
    method: "PATCH",
    body,
  });
}

export function createOnboardingTask(
  planId: string,
  body: CreateOnboardingTaskInput,
): Promise<OnboardingTask> {
  return apiRequest(`/hr/onboarding/${planId}/tasks`, {
    method: "POST",
    body,
  });
}

export function changeOnboardingTaskStatus(
  planId: string,
  taskId: string,
  body: { status: OnboardingTaskStatus; reason?: string },
): Promise<OnboardingTask> {
  return apiRequest(`/hr/onboarding/${planId}/tasks/${taskId}/status`, {
    method: "PATCH",
    body,
  });
}

export function listLeaveTypes(query: {
  page?: number;
  size?: number;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}): Promise<Paginated<LeaveType>> {
  return apiRequestPaginated(withQuery("/hr/leave-types", query));
}

export function createLeaveType(
  body: CreateLeaveTypeInput,
): Promise<LeaveType> {
  return apiRequest("/hr/leave-types", {
    method: "POST",
    body,
  });
}

export function listLeaveBalances(query: {
  page?: number;
  size?: number;
  employeeId?: string;
  leaveTypeId?: string;
}): Promise<Paginated<LeaveBalance>> {
  return apiRequestPaginated(withQuery("/hr/leave-balances", query));
}

export function createLeaveBalance(
  body: CreateLeaveBalanceInput,
): Promise<LeaveBalance> {
  return apiRequest("/hr/leave-balances", {
    method: "POST",
    body,
  });
}

export function listLeaveApplications(query: {
  page?: number;
  size?: number;
  employeeId?: string;
  leaveTypeId?: string;
  status?: LeaveRequestStatus;
  startDateFrom?: string;
  startDateTo?: string;
}): Promise<Paginated<LeaveApplication>> {
  return apiRequestPaginated(withQuery("/hr/leave-applications", query));
}

export function getLeaveApplication(
  applicationId: string,
): Promise<LeaveApplication> {
  return apiRequest(`/hr/leave-applications/${applicationId}`);
}

export function submitLeaveApplication(
  body: CreateLeaveApplicationInput,
): Promise<LeaveApplication> {
  return apiRequest("/hr/leave-applications", {
    method: "POST",
    body,
  });
}

export function approveLeaveApplication(
  applicationId: string,
): Promise<LeaveApplication> {
  return apiRequest(`/hr/leave-applications/${applicationId}/approve`, {
    method: "PATCH",
  });
}

export function rejectLeaveApplication(
  applicationId: string,
  body: { reason: string },
): Promise<LeaveApplication> {
  return apiRequest(`/hr/leave-applications/${applicationId}/reject`, {
    method: "PATCH",
    body,
  });
}

export function withdrawLeaveApplication(
  applicationId: string,
): Promise<LeaveApplication> {
  return apiRequest(`/hr/leave-applications/${applicationId}/withdraw`, {
    method: "PATCH",
  });
}
