import { useMutation } from "@tanstack/react-query";
import { searchHotelsNL } from "@/lib/api/hotels";
import type { NLSearchRequest, NLSearchResponse } from "@/lib/api/types";

/**
 * Conversational (NL) hotel search — POST /hotels/search/nl.
 * Modelled as a mutation because each request is user-initiated
 * (submit / follow-up) rather than route-derived.
 */
export function useNLHotelSearch() {
  return useMutation<NLSearchResponse, Error, NLSearchRequest>({
    mutationKey: ["hotels", "search", "nl"],
    mutationFn: (body) => searchHotelsNL(body),
  });
}
