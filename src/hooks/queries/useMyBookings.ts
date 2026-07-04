import { useQuery } from "@tanstack/react-query";
import { getMyBookings, type MyBookingsQuery } from "@/lib/api/bookings";

export function useMyBookings(q: MyBookingsQuery = {}) {
  return useQuery({
    queryKey: ["myBookings", q.page ?? 0, q.size ?? 50],
    queryFn: () => getMyBookings(q),
    staleTime: 60_000,
  });
}
