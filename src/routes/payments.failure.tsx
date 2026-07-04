import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";

import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

const searchSchema = z.object({
  bookingId: fallback(z.coerce.string(), "").default(""),
});

export const Route = createFileRoute("/payments/failure")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Payment failed — StayNest" },
      { name: "description", content: "Your payment couldn't be completed." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FailurePage,
});

function FailurePage() {
  const { bookingId } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[600px] px-4 pt-24 pb-20 md:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-3xl text-primary md:text-4xl">Payment couldn't be completed</h1>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Your reservation is still on hold. You can try paying again — no charge has been made.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {bookingId && (
              <Link
                to="/checkout/$bookingId"
                params={{ bookingId }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-medium text-primary-foreground transition hover:bg-primary-mid"
              >
                Try again
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2.5 text-[13.5px] font-medium text-ink transition hover:border-primary/50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
