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

/** Emit a global event so the AuthGateModal can intercept 401/403. */
function emitAuthRequired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("staynest:auth-required"));
  }
}

/** Map HTTP status codes to user-friendly messages. */
function friendlyMessage(status: number, method: string, path: string): string {
  switch (status) {
    case 400:
      return "The information you submitted looks invalid. Please check and try again.";
    case 401:
    case 403:
      return "Please sign in to continue.";
    case 404:
      if (path.includes("/hotels")) return "This property could not be found.";
      if (path.includes("/bookings")) return "This booking could not be found.";
      return "The resource you requested doesn't exist.";
    case 409:
      if (path.includes("/bookings")) return "These dates are no longer available. Please choose different dates.";
      if (path.includes("/guests")) return "A guest with this email already exists in your profile.";
      if (path.includes("/wishlist")) return "This stay is already in your wishlist.";
      return "A conflict occurred. This action may have already been completed.";
    case 410:
      return "This booking has expired. Please start a new reservation.";
    case 422:
      return "Some fields are missing or incorrect. Please review your inputs.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
      return "Something went wrong on our end. Please try again in a moment.";
    default:
      return `Something went wrong (${status}). Please try again.`;
  }
}

export type QueryValue = string | number | boolean | undefined | null;

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      // treat 0 as "no filter" for price params
      if ((k === "minPrice" || k === "maxPrice") && v === 0) continue;
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

async function extractError(res: Response, method: string, path: string): Promise<ApiError> {
  const status = res.status;

  // Emit auth event for 401/403 before throwing
  if (status === 401 || status === 403) {
    emitAuthRequired();
  }

  // Try to get backend message first
  let message = friendlyMessage(status, method, path);
  try {
    const data = (await res.json()) as {
      message?: string;
      error?: string | { message?: string };
    };
    // Only use backend message for non-auth errors and if it's a real human message
    if (status !== 401 && status !== 403) {
      if (data?.message && !data.message.toLowerCase().includes("request failed")) {
        message = data.message;
      } else if (data?.error) {
        if (typeof data.error === "object" && data.error.message) {
          message = data.error.message;
        } else if (typeof data.error === "string" && !data.error.toLowerCase().includes("request failed")) {
          message = data.error;
        }
      }
    }
  } catch {
    /* body was not JSON */
  }

  return new ApiError(message, status);
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
    throw await extractError(res, "GET", path);
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
    throw await extractError(res, "POST", path);
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
    throw await extractError(res, "PATCH", path);
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
    throw await extractError(res, "PUT", path);
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
    throw await extractError(res, "DELETE", path);
  }
}
