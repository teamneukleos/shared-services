export type EmploymentStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "TERMINATED";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERN"
  | "TEMPORARY"
  | "OTHER";

export type Employee = {
  id: string;
  organisationId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  workEmail: string;
  phone: string | null;
  departmentId: string;
  departmentName: string;
  jobTitle: string;
  positionId: string | null;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  hireDate: string;
  terminationDate: string | null;
  managerId: string | null;
  managerName: string | null;
  userAccountId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmployeeInput = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  workEmail: string;
  phone?: string;
  departmentId: string;
  jobTitle: string;
  positionId?: string;
  teamId?: string;
  employmentType: EmploymentType;
  status?: EmploymentStatus;
  hireDate: string;
  terminationDate?: string;
  managerId?: string;
  userAccountId?: string;
};

export type UpdateEmployeeInput = {
  firstName?: string;
  lastName?: string;
  preferredName?: string | null;
  workEmail?: string;
  phone?: string | null;
  departmentId?: string;
  jobTitle?: string;
  positionId?: string | null;
  teamId?: string | null;
  employmentType?: EmploymentType;
  hireDate?: string;
  terminationDate?: string | null;
  managerId?: string | null;
  userAccountId?: string | null;
};

export type OnboardingStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type OnboardingTaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED";

export type OnboardingTask = {
  id: string;
  planId: string;
  title: string;
  description: string | null;
  category: string | null;
  isRequired: boolean;
  status: OnboardingTaskStatus;
  dueDate: string | null;
  assigneeUserId: string | null;
  completedAt: string | null;
  completedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingPlan = {
  id: string;
  organisationId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  name: string;
  notes: string | null;
  startDate: string;
  targetCompletionDate: string | null;
  completedAt: string | null;
  status: OnboardingStatus;
  coordinatorUserId: string | null;
  tasks: OnboardingTask[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOnboardingInput = {
  employeeId: string;
  name: string;
  notes?: string;
  startDate: string;
  targetCompletionDate?: string;
  coordinatorUserId?: string;
};

export type UpdateOnboardingInput = {
  name?: string;
  notes?: string | null;
  startDate?: string;
  targetCompletionDate?: string | null;
  coordinatorUserId?: string | null;
};

export type CreateOnboardingTaskInput = {
  title: string;
  description?: string;
  category?: string;
  isRequired?: boolean;
  dueDate?: string;
  assigneeUserId?: string;
};

export type LeaveRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING"
  | "APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type LeaveType = {
  id: string;
  organisationId: string;
  name: string;
  code: string;
  description: string | null;
  unit: string;
  paid: boolean;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
};

export type LeaveBalance = {
  id: string;
  organisationId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  entitled: number;
  available: number;
  reserved: number;
  used: number;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type LeaveApplication = {
  id: string;
  organisationId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  quantity: number;
  reason: string | null;
  status: LeaveRequestStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  reviewComment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeaveTypeInput = {
  name: string;
  code: string;
  description?: string;
  unit?: string;
  paid?: boolean;
};

export type CreateLeaveBalanceInput = {
  employeeId: string;
  leaveTypeId: string;
  entitled: number;
};

export type CreateLeaveApplicationInput = {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
};
