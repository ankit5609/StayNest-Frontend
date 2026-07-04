import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { HotelGallery } from "@/components/hotel/HotelGallery";
import { HotelHeader } from "@/components/hotel/HotelHeader";
import { HotelAmenities } from "@/components/hotel/HotelAmenities";
import { RoomsList } from "@/components/hotel/RoomsList";
import { ReviewsSection } from "@/components/hotel/ReviewsSection";
import { AskAssistant } from "@/components/hotel/AskAssistant";
import { BookingCard } from "@/components/hotel/BookingCard";
import { useHotelInfo } from "@/hooks/queries/useHotelDetails";
import { initBooking } from "@/lib/api/bookings";
import type { RoomInfoDto } from "@/lib/api/types";

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const searchSchema = z.object({
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  rooms: fallback(z.number().int().min(1), 1).default(1),
});

export const Route = createFileRoute("/hotels/$hotelId")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Hotel details — StayNest" },
      { name: "description", content: "Explore rooms, amenities and guest reviews. Reserve your stay with StayNest." },
      { property: "og:title", content: "Hotel details — StayNest" },
      { property: "og:description", content: "Curated luxury stays. Real prices, real reviews." },
    ],
  }),
  component: HotelDetailsPage,
});

function HotelDetailsPage() {
  const { hotelId } = Route.useParams();
  const search = Route.useSearch();

  const startDate = search.checkIn || todayPlus(7);
  const endDate = search.checkOut || todayPlus(10);
  const roomsCount = search.rooms || 1;

  const nights = useMemo(() => {
    const n = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [startDate, endDate]);

  const { data, isLoading, isError, error } = useHotelInfo(hotelId, {
    startDate,
    endDate,
    roomsCount,
  });

  const [selectedRoom, setSelectedRoom] = useState<RoomInfoDto | undefined>();
  const [reserving, setReserving] = useState(false);
  const navigate = useNavigate();

  const activeRoom = selectedRoom ?? data?.rooms?.[0];

  const handleReserve = async () => {
    if (!activeRoom || !data) return;
    setReserving(true);
    try {
      const booking = await initBooking({
        hotelId: data.hotel.id,
        roomId: activeRoom.id,
        checkInDate: startDate,
        checkOutDate: endDate,
        roomsCount,
      });
      navigate({ to: "/checkout/$bookingId", params: { bookingId: String(booking.id) } });
    } catch (e) {
      toast.error((e as Error)?.message ?? "Couldn't reserve the room. Please try again.");
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main className="mx-auto max-w-[1300px] px-4 pt-24 pb-16 md:px-8">
        {isLoading && !data && (
          <div className="grid place-items-center py-32 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <h2 className="font-display text-xl text-destructive">We couldn't load this stay</h2>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              {(error as Error)?.message ?? "Please try again in a moment."}
            </p>
          </div>
        )}

        {data && (
          <>
            <HotelHeader hotel={data.hotel} />
            <div className="mt-6">
              <HotelGallery photos={data.hotel.photos ?? []} name={data.hotel.name} />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
              <div className="space-y-10">
                <HotelAmenities amenities={data.hotel.amenities ?? []} />
                <RoomsList
                  rooms={data.rooms}
                  nights={nights}
                  selectedRoomId={activeRoom?.id}
                  onSelect={setSelectedRoom}
                />
                <AskAssistant hotelId={hotelId} hotelName={data.hotel.name} />
                <ReviewsSection
                  hotelId={hotelId}
                  averageRating={data.hotel.averageRating}
                  reviewCount={data.hotel.reviewCount}
                />
              </div>

              <div className="lg:min-h-[600px]">
                <BookingCard
                  room={activeRoom}
                  startDate={startDate}
                  endDate={endDate}
                  roomsCount={roomsCount}
                  nights={nights}
                  onReserve={handleReserve}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
