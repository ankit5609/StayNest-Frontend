/**
 * Hotels API — thin wrappers around backend hotel endpoints.
 * Only endpoints defined in openapi.json are consumed here.
 */

import { apiGet, apiPost } from "./client";
import type {
  HotelInfoDto,
  HotelQaResponseDto,
  NLSearchRequest,
  NLSearchResponse,
  PageHotelPriceResponseDto,
  PageReviewDto,
  SortBy,
} from "./types";

export interface SearchHotelsParams {
  city: string;
  startDate: string;      // ISO date (yyyy-mm-dd)
  endDate: string;        // ISO date (yyyy-mm-dd)
  roomsCount: number;
  page?: number;
  size?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: SortBy;
}

/** GET /hotels/search — traditional structured search. */
export function searchHotels(
  params: SearchHotelsParams,
  init?: RequestInit,
): Promise<PageHotelPriceResponseDto> {
  return apiGet<PageHotelPriceResponseDto>(
    "/hotels/search",
    params as unknown as Record<string, string | number | boolean | undefined>,
    init,
  );
}

/** POST /hotels/search/nl — conversational natural-language search. */
export function searchHotelsNL(
  body: NLSearchRequest,
  init?: RequestInit,
): Promise<NLSearchResponse> {
  return apiPost<NLSearchResponse>("/hotels/search/nl", body, init);
}

/** GET /hotels/{hotelId}/info — hotel profile + dynamically priced rooms. */
export interface HotelInfoParams {
  startDate: string;
  endDate: string;
  roomsCount: number;
}

export function getHotelInfo(
  hotelId: number | string,
  params: HotelInfoParams,
  init?: RequestInit,
): Promise<HotelInfoDto> {
  return apiGet<HotelInfoDto>(
    `/hotels/${hotelId}/info`,
    params as unknown as Record<string, string | number | boolean | undefined>,
    init,
  );
}

/** GET /hotels/{hotelId}/reviews — paginated guest reviews. */
export function getHotelReviews(
  hotelId: number | string,
  page = 0,
  size = 10,
  init?: RequestInit,
): Promise<PageReviewDto> {
  return apiGet<PageReviewDto>(
    `/hotels/${hotelId}/reviews`,
    { page, size },
    init,
  );
}

/** GET /hotels/{hotelId}/ask — conversational review Q&A. */
export function askHotelQuestion(
  hotelId: number | string,
  question: string,
  init?: RequestInit,
): Promise<HotelQaResponseDto> {
  return apiGet<HotelQaResponseDto>(
    `/hotels/${hotelId}/ask`,
    { question },
    init,
  );
}
