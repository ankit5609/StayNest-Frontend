/**
 * TanStack Query hooks for the hotel manager console.
 * Query keys:
 *   ['manager','hotels']            → list of owned hotels
 *   ['manager','hotel', hotelId]    → single hotel detail (derived from list)
 *   ['manager','rooms', hotelId]    → rooms cache (locally maintained after create/update/delete)
 *   ['manager','inventory', roomId] → daily inventory slots
 *   ['manager','bookings', hotelId] → hotel bookings page
 *   ['manager','refunds']           → global refund queue
 *   ['manager','report', hotelId, range]
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  activateHotel,
  createHotel,
  createRoom,
  deleteHotel,
  deleteRoom,
  getHotelBookings,
  getHotelReport,
  getRefundPending,
  getRoomInventory,
  listHotels,
  listRooms,
  settleRefund,
  updateHotel,
  updateRoom,
  updateRoomInventory,
  uploadHotelPhoto,
  uploadRoomPhoto,
  type AdminBookingsQuery,
  type ListHotelsQuery,
  type ReportQuery,
} from "@/lib/api/admin";
import type {
  AdminHotelDto,
  AdminHotelInput,
  AdminRoomDto,
  AdminRoomInput,
  HotelReportDto,
  InventoryDto,
  PageAdminHotelDto,
  UpdateInventoryRequestDto,
} from "@/lib/api/admin-types";
import type { BookingDto, PageBookingDto } from "@/lib/api/types";
import { useAuth } from "@/hooks/useAuth";

function useIsManager() {
  const { session } = useAuth();
  return !!session?.roles?.includes("HOTEL_MANAGER");
}

// ---------------- Hotels ----------------

export function useManagerHotels(q: ListHotelsQuery = {}) {
  const enabled = useIsManager();
  return useQuery<PageAdminHotelDto>({
    queryKey: ["manager", "hotels", q.page ?? 0, q.size ?? 50],
    queryFn: () => listHotels(q),
    enabled,
    staleTime: 30_000,
  });
}

export function useManagerHotel(hotelId: number | undefined) {
  const enabled = useIsManager() && !!hotelId;
  const qc = useQueryClient();
  return useQuery<AdminHotelDto | null>({
    queryKey: ["manager", "hotel", hotelId],
    queryFn: async () => {
      // The backend only exposes a listing endpoint; derive the single hotel from it.
      const cached = qc.getQueryData<PageAdminHotelDto>([
        "manager",
        "hotels",
        0,
        50,
      ]);
      const fromCache = cached?.content.find((h) => h.id === hotelId);
      if (fromCache) return fromCache;
      const page = await listHotels({ page: 0, size: 100 });
      return page.content.find((h) => h.id === hotelId) ?? null;
    },
    enabled,
    staleTime: 15_000,
  });
}

export function useCreateHotel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHotel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manager", "hotels"] });
    },
  });
}

export function useUpdateHotel(hotelId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminHotelInput) => updateHotel(hotelId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manager", "hotels"] });
      qc.invalidateQueries({ queryKey: ["manager", "hotel", hotelId] });
    },
  });
}

export function useDeleteHotel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hotelId: number) => deleteHotel(hotelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manager", "hotels"] });
    },
  });
}

export function useActivateHotel(hotelId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => activateHotel(hotelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manager", "hotels"] });
      qc.invalidateQueries({ queryKey: ["manager", "hotel", hotelId] });
    },
  });
}

export function useUploadHotelPhoto(hotelId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadHotelPhoto(hotelId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manager", "hotels"] });
      qc.invalidateQueries({ queryKey: ["manager", "hotel", hotelId] });
    },
  });
}

// ---------------- Rooms ----------------

/**
 * Rooms cache is maintained locally after each create/update/delete because
 * the backend has no dedicated list endpoint (rooms belong to a hotel and are
 * returned via the guest-facing /hotels/{id}/info). The manager screen seeds
 * this cache from the hotel workspace as rooms are added.
 */
export function useManagerRooms(hotelId: number) {
  return useQuery<AdminRoomDto[]>({
    queryKey: ["manager", "rooms", hotelId],
    queryFn: () => listRooms(hotelId),
    enabled: !!hotelId,
    staleTime: 30_000,
  });
}

export function useCreateRoom(hotelId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminRoomInput) => createRoom(hotelId, body),
    onSuccess: (room) => {
      qc.setQueryData<AdminRoomDto[]>(["manager", "rooms", hotelId], (prev) => [
        ...(prev ?? []),
        room,
      ]);
    },
  });
}

export function useUpdateRoom(hotelId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: number; body: AdminRoomInput }) =>
      updateRoom(hotelId, roomId, body),
    onSuccess: (room) => {
      qc.setQueryData<AdminRoomDto[]>(["manager", "rooms", hotelId], (prev) =>
        (prev ?? []).map((r) => (r.id === room.id ? room : r)),
      );
      qc.invalidateQueries({ queryKey: ["manager", "inventory", room.id] });
    },
  });
}

export function useDeleteRoom(hotelId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: number) => deleteRoom(hotelId, roomId),
    onSuccess: (_v, roomId) => {
      qc.setQueryData<AdminRoomDto[]>(["manager", "rooms", hotelId], (prev) =>
        (prev ?? []).filter((r) => r.id !== roomId),
      );
      qc.removeQueries({ queryKey: ["manager", "inventory", roomId] });
    },
  });
}

export function useUploadRoomPhoto(hotelId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, file }: { roomId: number; file: File }) =>
      uploadRoomPhoto(hotelId, roomId, file),
    onSuccess: (url, vars) => {
      qc.setQueryData<AdminRoomDto[]>(["manager", "rooms", hotelId], (prev) =>
        (prev ?? []).map((r) =>
          r.id === vars.roomId ? { ...r, photos: [...r.photos, url] } : r,
        ),
      );
    },
  });
}

// ---------------- Inventory ----------------

export function useRoomInventory(roomId: number | undefined) {
  return useQuery<InventoryDto[]>({
    queryKey: ["manager", "inventory", roomId],
    queryFn: () => getRoomInventory(roomId!),
    enabled: !!roomId,
    staleTime: 15_000,
  });
}

export function useUpdateInventory(roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateInventoryRequestDto) => updateRoomInventory(roomId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manager", "inventory", roomId] });
    },
  });
}

// ---------------- Bookings ----------------

export function useManagerBookings(hotelId: number, q: AdminBookingsQuery = {}) {
  return useQuery<PageBookingDto>({
    queryKey: ["manager", "bookings", hotelId, q.page ?? 0, q.size ?? 20],
    queryFn: () => getHotelBookings(hotelId, q),
    enabled: !!hotelId,
    staleTime: 20_000,
  });
}

// ---------------- Refunds ----------------

export function useRefundPending() {
  const enabled = useIsManager();
  return useQuery<BookingDto[]>({
    queryKey: ["manager", "refunds"],
    queryFn: getRefundPending,
    enabled,
    staleTime: 15_000,
  });
}

export function useSettleRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: number) => settleRefund(bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manager", "refunds"] });
      qc.invalidateQueries({ queryKey: ["manager", "bookings"] });
    },
  });
}

// ---------------- Reports ----------------

export function useHotelReport(hotelId: number, q: ReportQuery = {}) {
  return useQuery<HotelReportDto>({
    queryKey: ["manager", "report", hotelId, q.startDate ?? "", q.endDate ?? ""],
    queryFn: () => getHotelReport(hotelId, q),
    enabled: !!hotelId,
    staleTime: 30_000,
  });
}
