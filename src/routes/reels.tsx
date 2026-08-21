import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Film } from "lucide-react";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import {
  useGallery,
  useReels,
  socialPlatform,
  thumbOf,
  displayTitle,
  formatDate,
} from "@/components/media/useGallery";

const SITE = "https://nurpur-digital-studio.lovable.app";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Nurpur Reels & Shorts — Instagram, Facebook & YouTube | NurpurVasi Media" },
      {
        name: "description",
        content:
          "Watch the latest NurpurVasi Media reels and shorts from Instagram, Facebook and YouTube — quick clips of Nurpur events, temples, melas and daily life.",
      },
      { property: "og:title", content: "Nurpur Reels & Shorts — NurpurVasi Media" },
      {
        property: "og:description",
        content: "Latest Nurpur reels and shorts from our Instagram, Facebook and YouTube pages.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/reels` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/reels` }],
  }),
  component: ReelsPage,
});

function ReelsPage() {
  const { items } = useGallery();
  const reels = useReels(items);

  return (
    <SiteLayout>
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Reels & shorts</Eyebrow>
          <h1
            className="mt-5 text-4xl tracking-tight sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Straight from our <span className="text-gradient italic">socials</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Short clips of Nurpur published on our Instagram, Facebook and YouTube pages. Tap a card
            to watch it on the original platform.
          </p>
        </div>

        {reels.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">
            Reels will appear here as soon as they are published.
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {reels.map((r) => (
              <a
                key={r.id}
                href={r.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-500 hover:-translate-y-1"
              >
                <div className="aspect-[9/16] bg-muted">
                  {thumbOf(r) ? (
                    <img
                      src={thumbOf(r)}
                      alt={r.alt_text || displayTitle(r)}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      className="grid h-full w-full place-items-center text-background/80"
                      style={{ background: "var(--gradient-vivid)" }}
                    >
                      <Film className="h-8 w-8" />
                    </span>
                  )}
                </div>
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in oklab, var(--navy) 82%, transparent), transparent)",
                  }}
                />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-semibold text-background">
                    <ExternalLink className="h-3 w-3" /> {socialPlatform(r.media_url)}
                  </span>
                  <span className="mt-2 block line-clamp-2 text-sm font-semibold text-background">
                    {displayTitle(r)}
                  </span>
                  {formatDate(r.publish_date || r.created_at) && (
                    <span className="mt-0.5 block text-[11px] text-background/75">
                      {formatDate(r.publish_date || r.created_at)}
                    </span>
                  )}
                </span>
              </a>
            ))}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
