import { appConfig } from "@/lib/config";
import type { AuthSession } from "@/lib/auth/types";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "@/lib/auth/storage";
import {
  ApiError,
  type ApiErrorEnvelope,
  type ApiSuccessEnvelope,
  type Paginated,
  type PaginationMeta,
} from "./types";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  accessToken?: string;
  signal?: AbortSignal;
  /** Internal: skip refresh retry to avoid loops */
  _retried?: boolean;
};

let refreshInFlight: Promise<string | null> | null = null;

function joinUrl(path: string): string {
  const base = appConfig.apiBaseUrl.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
}

function unwrapData<T>(payload: unknown, response: Response): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success: unknown }).success === true &&
    "data" in payload
  ) {
    return (payload as ApiSuccessEnvelope<T>).data;
  }

  return payload as T;
}

function throwApiError(payload: unknown, response: Response): never {
  if (payload && typeof payload === "object" && "message" in payload) {
    const errorBody = payload as ApiErrorEnvelope;
    throw new ApiError({
      message: errorBody.message || "Request failed",
      statusCode: errorBody.statusCode ?? response.status,
      errors: errorBody.errors,
      path: errorBody.path,
    });
  }

  throw new ApiError({
    message: `Request failed with status ${response.status}`,
    statusCode: response.status,
  });
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const stored = readStoredSession();
    if (!stored?.refreshToken) {
      clearStoredSession();
      return null;
    }

    try {
      const response = await fetch(joinUrl("/authentication/refresh"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      });
      const payload = await parseJson(response);

      if (!response.ok) {
        clearStoredSession();
        return null;
      }

      const session = unwrapData<AuthSession>(payload, response);
      writeStoredSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
      });
      return session.accessToken;
    } catch {
      clearStoredSession();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const useAuth = options.auth !== false;
  const stored = readStoredSession();
  const token = options.accessToken ?? (useAuth ? stored?.accessToken : undefined);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(joinUrl(path), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const payload = await parseJson(response);

  if (
    response.status === 401 &&
    useAuth &&
    !options._retried &&
    // Skip refresh when a specific access token was supplied (e.g. paste-token login).
    !options.accessToken
  ) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiRequest<T>(path, {
        ...options,
        accessToken: nextToken,
        _retried: true,
      });
    }
  }

  if (!response.ok) {
    throwApiError(payload, response);
  }

  return unwrapData<T>(payload, response);
}

export async function apiRequestPaginated<T>(
  path: string,
  options: RequestOptions = {},
): Promise<Paginated<T>> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const useAuth = options.auth !== false;
  const stored = readStoredSession();
  const token = options.accessToken ?? (useAuth ? stored?.accessToken : undefined);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(joinUrl(path), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const payload = await parseJson(response);

  if (
    response.status === 401 &&
    useAuth &&
    !options._retried &&
    !options.accessToken
  ) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiRequestPaginated<T>(path, {
        ...options,
        accessToken: nextToken,
        _retried: true,
      });
    }
  }

  if (!response.ok) {
    throwApiError(payload, response);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success: unknown }).success === true &&
    "data" in payload
  ) {
    const envelope = payload as ApiSuccessEnvelope<T[]>;
    const meta = (envelope.meta ?? {
      page: 1,
      size: Array.isArray(envelope.data) ? envelope.data.length : 0,
      totalItems: Array.isArray(envelope.data) ? envelope.data.length : 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    }) as PaginationMeta;

    return {
      data: Array.isArray(envelope.data) ? envelope.data : [],
      meta,
    };
  }

  throw new ApiError({
    message: "Unexpected paginated response shape",
    statusCode: 500,
  });
}
