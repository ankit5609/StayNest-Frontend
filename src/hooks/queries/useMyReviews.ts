import { useQuery } from "@tanstack/react-query";
import { getMyReviews, type PageMyReviewDto } from "@/lib/api/reviews";

export function useMyReviews(page = 0, size = 10) {
  return useQuery<PageMyReviewDto>({
    queryKey: ["myReviews", page, size],
    queryFn: () => getMyReviews(page, size),
    staleTime: 30_000,
  });
}
