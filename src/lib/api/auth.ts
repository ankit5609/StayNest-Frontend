/**
 * Auth API — thin wrapper around the backend auth endpoints.
 * Endpoint shape confirmed by user (openapi.json): POST /auth/login.
 */

import { apiPost } from "./client";

const LOGIN_PATH = "/auth/login";
const REGISTER_PATH = "/auth/signup";
const FORGOT_PASSWORD_PATH = "/auth/forgot-password";
const RESET_PASSWORD_PATH = "/auth/reset-password";

export type UserRole = "GUEST" | "HOTEL_MANAGER";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}


export interface LoginResponse {
  accessToken: string;
  roles: UserRole[];
  email?: string;
  name?: string;
}


export interface ApiError {
  code?: string;
  message?: string;
}

export interface ApiResponseString {
  timeStamp: string;
  data: string;
  error: ApiError | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

const TOKEN_STORAGE_KEY = "staynest.auth.session";

export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>(LOGIN_PATH, body);
}

export function register(body: RegisterRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>(REGISTER_PATH, body);
}

export function forgotPassword(body: ForgotPasswordRequest): Promise<ApiResponseString> {
  return apiPost<ApiResponseString>(FORGOT_PASSWORD_PATH, body);
}

export function resetPassword(body: ResetPasswordRequest): Promise<ApiResponseString> {
  return apiPost<ApiResponseString>(RESET_PASSWORD_PATH, body);
}

const SESSION_EVENT = "staynest:session-changed";

export function persistSession(res: LoginResponse) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(res));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function readSession(): LoginResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (session && typeof session === "object" && "timeStamp" in session && "data" in session) {
      const unwrapped = session.data as LoginResponse;
      return {
        ...unwrapped,
        email: unwrapped.email ?? session.email,
        name: unwrapped.name ?? session.name,
      };
    }
    return session as LoginResponse;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function subscribeSession(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(SESSION_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SESSION_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

