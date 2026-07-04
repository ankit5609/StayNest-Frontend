/**
 * Users API — GET/PATCH /users/profile, POST /users/profile/photo.
 */

import { API_BASE_URL, ApiError, apiGet, apiPatch, getAuthHeaders } from "./client";
import type { UserRole } from "./auth";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface UserDto {
  id: number;
  email: string;
  name: string;
  gender: Gender | null;
  dateOfBirth: string | null; // YYYY-MM-DD
  roles: UserRole[];
  avatarUrl?: string | null;
}

export interface ProfileUpdateRequestDto {
  name?: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
}

const PROFILE_PATH = "/users/profile";

export function getProfile(): Promise<UserDto> {
  return apiGet<UserDto>(PROFILE_PATH);
}

export function updateProfile(body: ProfileUpdateRequestDto): Promise<void> {
  return apiPatch<void>(PROFILE_PATH, body).then(() => undefined);
}

/**
 * POST /users/profile/photo — multipart/form-data with a single `file` field.
 * Returns the uploaded image URL (Cloudinary).
 */
export async function uploadProfilePhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}${PROFILE_PATH}/photo`, {
    method: "POST",
    body: form,
    headers: {
      Accept: "application/json, text/plain, */*",
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new ApiError(
      `Request failed (${res.status}) for POST ${PROFILE_PATH}/photo`,
      res.status,
    );
  }

  const text = (await res.text()).trim();
  // Backend returns a raw URL string; guard against JSON-wrapped variants.
  if (text.startsWith("\"") && text.endsWith("\"")) return JSON.parse(text) as string;
  if (text.startsWith("{")) {
    try {
      const j = JSON.parse(text) as { url?: string; avatarUrl?: string; data?: string };
      return j.url ?? j.avatarUrl ?? j.data ?? text;
    } catch {
      /* not JSON */
    }
  }
  return text;
}
