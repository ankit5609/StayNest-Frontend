import {
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { searchHotels, type SearchHotelsParams } from "@/lib/api/hotels";
import type { PageHotelPriceResponseDto } from "@/lib/api/types";

/**
 * Traditional structured hotel search (single page).
 * Guards required params — if any are missing, the query stays disabled
 * so the backend never receives a 400 Validation Error.
 */
export function useHotelSearch(params: Partial<SearchHotelsParams>) {
  const ready = Boolean(
    params.city && params.startDate && params.endDate && params.roomsCount,
  );

  return useQuery({
    enabled: ready,
    queryKey: ["hotels", "search", params],
    queryFn: ({ signal }) =>
      searchHotels(params as SearchHotelsParams, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: 1,
  });
}

/**
 * Infinite (Load More) hotel search — appends successive backend pages
 * into a single flat list. `page` is owned by the query cursor and must
 * NOT be part of the input params.
 */
export function useInfiniteHotelSearch(
  params: Omit<Partial<SearchHotelsParams>, "page">,
) {
  const ready = Boolean(
    params.city && params.startDate && params.endDate && params.roomsCount,
  );

  return useInfiniteQuery({
    enabled: ready,
    queryKey: ["hotels", "search", "infinite", params],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      searchHotels(
        { ...(params as SearchHotelsParams), page: pageParam as number },
        { signal },
      ),
    getNextPageParam: (last: PageHotelPriceResponseDto) =>
      last.last ? undefined : last.number + 1,
    staleTime: 60_000,
    retry: 1,
  });
}
