import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DestinationField } from "./search/DestinationField";
import { DateField } from "./search/DateField";
import { GuestsField, type GuestsValue } from "./search/GuestsField";

function toIsoDate(d: Date): string {
  // Local YYYY-MM-DD (avoids off-by-one from toISOString UTC shift).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function SearchBar() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState<GuestsValue>({ adults: 2, children: 0, rooms: 1 });

  // Keep checkout ≥ checkin
  const handleCheckIn = (d: Date | undefined) => {
    setCheckIn(d);
    if (d && checkOut && checkOut <= d) setCheckOut(undefined);
  };

  const minCheckOut = checkIn
    ? new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 1)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/search",
      search: {
        city: destination,
        startDate: checkIn ? toIsoDate(checkIn) : "",
        endDate: checkOut ? toIsoDate(checkOut) : "",
        roomsCount: guests.rooms,
        adults: guests.adults,
        children: guests.children,
      },
    });
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="w-full rounded-3xl bg-background/95 backdrop-blur-sm shadow-[0_20px_60px_-25px_rgba(17,26,19,0.35)] ring-1 ring-black/[0.04] transition-shadow duration-300"
    >
      <div className="flex flex-col divide-y divide-border md:flex-row md:items-stretch md:divide-x md:divide-y-0">
        <DestinationField value={destination} onChange={setDestination} />
        <DateField label="Check in" value={checkIn} onChange={handleCheckIn} />
        <DateField label="Check out" value={checkOut} onChange={setCheckOut} minDate={minCheckOut} />
        <GuestsField value={guests} onChange={setGuests} />

        <div className="flex items-center p-2">
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-7 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary-mid md:h-14 md:w-auto"
          >
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
