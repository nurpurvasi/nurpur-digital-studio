import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useGallery, useVideos, thumbOf, formatDate, displayTitle } from "@/components/media/useGallery";

const SITE = "https://nurpur-digital-studio.lovable.app";

export const Route = createFileRoute("/videos/")({
  head: () => ({
    meta: [
      { title: "Nurpur Videos — Events, Temples, Culture & Vlogs | NurpurVasi Media" },
      {
        name: "description",
        content:
          "Watch videos from Nurpur — local events, temple festivals, cultural programmes, drone shots and neighbourhood stories published by NurpurVasi Media.",
      },
      { property: "og:title", content: "Nurpur Videos — Events, Temples, Culture & Vlogs" },
      {
        property: "og:description",
        content: "Local Nurpur videos and event coverage, all in one place.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/videos` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/videos` }],
  }),
  component: VideosPage,
});

function VideosPage() {
  const { items } = useGallery();
  const videos = useVideos(items);
  const feature = videos.find((v) => v.featured) ?? videos[0];
  const rest = videos.filter((v) => v.id !== feature?.id);

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
            Event coverage, temple festivals, cultural programmes and everyday life in Nurpur,
            Himachal Pradesh — tap any video to watch it with full details.
          </p>
        </div>

        {feature && (
          <Link
            to="/videos/$id"
            params={{ id: feature.slug || feature.id }}
            className="group mt-12 block overflow-hidden rounded-[28px] border border-border bg-card"
          >
            <div className="relative aspect-video w-full bg-muted">
              {thumbOf(feature) ? (
                <img
                  src={thumbOf(feature)}
                  alt={feature.alt_text || displayTitle(feature)}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <span
                  className="grid h-full w-full place-items-center text-background/80"
                  style={{ background: "var(--gradient-vivid)" }}
                >
                  <Play className="h-9 w-9" />
                </span>
              )}
            </div>
            <div className="p-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Featured video
              </span>
              <h2 className="mt-2 text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                {displayTitle(feature)}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(feature.publish_date || feature.created_at)}
              </p>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-12">
            <MediaGrid items={rest} detail="videos" emptyLabel="" />
          </div>
        )}
        {videos.length === 0 && (
          <p className="mt-12 text-sm text-muted-foreground">
            Videos will appear here as soon as they are published.
          </p>
        )}
      </Section>
    </SiteLayout>
  );
}
