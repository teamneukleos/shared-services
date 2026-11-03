export type RecordStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type ExternalIdentity = {
  id: string;
  provider: string;
  subject: string;
  email: string | null;
};

export type UserAccount = {
  id: string;
  organisationId: string;
  officialEmail: string;
  status: RecordStatus;
  employeeId: string | null;
  externalIdentities: ExternalIdentity[];
  createdAt: string;
  updatedAt: string;
};

export type Permission = {
  id: string;
  code: string;
  description: string | null;
};

export type RolePermission = {
  id: string;
  code: string;
  description: string | null;
};

export type Role = {
  id: string;
  organisationId: string;
  name: string;
  code: string;
  permissions: RolePermission[];
  assignmentCount: number;
};

export type RoleAssignment = {
  id: string;
  userId: string;
  roleId: string;
  roleCode: string;
  roleName: string;
  startsAt: string;
  endsAt: string | null;
};
