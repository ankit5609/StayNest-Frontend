import { useState, useEffect, useCallback } from "react";
import { searchHotels } from "@/lib/api/hotels";

const FEATURED_CITY = import.meta.env.VITE_FEATURED_CITY ?? "Bali";

function toIsoDate(d) {
  return d.toISOString().slice(0, 10);
}

function getDefaultWindow() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);
  return { startDate: toIsoDate(today), endDate: toIsoDate(tomorrow) };
}

export function useCuratedHotels() {
  const { startDate, endDate } = getDefaultWindow();
  const city = "";
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchHotels = useCallback(async (signal) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await searchHotels(
        {
          city,
          startDate,
          endDate,
          roomsCount: 1,
          page: 0,
          size: 12,
          sortBy: "RATING_DESC",
        },
        { signal }
      );
      setData(res);
    } catch (err) {
      if (err?.name !== "AbortError") {
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [city, startDate, endDate]);

  useEffect(() => {
    const controller = new AbortController();
    fetchHotels(controller.signal);
    return () => controller.abort();
  }, [fetchHotels]);

  return {
    city,
    hotels: data?.content ?? [],
    isLoading,
    isError,
    refetch: () => fetchHotels(),
  };
}
