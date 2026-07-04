import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGuest,
  deleteGuest,
  listGuests,
  updateGuest,
  type GuestCreateDto,
  type GuestsQuery,
  type PageGuestDto,
} from "@/lib/api/guests";

const KEY = ["guests"] as const;

export function useGuests(q: GuestsQuery = {}) {
  return useQuery<PageGuestDto>({
    queryKey: [...KEY, q.page ?? 0, q.size ?? 20, q.sort ?? "id,desc"],
    queryFn: () => listGuests(q),
    staleTime: 30_000,
  });
}

export function useCreateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GuestCreateDto) => createGuest(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: GuestCreateDto }) =>
      updateGuest(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGuest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
