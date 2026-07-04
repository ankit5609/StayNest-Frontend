import { useQuery } from "@tanstack/react-query";
import { searchHotels } from "@/lib/api/hotels";
import type { HotelPriceResponseDto } from "@/lib/api/types";

/**
 * Configurable featured city for the landing page.
 * Default per plan: "Singapore".
 */
const FEATURED_CITY =
  (import.meta.env.VITE_FEATURED_CITY as string | undefined) ?? "Bali";

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Landing page needs a stable window so the query key doesn't change every
 * render. Use today + 1 night, both aligned to UTC midnight.
 */
function getDefaultWindow() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);
  return { startDate: toIsoDate(today), endDate: toIsoDate(tomorrow) };
}

export interface UseCuratedHotelsResult {
  city: string;
  hotels: HotelPriceResponseDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useCuratedHotels(): UseCuratedHotelsResult {
  const { startDate, endDate } = getDefaultWindow();
  const city = FEATURED_CITY;

  const query = useQuery({
    queryKey: ["hotels", "curated", city, startDate, endDate],
    queryFn: ({ signal }) =>
      searchHotels(
        {
          city,
          startDate,
          endDate,
          roomsCount: 1,
          page: 0,
          size: 12,
          sortBy: "RATING_DESC",
        },
        { signal },
      ),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  return {
    city,
    hotels: query.data?.content ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
