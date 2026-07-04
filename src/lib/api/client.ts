/**
 * Centralized API client for the StayNest backend.
 *
 * ONLY endpoints defined in openapi.json are consumed. Do not add
 * fabricated paths or query parameters here.
 */

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?? "http://localhost:8080/api/v1";

export const API_BASE_URL = RAW_BASE.replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export type QueryValue = string | number | boolean | undefined | null;

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function unwrapResponse<T>(json: any): T {
  if (json && typeof json === "object" && "timeStamp" in json && "error" in json && "data" in json) {
    return json.data as T;
  }
  return json as T;
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("staynest.auth.session");
    if (raw) {
      const session = JSON.parse(raw) as any;
      const token = session?.accessToken ?? session?.data?.accessToken;
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    }
  } catch {
    // ignore
  }
  return {};
}

export async function apiGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(buildUrl(path, query), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    throw new ApiError(
      `Request failed (${res.status}) for GET ${path}`,
      res.status,
    );
  }

  if (res.status === 204) return null as T;
  const text = await res.text();
  return text ? unwrapResponse<T>(JSON.parse(text)) : (null as T);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status}) for POST ${path}`;
    try {
      const data = (await res.json()) as {
        message?: string;
        error?: string | { message?: string };
      };
      if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        if (typeof data.error === "object" && data.error.message) {
          message = data.error.message;
        } else if (typeof data.error === "string") {
          message = data.error;
        }
      }
    } catch {
      /* body was not JSON */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return null as T;
  const text = await res.text();
  return text ? unwrapResponse<T>(JSON.parse(text)) : (null as T);
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T | null> {
  const res = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status}) for PATCH ${path}`;
    try {
      const data = (await res.json()) as {
        message?: string;
        error?: string | { message?: string };
      };
      if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        if (typeof data.error === "object" && data.error.message) {
          message = data.error.message;
        } else if (typeof data.error === "string") {
          message = data.error;
        }
      }
    } catch {
      /* body was not JSON */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? unwrapResponse<T>(JSON.parse(text)) : null;
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T | null> {
  const res = await fetch(buildUrl(path), {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status}) for PUT ${path}`;
    try {
      const data = (await res.json()) as {
        message?: string;
        error?: string | { message?: string };
      };
      if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        if (typeof data.error === "object" && data.error.message) {
          message = data.error.message;
        } else if (typeof data.error === "string") {
          message = data.error;
        }
      }
    } catch {
      /* body was not JSON */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? unwrapResponse<T>(JSON.parse(text)) : null;
}

export async function apiDelete(path: string, init?: RequestInit): Promise<void> {
  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    throw new ApiError(
      `Request failed (${res.status}) for DELETE ${path}`,
      res.status,
    );
  }
}



