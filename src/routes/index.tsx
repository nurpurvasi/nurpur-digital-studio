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
      <MediaTicker />
      <MediaSpotlight />
      <PhotoStrips />
      <ExploreNurpur />
      <LatestPhotosMasonry />
      <VideoWallPremium />
      <LatestReels />

      <Section className="!py-14 sm:!py-16">
        <div className="mx-auto max-w-3xl">
          <WeatherPanel compact />
        </div>
      </Section>

      <LocalBusinessRow />
      <DiscoverCTA />
    </SiteLayout>
  );

}
