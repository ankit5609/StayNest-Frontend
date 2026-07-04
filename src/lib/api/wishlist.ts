/**
 * Wishlist API — bookmark stays for the signed-in user.
 *
 * Backend contract:
 *   POST   /users/wishlist/{hotelId}     -> 204 No Content
 *   DELETE /users/wishlist/{hotelId}     -> 204 No Content
 *   GET    /users/wishlist?page&size     -> PageHotelPriceResponseDto
 */

import { apiDelete, apiGet, apiPost } from "./client";
import type { PageHotelPriceResponseDto } from "./types";

const WISHLIST_PATH = "/users/wishlist";

export interface WishlistQuery {
  page?: number;
  size?: number;
}

export async function getWishlist(
  q: WishlistQuery = {},
): Promise<PageHotelPriceResponseDto> {
  return apiGet<PageHotelPriceResponseDto>(WISHLIST_PATH, {
    page: q.page ?? 0,
    size: q.size ?? 24,
  });
}

export async function addToWishlist(hotelId: number | string): Promise<void> {
  await apiPost<void>(`${WISHLIST_PATH}/${hotelId}`, {});
}

export async function removeFromWishlist(hotelId: number | string): Promise<void> {
  await apiDelete(`${WISHLIST_PATH}/${hotelId}`);
}
