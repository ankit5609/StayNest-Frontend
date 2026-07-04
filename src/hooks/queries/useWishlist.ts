import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  type WishlistQuery,
} from "@/lib/api/wishlist";
import type { PageHotelPriceResponseDto } from "@/lib/api/types";
import { useAuth } from "@/hooks/useAuth";

/** Fetches a page of wishlisted hotels. Used by the /wishlist screen. */
export function useWishlist(q: WishlistQuery = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery<PageHotelPriceResponseDto>({
    queryKey: ["wishlist", "page", q.page ?? 0, q.size ?? 24],
    queryFn: () => getWishlist(q),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

/**
 * Fetches every wishlisted hotel id (up to 500) so cards across the app can
 * render the correct heart state without each one hitting the API.
 */
export function useWishlistIds(): {
  ids: Set<number>;
  isLoading: boolean;
} {
  const { isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: ["wishlist", "ids"],
    queryFn: () => getWishlist({ page: 0, size: 500 }),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const ids = useMemo(() => {
    const set = new Set<number>();
    for (const h of query.data?.content ?? []) set.add(h.id);
    return set;
  }, [query.data]);

  return { ids, isLoading: query.isLoading };
}

/** Toggle a hotel in the wishlist with optimistic UI updates. */
export function useToggleWishlist() {
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async ({ hotelId, next }: { hotelId: number; next: boolean }) => {
      if (!isAuthenticated) throw new Error("Please sign in to save stays.");
      if (next) await addToWishlist(hotelId);
      else await removeFromWishlist(hotelId);
      return { hotelId, next };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}
