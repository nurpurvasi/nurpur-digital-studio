import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { MediaGrid } from "@/components/media/MediaGrid";
import { ReelsRow } from "@/components/media/MediaSections";
import { useGallery, useVideos } from "@/components/media/useGallery";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Nurpur Videos & Reels — Events, Culture, Vlogs | NurpurVasi Media" },
      {
        name: "description",
        content:
          "Watch videos from Nurpur — local events, temple festivals, cultural programmes, drone shots and neighbourhood stories published by NurpurVasi Media.",
      },
      { property: "og:title", content: "Nurpur Videos & Reels — Events, Culture, Vlogs" },
      {
        property: "og:description",
        content: "Local Nurpur videos, event coverage and reels in one place.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nurpur-digital-studio.lovable.app/videos" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nurpur-digital-studio.lovable.app/videos" }],
  }),
  component: VideosPage,
});

function VideosPage() {
  const { items } = useGallery();
  const videos = useVideos(items);

  return (
    <SiteLayout>
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Video library</Eyebrow>
          <h1
            className="mt-5 text-4xl tracking-tight sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nurpur <span className="text-gradient italic">in motion</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Event coverage, cultural programmes and everyday life — tap to play.
          </p>
        </div>
        <div className="mt-12">
          <MediaGrid items={videos} emptyLabel="Videos will appear here once published from Admin." />
        </div>
      </Section>
      <ReelsRow />
    </SiteLayout>
  );
}
