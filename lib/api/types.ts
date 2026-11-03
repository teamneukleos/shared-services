export type ApiSuccessEnvelope<T> = {
  success: true;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
  requestId?: string | null;
};

export type PaginationMeta = {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type ApiErrorEnvelope = {
  success: false;
  statusCode: number;
  message: string;
  errors: unknown[];
  path: string;
  timestamp: string;
  requestId?: string | null;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: unknown[];
  readonly path?: string;

  constructor(input: {
    message: string;
    statusCode: number;
    errors?: unknown[];
    path?: string;
  }) {
    super(input.message);
    this.name = "ApiError";
    this.statusCode = input.statusCode;
    this.errors = input.errors ?? [];
    this.path = input.path;
  }
}
