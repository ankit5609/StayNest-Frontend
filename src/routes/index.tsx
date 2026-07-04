import { createFileRoute } from "@tanstack/react-router";
import heroAsset from "@/assets/hero.png";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { FeatureStrip } from "@/components/landing/FeatureStrip";
import { CuratedStays } from "@/components/landing/CuratedStays";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StayNest — Find your nest. Make it memorable." },
      {
        name: "description",
        content:
          "Curated boutique stays for the modern traveler. Peaceful getaways and meaningful experiences, thoughtfully handpicked by StayNest.",
      },
      { property: "og:title", content: "StayNest — Find your nest. Make it memorable." },
      {
        property: "og:description",
        content:
          "Curated boutique stays for the modern traveler. Peaceful getaways and meaningful experiences.",
      },
      { property: "og:image", content: heroAsset },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <Nav />
      <Hero />
      <FeatureStrip />
      <CuratedStays />
      <FinalCTA />
      <Footer />
    </main>
  );
}
