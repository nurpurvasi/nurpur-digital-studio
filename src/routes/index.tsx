import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section } from "@/components/site/Layout";
import {
  MediaTicker,
  MediaSpotlight,
  PhotoStrips,
  ExploreNurpur,
  LatestPhotosMasonry,
  VideoWallPremium,
  LatestReels,
  LocalBusinessRow,
  DiscoverCTA,
} from "@/components/media/HomeMedia";
import { WeatherPanel } from "@/components/media/WeatherPanel";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NurpurVasi Media — Photos, Videos, Events & Weather of Nurpur" },
      {
        name: "description",
        content:
          "NurpurVasi Media is the local media portal for Nurpur, Himachal Pradesh — photos, videos, local events, culture, live weather and business promotion.",
      },
      { property: "og:title", content: "NurpurVasi Media — Photos, Videos, Events & Weather of Nurpur" },
      {
        property: "og:description",
        content:
          "Explore Nurpur through photos, videos, local events, culture and live weather — plus promotion for local businesses.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nurpur-digital-studio.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nurpur-digital-studio.lovable.app/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <MediaHero />
      <LatestMediaStrip />
      <CategoryRows />
      <VideoWall />
      <ReelsRow />

      <Section className="!py-16 sm:!py-24">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <WeatherPanel />
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <Eyebrow>Local business</Eyebrow>
            <h2
              className="mt-5 text-2xl tracking-tight sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Promote your shop to all of Nurpur
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              We photograph, film and publish local businesses across our website and social pages —
              reaching thousands of neighbours every week.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/business" className="btn-primary group">
                <Store className="h-4 w-4" /> Business directory
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/contact" className="btn-ghost">
                Get featured
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <ClientsSection />
      <PremiumContactSection />
      <PremiumCTA />
    </SiteLayout>
  );
}
