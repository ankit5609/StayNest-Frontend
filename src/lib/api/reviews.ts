/**
 * User Reviews API — GET /users/myReviews.
 */

import { apiGet } from "./client";

export interface MyReviewDto {
  id: number;
  rating: number;
  reviewText: string;
  createdAt: string; // ISO datetime
  hotelId?: number;
  hotelName?: string;
  hotelCity?: string;
  hotelPhoto?: string;
}

export interface PageMyReviewDto {
  content: MyReviewDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export function getMyReviews(page = 0, size = 10): Promise<PageMyReviewDto> {
  return apiGet<PageMyReviewDto>("/users/myReviews", { page, size });
}
