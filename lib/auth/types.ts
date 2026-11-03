export type AuthenticatedUser = {
  id: string;
  organisationId: string;
  email: string;
  employeeId: string | null;
  permissions: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  refreshExpiresIn: string;
  user: AuthenticatedUser;
};

export type StoredSession = {
  accessToken: string;
  refreshToken: string | null;
  user: AuthenticatedUser | null;
};
