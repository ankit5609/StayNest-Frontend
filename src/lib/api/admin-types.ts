/**
 * Admin (hotel manager) DTOs — mirrored from the backend contract.
 * Only fields consumed by the manager console are typed here.
 */

import type { HotelContactInfo } from "./types";

/** Response body for GET/POST /admin/hotels */
export interface AdminHotelDto {
  id: number;
  name: string;
  city: string;
  photos: string[];
  amenities: string[];
  contactInfo: HotelContactInfo;
  active: boolean;
  averageRating: number;
  reviewCount: number;
}

/** Request body for POST /admin/hotels and PUT /admin/hotels/{id} */
export interface AdminHotelInput {
  name: string;
  city: string;
  photos: string[];
  amenities: string[];
  contactInfo: HotelContactInfo;
}

export interface PageAdminHotelDto {
  content: AdminHotelDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminRoomDto {
  id: number;
  type: string;
  basePrice: number;
  totalCount: number;
  capacity: number;
  photos: string[];
  amenities: string[];
}

export interface AdminRoomInput {
  type: string;
  basePrice: number;
  totalCount: number;
  capacity: number;
  photos: string[];
  amenities: string[];
}

/** Daily inventory slot for a room. */
export interface InventoryDto {
  id: number;
  date: string;          // yyyy-MM-dd
  totalCount: number;
  bookedCount: number;
  reservedCount: number;
  price: number;
  closed: boolean;
  surgeFactor: number;
}

/** PATCH /admin/inventory/rooms/{roomId} */
export interface UpdateInventoryRequestDto {
  startDate: string;
  endDate: string;
  surgeFactor: number;
  closed: boolean;
}

/** GET /admin/hotels/{id}/reports */
export interface HotelReportDto {
  totalConfirmedBookings: number;
  totalRevenueOfConfirmedBookings: number;
  avgRevenue: number;
}

/** Admin bookings share the same shape as guest bookings but may include hotel/room summaries. */
export type { BookingDto, PageBookingDto } from "./types";
