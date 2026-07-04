/**
 * DTOs mirrored from openapi.json (`#/components/schemas/*`).
 * Only the fields consumed by the frontend are typed here.
 */

export interface HotelContactInfo {
  address?: string;
  phoneNumber?: string;
  email?: string;
  location?: string;
}

/** #/components/schemas/HotelDto (details view). */
export interface HotelDto {
  id: number;
  name: string;
  city: string;
  photos: string[];
  amenities: string[];
  contactInfo?: HotelContactInfo;
  averageRating: number;
  reviewCount: number;
  active?: boolean;
}

/** #/components/schemas/RoomInfoDto */
export interface RoomInfoDto {
  id: number;
  type: string;
  photos: string[];
  amenities: string[];
  price: number;
}

/** #/components/schemas/HotelInfoDto */
export interface HotelInfoDto {
  hotel: HotelDto;
  rooms: RoomInfoDto[];
}

/** #/components/schemas/ReviewDto */
export interface ReviewDto {
  id: number;
  userName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export interface PageReviewDto {
  content: ReviewDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface HotelQaResponseDto {
  answer: string;
  sourceReviewIds: number[];
}

/** #/components/schemas/HotelPriceResponseDto */
export interface HotelPriceResponseDto {
  id: number;
  name: string;
  city: string;
  photos: string[];
  amenities: string[];
  contactInfo?: HotelContactInfo;
  price: number;
  averageRating: number;
  reviewCount: number;
}

/** #/components/schemas/PageHotelPriceResponseDto */
export interface PageHotelPriceResponseDto {
  content: HotelPriceResponseDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export type SortBy = "PRICE_ASC" | "PRICE_DESC" | "RATING_DESC";

/**
 * Conversational (natural-language) search — POST /hotels/search/nl
 * The backend interprets the free-text query and returns either a
 * populated result page or the list of `missingFields` we still need
 * to collect before performing the actual hotel search.
 */
export type NLMissingField =
  | "city"
  | "startDate"
  | "endDate"
  | "roomsCount"
  | "adults";

export interface NLInterpretedQuery {
  city?: string;
  startDate?: string;
  endDate?: string;
  roomsCount?: number;
  adults?: number;
  children?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: SortBy;
  notes?: string;
}

export interface NLSearchRequest {
  query: string;
  /** Follow-up values the user has provided since the initial query. */
  city?: string;
  startDate?: string;
  endDate?: string;
  roomsCount?: number;
  adults?: number;
  page?: number;
  size?: number;
}

export interface NLSearchResponse {
  interpretedQuery: NLInterpretedQuery;
  missingFields: NLMissingField[];
  results: PageHotelPriceResponseDto;
}

// ---------------- Bookings ----------------

export type BookingStatus =
  | "RESERVED"
  | "GUESTS_ADDED"
  | "PAYMENTS_PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "PENDING"
  | "COMPLETED"
  | "FAILED";

export interface BookingInitRequest {
  hotelId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  roomsCount: number;
}

export interface BookingInitResponse {
  id: number;
  roomsCount: number;
  checkInDate: string;
  checkOutDate: string;
  bookingStatus: BookingStatus;
  amount: number;
  guests: GuestDto[];
  refundAmount?: number | null;
}

export interface PaymentSessionResponse {
  sessionUrl: string;
}

export interface BookingStatusResponse {
  bookingStatus: BookingStatus;
}

export interface GuestDto {
  id?: number;
  name: string;
  age?: number;
  gender?: string;
}

export interface BookingHotelSummary {
  id: number;
  name: string;
  city: string;
  country?: string;
  photos: string[];
}

export interface BookingRoomSummary {
  id: number;
  type: string;
}

/** #/components/schemas/BookingDto (extended with hotel + room per spec Option A). */
export interface BookingDto {
  id: number;
  roomsCount: number;
  checkInDate: string;   // ISO date
  checkOutDate: string;  // ISO date
  createdAt: string;     // ISO datetime
  updatedAt: string;     // ISO datetime
  bookingStatus: BookingStatus;
  guests: GuestDto[];
  amount: number;
  refundAmount?: number;
  hotel: BookingHotelSummary;
  room: BookingRoomSummary;
}

export interface PageBookingDto {
  content: BookingDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}
