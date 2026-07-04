/**
 * Bookings API — booking lifecycle endpoints.
 */

import { apiGet, apiPost } from "./client";
import type {
  BookingDto,
  BookingInitRequest,
  BookingInitResponse,
  BookingStatusResponse,
  PageBookingDto,
  PaymentSessionResponse,
} from "./types";

const MY_BOOKINGS_PATH = "/users/myBookings";

export interface MyBookingsQuery {
  page?: number;
  size?: number;
}

export async function getMyBookings(
  q: MyBookingsQuery = {},
): Promise<PageBookingDto> {
  const raw = await apiGet<PageBookingDto | BookingDto[]>(MY_BOOKINGS_PATH, {
    page: q.page ?? 0,
    size: q.size ?? 50,
  });

  if (Array.isArray(raw)) {
    const size = q.size ?? raw.length;
    return {
      content: raw,
      totalElements: raw.length,
      totalPages: 1,
      number: 0,
      size,
      first: true,
      last: true,
      empty: raw.length === 0,
      numberOfElements: raw.length,
    };
  }
  return raw;
}

export function initBooking(body: BookingInitRequest): Promise<BookingInitResponse> {
  return apiPost<BookingInitResponse>("/bookings/init", body);
}

export function addBookingGuests(
  bookingId: number,
  guestIds: number[],
): Promise<BookingInitResponse> {
  return apiPost<BookingInitResponse>(`/bookings/${bookingId}/addGuests`, guestIds);
}

export function initiatePayment(bookingId: number): Promise<PaymentSessionResponse> {
  return apiPost<PaymentSessionResponse>(`/bookings/${bookingId}/payments`, {});
}

export function getBookingStatus(bookingId: number): Promise<BookingStatusResponse> {
  return apiGet<BookingStatusResponse>(`/bookings/${bookingId}/status`);
}

export function getBooking(bookingId: number): Promise<BookingDto> {
  return apiGet<BookingDto>(`/bookings/${bookingId}`);
}

export function cancelBooking(bookingId: number): Promise<BookingDto> {
  return apiPost<BookingDto>(`/bookings/${bookingId}/cancel`, {});
}

