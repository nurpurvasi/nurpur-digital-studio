import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, ExternalLink, Film, Image as ImageIcon, Play } from "lucide-react";
import type { GalleryItem } from "@/lib/gallery.functions";
import { Section, Eyebrow } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { MediaCard } from "./MediaGrid";
import { MediaLightbox } from "./MediaLightbox";
import {
  formatDate,
  groupByCategory,
  socialPlatform,
  thumbOf,
  useGallery,
  usePhotos,
  useReels,
  useVideos,
  displayTitle,
} from "./useGallery";

/** Cinematic, visual-first hero built from the newest featured media. */
export function MediaHero() {
  const { items } = useGallery();
  const photos = usePhotos(items);
  const feature = items.filter((i) => i.featured)[0] ?? items[0];
  const strip = photos.slice(0, 8);
  const [openAt, setOpenAt] = useState<number | null>(null);

  return (
    <section className="relative -mt-24 overflow-hidden pt-32 pb-16 sm:pb-20">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 520px at 15% 0%, color-mix(in oklab, var(--royal) 18%, transparent), transparent 62%), radial-gradient(800px 480px at 88% 8%, color-mix(in oklab, var(--sun) 20%, transparent), transparent 60%), linear-gradient(180deg, #ffffff, #f6f7fb)",
        }}
      />
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Eyebrow>Nurpur · Himachal Pradesh</Eyebrow>
            <h1
              className="mt-6 text-balance text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl animate-fade-up"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your window to <span className="text-gradient italic">Nurpur</span>
            </h1>
            <p
              className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-up"
              style={{ animationDelay: "0.12s" }}
            >
              Photos, videos, local events, culture, weather and neighbourhood businesses — captured
              and published by NurpurVasi Media.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/photos" className="btn-primary group !px-7 !py-3.5">
                <ImageIcon className="h-4 w-4" /> Explore photos
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/videos" className="btn-ghost !px-7 !py-3.5">
                <Film className="h-4 w-4" /> Watch videos
              </Link>
            </div>
          </div>

          <div className="relative">
            {feature ? (
              <button
                onClick={() => setOpenAt(0)}
                className="group relative block w-full overflow-hidden rounded-[28px] border border-border shadow-[0_40px_90px_-50px_color-mix(in_oklab,var(--navy)_60%,transparent)]"
              >
                <div className="aspect-[4/5] w-full bg-muted sm:aspect-[4/3]">
                  {thumbOf(feature) ? (
                    <img
                      src={thumbOf(feature)}
                      alt={feature.alt_text || displayTitle(feature)}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  ) : null}
                </div>
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in oklab, var(--navy) 85%, transparent), transparent)",
                  }}
                />
                {feature.media_type === "video" && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span
                      className="grid h-16 w-16 place-items-center rounded-full text-background"
                      style={{ background: "var(--gradient-warm)" }}
                    >
                      <Play className="h-6 w-6 fill-current" />
                    </span>
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 p-5 text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-background/80">
                    {feature.category || "Featured"}
                  </span>
                  <span className="mt-1.5 block text-lg font-semibold text-background sm:text-xl">
                    {feature.title}
                  </span>
                </span>
              </button>
            ) : (
              <div className="grid aspect-[4/3] w-full place-items-center rounded-[28px] border border-dashed border-border bg-card text-sm text-muted-foreground">
                <span className="flex flex-col items-center gap-2">
                  <Camera className="h-7 w-7" /> Publish media from Admin to feature it here
                </span>
              </div>
            )}
          </div>
        </div>

        {strip.length > 0 && (
          <div className="no-scrollbar mt-10 flex gap-3 overflow-x-auto pb-2">
            {strip.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setOpenAt(i)}
                className="h-20 w-28 shrink-0 overflow-hidden rounded-2xl border border-border transition hover:-translate-y-0.5"
              >
                <img
                  src={thumbOf(p)}
                  alt={p.alt_text || displayTitle(p)}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {openAt !== null && (
        <MediaLightbox items={strip.length ? strip : items} index={openAt} onIndex={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </section>
  );
}

/** Horizontal, tappable rows per media category. */
export function CategoryRows() {
  const { items } = useGallery();
  const [lightbox, setLightbox] = useState<{ list: GalleryItem[]; index: number } | null>(null);
  const groups = groupByCategory(items).slice(0, 4);
  if (groups.length === 0) return null;

  return (
    <Section>
      <Reveal>
        <Eyebrow>Browse by theme</Eyebrow>
        <h2 className="mt-5 text-3xl tracking-tight sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          Places, temples, melas & moments
        </h2>
      </Reveal>
      <div className="mt-12 space-y-12">
        {groups.map((g) => (
          <div key={g.category}>
            <div className="flex items-end justify-between gap-4">
              <h3 className="text-lg font-semibold sm:text-xl">{g.category}</h3>
              <Link to="/photos" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>
            <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-2">
              {g.items.slice(0, 10).map((item, i) => (
                <div key={item.id} className="w-[220px] shrink-0 sm:w-[260px]">
                  <MediaCard item={item} onOpen={() => setLightbox({ list: g.items, index: i })} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {lightbox && (
        <MediaLightbox
          items={lightbox.list}
          index={lightbox.index}
          onIndex={(i) => setLightbox({ ...lightbox, index: i })}
          onClose={() => setLightbox(null)}
        />
      )}
    </Section>
  );
}

/** Inline-playable video wall. */
export function VideoWall({ limit = 6 }: { limit?: number }) {
  const { items } = useGallery();
  const videos = useVideos(items);
  const [openAt, setOpenAt] = useState<number | null>(null);
  if (videos.length === 0) return null;

  return (
    <Section className="!py-16 sm:!py-24">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Video</Eyebrow>
            <h2 className="mt-5 text-3xl tracking-tight sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
              Nurpur in motion
            </h2>
          </div>
          <Link to="/videos" className="btn-ghost">
            All videos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.slice(0, limit).map((v, i) => (
          <MediaCard key={v.id} item={v} onOpen={() => setOpenAt(i)} aspect="aspect-video" />
        ))}
      </div>
      {openAt !== null && (
        <MediaLightbox items={videos} index={openAt} onIndex={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </Section>
  );
}

/** Outbound reels/shorts published as social links from the Media CMS. */
export function ReelsRow() {
  const { items } = useGallery();
  const reels = useReels(items);
  if (reels.length === 0) return null;

  return (
    <Section className="!py-16 sm:!py-24">
      <Reveal>
        <Eyebrow>Reels & shorts</Eyebrow>
        <h2 className="mt-5 text-3xl tracking-tight sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          Straight from our socials
        </h2>
      </Reveal>
      <div className="no-scrollbar mt-10 flex gap-4 overflow-x-auto pb-2">
        {reels.map((r) => (
          <a
            key={r.id}
            href={r.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-[190px] shrink-0 overflow-hidden rounded-3xl border border-border bg-card sm:w-[220px]"
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
                <span className="grid h-full w-full place-items-center text-muted-foreground">
                  <Film className="h-7 w-7" />
                </span>
              )}
            </div>
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
              style={{
                background: "linear-gradient(to top, color-mix(in oklab, var(--navy) 82%, transparent), transparent)",
              }}
            />
            <span className="absolute inset-x-0 bottom-0 p-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-semibold text-background">
                <ExternalLink className="h-3 w-3" /> {socialPlatform(r.media_url)}
              </span>
              <span className="mt-2 block line-clamp-2 text-sm font-semibold text-background">{displayTitle(r)}</span>
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}

export function LatestMediaStrip() {
  const { items } = useGallery();
  const [openAt, setOpenAt] = useState<number | null>(null);
  const latest = items.slice(0, 12);
  if (latest.length === 0) return null;
  return (
    <Section className="!py-16 sm:!py-20">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            Latest uploads
          </h2>
          <span className="text-xs text-muted-foreground">
            Updated {formatDate(latest[0].publish_date || latest[0].created_at)}
          </span>
        </div>
      </Reveal>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
        {latest.map((item, i) => (
          <MediaCard key={item.id} item={item} onOpen={() => setOpenAt(i)} aspect="aspect-square" />
        ))}
      </div>
      {openAt !== null && (
        <MediaLightbox items={latest} index={openAt} onIndex={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </Section>
  );
}
