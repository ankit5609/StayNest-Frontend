import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { SearchSummaryBar } from "@/components/search/SearchSummaryBar";
import { FilterSidebar, type FilterValues } from "@/components/search/FilterSidebar";
import { ResultsGrid } from "@/components/search/ResultsGrid";
import { ResultsHeader } from "@/components/search/ResultsHeader";
import { EmptyState } from "@/components/search/EmptyState";


import { BenefitsStrip } from "@/components/search/BenefitsStrip";
import {
  AssistantPanel,
  type AssistantMessage,
} from "@/components/search/AssistantPanel";
import { useInfiniteHotelSearch } from "@/hooks/queries/useHotelSearch";
import { useNLHotelSearch } from "@/hooks/queries/useNLHotelSearch";
import type {
  NLInterpretedQuery,
  NLMissingField,
  SortBy,
} from "@/lib/api/types";


const sortBySchema = z.enum(["PRICE_ASC", "PRICE_DESC", "RATING_DESC"]);

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  city: fallback(z.string(), "").default(""),
  startDate: fallback(z.string(), "").default(""),
  endDate: fallback(z.string(), "").default(""),
  roomsCount: fallback(z.number().int().min(1), 1).default(1),
  adults: fallback(z.number().int().min(1), 2).default(2),
  children: fallback(z.number().int().min(0), 0).default(0),
  page: fallback(z.number().int().min(0), 0).default(0),
  size: fallback(z.number().int().min(1).max(50), 12).default(12),
  sortBy: fallback(sortBySchema, "PRICE_ASC").default("PRICE_ASC"),
  minPrice: z.preprocess((val) => (val === null || val === "null" || val === "" ? undefined : val), z.number().optional()),
  maxPrice: z.preprocess((val) => (val === null || val === "null" || val === "" ? undefined : val), z.number().optional()),
  minRating: z.preprocess((val) => (val === null || val === "null" || val === "" ? undefined : val), z.number().optional()),
  focus: fallback(z.string(), "").default("").optional(),
});


type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Search stays — StayNest" },
      {
        name: "description",
        content:
          "Discover curated luxury stays with StayNest. Filter by price, rating and style, or ask our AI concierge for a personal recommendation.",
      },
      { property: "og:title", content: "Search stays — StayNest" },
      {
        property: "og:description",
        content:
          "Curated luxury hotels, filtered your way. Powered by StayNest's AI concierge.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });

  const [interpreted, setInterpreted] = useState<NLInterpretedQuery | undefined>();
  const [missing, setMissing] = useState<NLMissingField[] | undefined>();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [assistantHighlight, setAssistantHighlight] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const nl = useNLHotelSearch();
  const lastProcessedQ = useRef<string | null>(null);

  useEffect(() => {
    if (search.focus !== "assistant") return;
    setAssistantHighlight(true);
    const el = document.getElementById("staynest-assistant");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const t = window.setTimeout(() => setAssistantHighlight(false), 2400);
    navigate({
      search: (prev: SearchParams) => ({ ...prev, focus: undefined }),
      replace: true,
    });
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.focus]);


  useEffect(() => {
    console.log("frontend-debug: search.q changed:", search.q);
    if (!search.q) return;
    if (lastProcessedQ.current === search.q) {
      console.log("frontend-debug: search.q already processed, skipping.");
      return;
    }
    console.log("frontend-debug: processing new search.q:", search.q);
    lastProcessedQ.current = search.q;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: search.q },
    ]);

    console.log("frontend-debug: invoking nl.mutate with params:", {
      query: search.q,
      city: search.city,
      startDate: search.startDate,
      endDate: search.endDate,
      roomsCount: search.roomsCount,
      adults: search.adults,
    });

    setIsThinking(true);
    nl.mutateAsync({
      query: search.q,
      city: search.city || undefined,
      startDate: search.startDate || undefined,
      endDate: search.endDate || undefined,
      roomsCount: search.roomsCount,
      adults: search.adults,
    })
    .then((data) => {
      setIsThinking(false);
      console.log("frontend-debug: nl.mutateAsync success data:", data);
      setInterpreted(data.interpretedQuery);
      setMissing(data.missingFields);
      const i = data.interpretedQuery;
      const friendlyNames: Record<string, string> = {
        startDate: "check-in date",
        endDate: "check-out date",
        roomsCount: "rooms",
        adults: "guests",
        city: "destination",
        minPrice: "min price",
        maxPrice: "max price",
        minRating: "min rating",
        sortBy: "sort preference",
      };
      const missingFriendly = data.missingFields?.map((f) => friendlyNames[f] ?? f) ?? [];
      let summary = "";
      if (data.missingFields?.includes("feature_disabled" as any)) {
        summary = "Sorry, the StayNest AI search concierge is currently disabled in the backend configuration.";
      } else if (missingFriendly.length) {
        summary = `I've looked for stays in ${i?.city ?? "your destination"}. To refine, I still need: ${missingFriendly.join(", ")}.`;
      } else {
        summary = `Great! Here are the best matches for you.`;
      }

      console.log("frontend-debug: setting assistant message summary:", summary);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text: summary },
      ]);

      if (i) {
        console.log("frontend-debug: navigating with interpreted query details:", i);
        navigate({
          search: (prev: SearchParams) => ({
            ...prev,
            q: "",
            city: prev.city || i.city || "",
            startDate: prev.startDate || i.startDate || "",
            endDate: prev.endDate || i.endDate || "",
            roomsCount: prev.roomsCount || i.roomsCount || 1,
            adults: prev.adults || i.adults || 2,
            minPrice: prev.minPrice ?? i.minPrice ?? undefined,
            maxPrice: prev.maxPrice ?? i.maxPrice ?? undefined,
            minRating: prev.minRating ?? i.minRating ?? undefined,
            sortBy: prev.sortBy || i.sortBy || "PRICE_ASC",
          }),
          replace: true,
        });
      } else {
        console.log("frontend-debug: navigating with q empty");
        navigate({
          search: (prev: SearchParams) => ({
            ...prev,
            q: "",
          }),
          replace: true,
        });
      }
    })
    .catch((err) => {
      setIsThinking(false);
      console.error("frontend-debug: nl.mutateAsync error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: `Sorry, I couldn't process that. ${err.message}`,
        },
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.q]);

  const filters = useMemo<FilterValues>(
    () => ({
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      minRating: search.minRating,
      sortBy: search.sortBy as SortBy,
    }),
    [search.minPrice, search.maxPrice, search.minRating, search.sortBy],
  );

  const query = useInfiniteHotelSearch({
    city: search.city,
    startDate: search.startDate,
    endDate: search.endDate,
    roomsCount: search.roomsCount,
    size: search.size,
    sortBy: filters.sortBy,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
  });

  const setFilters = (next: FilterValues) =>
    navigate({
      search: (prev: SearchParams) => ({ ...prev, ...next, page: 0 }),
      replace: true,
    });

  const resetFilters = () =>
    navigate({
      search: (prev: SearchParams) => ({
        ...prev,
        minPrice: undefined,
        maxPrice: undefined,
        minRating: undefined,
        sortBy: "PRICE_ASC",
        page: 0,
      }),
      replace: true,
    });

  const pages = query.data?.pages ?? [];
  const lastPage = pages[pages.length - 1];
  const hotels = pages.flatMap((p) => p.content);
  const totalGuests = search.adults + search.children;
  const requiredReady = Boolean(
    search.city && search.startDate && search.endDate && search.roomsCount,
  );

  const total = lastPage?.totalElements ?? 0;
  const from = total === 0 ? 0 : 1;
  const to = hotels.length;
  const hasMore = Boolean(query.hasNextPage);
  const showEndCap = requiredReady && !hasMore && hotels.length > 0;


  return (
    <div className="min-h-screen bg-background pt-20">
      <Nav />

      <SearchSummaryBar
        city={search.city}
        startDate={search.startDate}
        endDate={search.endDate}
        roomsCount={search.roomsCount}
        adults={search.adults}
        children={search.children}
      />

      <main className="mx-auto max-w-[1440px] px-6 pb-12 pt-6 md:px-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
          <FilterSidebar
            value={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />

          <section className="min-w-0 space-y-6">


            <div>
              <ResultsHeader
                total={total}
                city={search.city || interpreted?.city}
                from={from}
                to={to}
                sortBy={filters.sortBy}
                onSortChange={(s) => setFilters({ ...filters, sortBy: s })}
                view={view}
                onViewChange={setView}
              />

              <motion.div
                key={`grid-${hotels.length}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {!requiredReady && !isThinking ? (
                  <EmptyState
                    title="Tell us where you're going"
                    message="Add a destination, dates and rooms — or ask our AI concierge on the right for a personal recommendation."
                  />
                ) : query.isError ? (
                  <EmptyState
                    title="Something went wrong"
                    message="We couldn't load stays right now. Please adjust your search or try again in a moment."
                  />
                ) : requiredReady && !query.isLoading && hotels.length === 0 ? (
                  <EmptyState
                    title="No stays match your filters"
                    message="Try widening your price range, lowering the minimum rating, or exploring nearby dates."
                  />
                ) : (
                  <ResultsGrid
                    hotels={hotels}
                    isLoading={query.isLoading}
                    context={{
                      startDate: search.startDate,
                      endDate: search.endDate,
                      roomsCount: search.roomsCount,
                    }}
                  />

                )}
              </motion.div>

              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => query.fetchNextPage()}
                    disabled={query.isFetchingNextPage}
                    className="group inline-flex items-center gap-3 rounded-full border border-primary/30 bg-background px-8 py-3.5 text-[13px] font-medium uppercase tracking-[0.18em] text-primary shadow-[0_10px_30px_-12px_rgba(17,26,19,0.25)] transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_16px_40px_-14px_rgba(17,26,19,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {query.isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Loading more stays…
                      </>
                    ) : (
                      <>
                        Load more stays
                        <span
                          className="text-[11px] tracking-[0.2em] opacity-70"
                          aria-hidden
                        >
                          {hotels.length} / {total}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {showEndCap && (
                <p className="mt-12 text-center text-[12px] uppercase tracking-[0.24em] text-muted-foreground">
                  Showing all {total} available stays
                </p>
              )}

            </div>
          </section>

          <AssistantPanel
            messages={messages}
            interpreted={interpreted}
            missing={missing?.filter((f) => f !== ("feature_disabled" as any))}
            isThinking={isThinking}
            highlight={assistantHighlight}
            onAsk={(q) =>
              navigate({ search: (prev: SearchParams) => ({ ...prev, q }), replace: true })
            }
            sortBy={filters.sortBy}
            onSortChange={(s) => setFilters({ ...filters, sortBy: s })}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onPriceApply={(min, max) =>
              setFilters({ ...filters, minPrice: min, maxPrice: max })
            }
          />

        </div>
      </main>

      <BenefitsStrip />
      <Footer />
    </div>
  );
}
