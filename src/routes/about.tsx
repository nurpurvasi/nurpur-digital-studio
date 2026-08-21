import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Film, MapPin, Store } from "lucide-react";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";

const SITE = "https://nurpur-digital-studio.lovable.app";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NurpurVasi Media — Local Photos, Videos & Stories of Nurpur" },
      {
        name: "description",
        content:
          "NurpurVasi Media is a local media platform from Nurpur, Himachal Pradesh, sharing photos, videos, reels, local stories, events, culture and businesses of our town.",
      },
      { property: "og:title", content: "About NurpurVasi Media" },
      {
        property: "og:description",
        content:
          "A local media platform documenting Nurpur — its photos, videos, events, culture and businesses.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/about` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/about` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "NurpurVasi Media",
          url: SITE,
          description:
            "Local media platform sharing photos, videos, events, culture and businesses of Nurpur, Himachal Pradesh.",
          areaServed: { "@type": "Place", name: "Nurpur, Himachal Pradesh, India" },
        }),
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    Icon: Camera,
    title: "Photos of Nurpur",
    body: "Nurpur Fort, temples, melas, mountains, streets and everyday moments — archived so anyone can find them.",
  },
  {
    Icon: Film,
    title: "Videos & reels",
    body: "Event coverage, temple festivals, cultural programmes and short clips from our social pages.",
  },
  {
    Icon: Store,
    title: "Local businesses",
    body: "A simple, honest listing so local shops and services can be found online by people nearby.",
  },
  {
    Icon: MapPin,
    title: "Rooted in Nurpur",
    body: "Everything published here is about Nurpur and its surrounding villages in Kangra, Himachal Pradesh.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>About us</Eyebrow>
          <h1
            className="mt-5 text-4xl tracking-tight sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A local media platform for <span className="text-gradient italic">Nurpur</span>
          </h1>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              NurpurVasi Media documents our town through pictures and video. We publish photos and
              videos of Nurpur's places, temples, melas, festivals, sports, culture and daily life,
              along with short reels from our social pages.
            </p>
            <p>
              The idea is simple: when someone searches for Nurpur — its fort, its temples, its
              events — they should find real, local images and stories instead of nothing at all.
              Every photo and video we publish gets its own page with a title, description and date,
              so it stays easy to find and share.
            </p>
            <p>
              We also keep a small business section so shops and services from Nurpur can be
              discovered online, and a compact weather panel for the town. We do not publish
              government notices, job listings, exam information or political content.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {pillars.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-3xl border border-border bg-card p-6">
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl text-background"
                style={{ background: "var(--gradient-vivid)" }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link to="/photos" className="btn-primary inline-flex">
            Browse photos
          </Link>
          <Link to="/videos" className="btn-ghost inline-flex">
            Watch videos
          </Link>
          <Link to="/contact" className="btn-ghost inline-flex">
            Contact us
          </Link>
        </div>
      </Section>
    </SiteLayout>
  );
}
