/**
 * Guests API — /users/guests
 * Backend contract: list (paginated), create, update, delete.
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import type { Gender } from "./users";

export interface GuestDto {
  id: number;
  name: string;
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
}

export interface GuestCreateDto {
  name: string;
  gender: Gender;
  dateOfBirth: string;
}

export interface PageGuestDto {
  content: GuestDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface GuestsQuery {
  page?: number;
  size?: number;
  sort?: string;
}

const BASE = "/users/guests";

export function listGuests(q: GuestsQuery = {}): Promise<PageGuestDto> {
  return apiGet<PageGuestDto>(BASE, {
    page: q.page ?? 0,
    size: q.size ?? 20,
    sort: q.sort ?? "id,desc",
  });
}

export function createGuest(body: GuestCreateDto): Promise<GuestDto> {
  return apiPost<GuestDto>(BASE, body);
}

export function updateGuest(id: number, body: GuestCreateDto): Promise<void> {
  return apiPut<void>(`${BASE}/${id}`, body).then(() => undefined);
}

export function deleteGuest(id: number): Promise<void> {
  return apiDelete(`${BASE}/${id}`);
}
