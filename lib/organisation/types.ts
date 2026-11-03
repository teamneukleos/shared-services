export type BusinessUnit = {
  id: string;
  organisationId: string;
  name: string;
  code: string;
  departmentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Department = {
  id: string;
  organisationId: string;
  businessUnitId: string;
  businessUnitCode: string;
  name: string;
  code: string;
  teamCount: number;
  positionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Team = {
  id: string;
  organisationId: string;
  businessUnitId: string;
  departmentId: string;
  departmentCode: string;
  name: string;
  code: string;
};

export type Position = {
  id: string;
  organisationId: string;
  businessUnitId: string;
  departmentId: string;
  departmentCode: string;
  title: string;
  code: string;
};

export type StructureTab =
  | "business-units"
  | "departments"
  | "teams"
  | "positions";
