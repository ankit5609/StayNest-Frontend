import { useQuery } from "@tanstack/react-query";
import {
  getHotelInfo,
  getHotelReviews,
  askHotelQuestion,
  type HotelInfoParams,
} from "@/lib/api/hotels";

export function useHotelInfo(hotelId: string | number, params: HotelInfoParams) {
  const enabled = Boolean(hotelId && params.startDate && params.endDate && params.roomsCount);
  return useQuery({
    queryKey: ["hotel", "info", String(hotelId), params],
    queryFn: () => getHotelInfo(hotelId, params),
    enabled,
    staleTime: 60_000,
  });
}

export function useHotelReviews(hotelId: string | number, page = 0, size = 6) {
  return useQuery({
    queryKey: ["hotel", "reviews", String(hotelId), page, size],
    queryFn: () => getHotelReviews(hotelId, page, size),
    enabled: Boolean(hotelId),
    staleTime: 60_000,
  });
}

export function useAskHotel(hotelId: string | number) {
  return async (question: string) => askHotelQuestion(hotelId, question);
}
