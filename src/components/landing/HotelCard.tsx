import { Heart, MapPin, Star } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useImageRotation } from "@/hooks/useImageRotation";
import { useInViewport } from "@/hooks/useInViewport";
import { useToggleWishlist, useWishlistIds } from "@/hooks/queries/useWishlist";
import type { HotelPriceResponseDto } from "@/lib/api/types";

interface Props {
  hotel: HotelPriceResponseDto;
}

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function HotelCard({ hotel }: Props) {
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const cardRef = useRef<HTMLElement | null>(null);
  const inView = useInViewport(cardRef, 0.35);
  const { ids } = useWishlistIds();
  const toggle = useToggleWishlist();
  const fav = ids.has(hotel.id);
  const navigate = useNavigate();

  const photos = hotel.photos?.length ? hotel.photos : [];
  const index = useImageRotation({
    count: photos.length,
    intervalMs: 1800,
    paused: hovered || !inView,
  });

  const primaryAmenities = (hotel.amenities ?? []).slice(0, 2);

  return (
    <article
      ref={cardRef as React.RefObject<HTMLElement>}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        // Ignore clicks that originated on the favourite button
        if ((e.target as HTMLElement).closest('[data-wishlist-btn]')) return;
        e.preventDefault();
        navigate({
          to: "/hotels/$hotelId",
          params: { hotelId: String(hotel.id) },
          search: { checkIn: "", checkOut: "", rooms: 1 },
        });
      }}
      className="group relative w-[300px] shrink-0 cursor-pointer select-none sm:w-[330px]"
    >
      <Link
        to="/hotels/$hotelId"
        params={{ hotelId: String(hotel.id) }}
        search={{ checkIn: "", checkOut: "", rooms: 1 }}
        className="block cursor-pointer"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-surface shadow-[0_10px_30px_-18px_rgba(17,26,19,0.35)] transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-25px_rgba(17,26,19,0.45)]">
          {photos.length === 0 && <div className="shimmer h-full w-full" />}

          {photos.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt={`${hotel.name} — photo ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              onLoad={() => setLoaded((s) => ({ ...s, [i]: true }))}
              className={[
                "pointer-events-none absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-out",
                i === index ? "opacity-100 scale-[1.02]" : "opacity-0 scale-100",
                loaded[i] ? "" : "blur-md",
                "group-hover:scale-[1.06]",
              ].join(" ")}
              style={{ transitionProperty: "opacity, transform, filter" }}
            />
          ))}

          {/* Rating badge */}
          {hotel.reviewCount > 0 && (
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-[12px] font-medium text-ink shadow-sm">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
              {hotel.averageRating.toFixed(1)}
              <span className="text-muted-foreground">({hotel.reviewCount})</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4 px-1">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-medium text-ink transition-transform duration-500 group-hover:-translate-y-0.5">
              {hotel.name}
            </h3>
            <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {hotel.city}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">From</div>
            <div className="text-[17px] font-semibold text-ink">
              {currency.format(hotel.price)}
            </div>
            <div className="text-[11px] text-muted-foreground">/night</div>
          </div>
        </div>

        {primaryAmenities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[12px] text-muted-foreground">
            {primaryAmenities.map((a) => (
              <span key={a}>· {a}</span>
            ))}
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none mt-3 px-1 text-[13px] font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          View stay →
        </div>
      </Link>

      {/* Favourite — sibling of Link so nested <button> in <a> doesn't break hydration */}
      <button
        type="button"
        data-wishlist-btn
        aria-label={fav ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={fav}
        disabled={toggle.isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle.mutate(
            { hotelId: hotel.id, next: !fav },
            {
              onError: (err) =>
                toast.error((err as Error)?.message ?? "Couldn't update wishlist."),
            },
          );
        }}
        className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/95 text-ink transition-transform duration-300 hover:scale-110 active:scale-95 disabled:opacity-60"
      >
        <Heart
          className={["h-4 w-4", fav ? "fill-primary text-primary" : ""].join(" ")}
          strokeWidth={1.6}
          aria-hidden
        />
      </button>
    </article>
  );
}
