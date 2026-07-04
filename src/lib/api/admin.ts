/**
 * Admin (hotel manager) API wrappers.
 */


import {
  API_BASE_URL,
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  getAuthHeaders,
} from "./client";
import type {
  AdminHotelDto,
  AdminHotelInput,
  AdminRoomDto,
  AdminRoomInput,
  HotelReportDto,
  InventoryDto,
  PageAdminHotelDto,
  UpdateInventoryRequestDto,
} from "./admin-types";
import type { BookingDto, PageBookingDto } from "./types";


// ---- Photo upload (multipart, response is text/plain URL) ----

async function uploadPhoto(path: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
      `Request failed (${res.status}) for POST ${path}`,
      res.status,
    );
  }
  const text = (await res.text()).trim();
  if (text.startsWith("\"") && text.endsWith("\"")) return JSON.parse(text) as string;
  if (text.startsWith("{")) {
    try {
      const j = JSON.parse(text) as { url?: string; data?: string };
      return j.url ?? j.data ?? text;
    } catch {
      /* not JSON */
    }
  }
  return text;
}

// ---- Hotels ----

export interface ListHotelsQuery {
  page?: number;
  size?: number;
}

export function listHotels(q: ListHotelsQuery = {}): Promise<PageAdminHotelDto> {
  return apiGet<PageAdminHotelDto>("/admin/hotels", {
    page: q.page ?? 0,
    size: q.size ?? 50,
  });
}

export function createHotel(body: AdminHotelInput): Promise<AdminHotelDto> {
  return apiPost<AdminHotelDto>("/admin/hotels", body);
}

export function updateHotel(
  hotelId: number,
  body: AdminHotelInput,
): Promise<AdminHotelDto> {
  return apiPut<AdminHotelDto>(`/admin/hotels/${hotelId}`, body).then((r) => {
    if (!r) throw new ApiError("Empty response updating hotel", 500);
    return r;
  });
}

export function deleteHotel(hotelId: number): Promise<void> {
  return apiDelete(`/admin/hotels/${hotelId}`);
}

export function uploadHotelPhoto(hotelId: number, file: File): Promise<string> {
  return uploadPhoto(`/admin/hotels/${hotelId}/photos`, file);
}

export function activateHotel(hotelId: number): Promise<void> {
  return apiPatch<void>(`/admin/hotels/${hotelId}/activate`, {}).then(() => undefined);
}

// ---- Rooms ----

export function listRooms(hotelId: number): Promise<AdminRoomDto[]> {
  return apiGet<AdminRoomDto[]>(`/admin/hotels/${hotelId}/rooms`);
}

export function createRoom(hotelId: number, body: AdminRoomInput): Promise<AdminRoomDto> {
  return apiPost<AdminRoomDto>(`/admin/hotels/${hotelId}/rooms`, body);
}

export function updateRoom(
  hotelId: number,
  roomId: number,
  body: AdminRoomInput,
): Promise<AdminRoomDto> {
  return apiPut<AdminRoomDto>(`/admin/hotels/${hotelId}/rooms/${roomId}`, body).then(
    (r) => {
      if (!r) throw new ApiError("Empty response updating room", 500);
      return r;
    },
  );
}

export function deleteRoom(hotelId: number, roomId: number): Promise<void> {
  return apiDelete(`/admin/hotels/${hotelId}/rooms/${roomId}`);
}

export function uploadRoomPhoto(
  hotelId: number,
  roomId: number,
  file: File,
): Promise<string> {
  return uploadPhoto(`/admin/hotels/${hotelId}/rooms/${roomId}/photos`, file);
}

// ---- Inventory ----

export function getRoomInventory(roomId: number): Promise<InventoryDto[]> {
  return apiGet<InventoryDto[]>(`/admin/inventory/rooms/${roomId}`);
}

export function updateRoomInventory(
  roomId: number,
  body: UpdateInventoryRequestDto,
): Promise<void> {
  return apiPatch<void>(`/admin/inventory/rooms/${roomId}`, body).then(() => undefined);
}

// ---- Bookings & refunds ----

export interface AdminBookingsQuery {
  page?: number;
  size?: number;
}

export function getHotelBookings(
  hotelId: number,
  q: AdminBookingsQuery = {},
): Promise<PageBookingDto> {
  return apiGet<PageBookingDto>(`/admin/hotels/${hotelId}/bookings`, {
    page: q.page ?? 0,
    size: q.size ?? 20,
  });
}

export function getRefundPending(): Promise<BookingDto[]> {
  return apiGet<BookingDto[]>("/admin/hotels/bookings/refund-pending");
}

export function settleRefund(bookingId: number): Promise<void> {
  return apiPost<void>(`/admin/hotels/bookings/${bookingId}/refund`, {}).then(
    () => undefined,
  );
}

// ---- Reports ----

export interface ReportQuery {
  startDate?: string;
  endDate?: string;
}

export function getHotelReport(
  hotelId: number,
  q: ReportQuery = {},
): Promise<HotelReportDto> {
  return apiGet<HotelReportDto>(`/admin/hotels/${hotelId}/reports`, {
    startDate: q.startDate,
    endDate: q.endDate,
  });
}
