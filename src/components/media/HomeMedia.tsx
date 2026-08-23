import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Camera,
  ExternalLink,
  Film,
  Image as ImageIcon,
  MapPin,
  Play,
  Sparkles,
  Store,
} from "lucide-react";
import type { GalleryItem } from "@/lib/gallery.functions";
import { listPublicClients } from "@/lib/clients.functions";
import { listPublicPlaces } from "@/lib/portal.functions";
import { Section, Eyebrow } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { MediaCard, MediaTrigger } from "./MediaGrid";
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

/** Editorial section heading: colour accent line + small label + display title. */
export function SectionHeading({
  label,
  title,
  action,
  tone = "light",
}: {
  label: string;
  title: string;
  action?: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Reveal>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <span className="flex items-center gap-3">
            <span
              className="h-[3px] w-10 shrink-0 rounded-full"
              style={{ background: "var(--gradient-vivid)" }}
            />
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${
                dark ? "text-background/70" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </span>
          <h2
            className={`mt-3 text-balance text-3xl tracking-tight sm:text-5xl ${
              dark ? "text-background" : ""
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
        </div>
        {action}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Animated ticker                                                  */
/* ------------------------------------------------------------------ */

export function MediaTicker() {
  const { items } = useGallery();
  const loadTicker = useServerFn(listPublicTicker);
  const { data: tickerData } = useQuery({
    queryKey: ["public-ticker"],
    queryFn: () => loadTicker(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const cats = useMemo(
    () => Array.from(new Set(items.map((i) => (i.category || "").trim()).filter(Boolean))).slice(0, 8),
    [items],
  );

  const headlines = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (tickerData?.items ?? [])
      .filter(
        (t) =>
          t.active &&
          (!t.start_date || t.start_date <= today) &&
          (!t.end_date || t.end_date >= today),
      )
      .map((t) => ({ text: t.text.trim(), link: t.link?.trim() || "" }))
      .filter((t) => t.text.length > 0);
  }, [tickerData]);

  const labels =
    headlines.length > 0
      ? headlines
      : ["Nurpur", "Photos", "Videos", "Local Stories", "Events", "Weather", "Business", ...cats].map(
          (text) => ({ text, link: "" }),
        );
  const row = [...labels, ...labels];


  return (
    <div
      className="relative overflow-hidden border-y border-border/60"
      style={{ background: "var(--gradient-vivid)" }}
    >
      <div
        className="animate-marquee marquee-pausable flex w-max items-center gap-8 py-2.5"
        style={{ ["--marquee-duration" as string]: "38s" }}
      >
        {row.map((label, i) => (
          <span
            key={`${label.text}-${i}`}
            className="flex shrink-0 items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-background"
          >
            {label.link ? (
              <a href={label.link} className="hover:underline">
                {label.text}
              </a>
            ) : (
              label.text
            )}
            <span className="h-1.5 w-1.5 rounded-full bg-background/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Editorial hero                                                   */
/* ------------------------------------------------------------------ */

export function MediaSpotlight() {
  const { items, isLoading } = useGallery();
  const [openAt, setOpenAt] = useState<number | null>(null);

  const ordered = useMemo(() => {
    // Strictly honour the persisted Featured flag; when nothing is featured fall
    // back to the newest item so the hero is never empty.
    const featured = items.filter((i) => i.featured);
    const feature = featured[0] ?? items[0];
    if (!feature) return [];
    return [feature, ...items.filter((i) => i.id !== feature.id)];
  }, [items]);

  const feature = ordered[0];
  const side = ordered.slice(1, 4);

  return (
    <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 520px at 12% 0%, color-mix(in oklab, var(--royal) 20%, transparent), transparent 62%), radial-gradient(760px 460px at 92% 10%, color-mix(in oklab, var(--sun) 22%, transparent), transparent 60%), radial-gradient(700px 420px at 60% 90%, color-mix(in oklab, var(--purple) 16%, transparent), transparent 62%), linear-gradient(180deg, #ffffff, #f5f6fb)",
        }}
      />
      <div className="container-x">
        <div className="max-w-2xl">
          <Eyebrow>Nurpur · Himachal Pradesh</Eyebrow>
          <h1
            className="animate-fade-up mt-5 text-balance text-4xl leading-[1.03] tracking-tight sm:text-6xl md:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your window to <span className="text-gradient italic">Nurpur</span>
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: "0.1s" }}
          >
            Photos, videos, local events, culture, weather and neighbourhood businesses — captured and
            published by NurpurVasi Media.
          </p>
          <div className="animate-fade-up mt-7 flex flex-wrap gap-3" style={{ animationDelay: "0.18s" }}>
            <Link to="/photos" className="btn-primary group !px-7 !py-3.5">
              <ImageIcon className="h-4 w-4" /> Explore photos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/videos" className="btn-ghost !px-7 !py-3.5">
              <Film className="h-4 w-4" /> Watch videos
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-[1.9fr_1fr] lg:gap-6">
          {feature ? (
            <MediaTrigger
              item={feature}
              onOpen={() => setOpenAt(0)}
              className="group relative block w-full overflow-hidden rounded-[30px] border border-border text-left shadow-[0_50px_100px_-60px_color-mix(in_oklab,var(--navy)_70%,transparent)]"
            >
              <div className="aspect-[3/4] w-full bg-muted sm:aspect-[16/10] lg:aspect-[4/3]">
                {thumbOf(feature) ? (
                  <img
                    src={thumbOf(feature)}
                    alt={feature.alt_text || displayTitle(feature)}
                    className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-muted-foreground">
                    <Camera className="h-8 w-8" />
                  </span>
                )}
              </div>
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in oklab, var(--navy) 90%, transparent), transparent)",
                }}
              />
              <span
                className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-background shadow-lg backdrop-blur sm:left-7 sm:top-7"
                style={{ background: "var(--gradient-warm)" }}
              >
                <Sparkles className="h-3 w-3" /> {feature.featured ? "Featured" : "Latest"}
              </span>

              {feature.media_type === "video" && (
                <span className="absolute inset-0 grid place-items-center" aria-hidden>
                  <span
                    className="grid h-16 w-16 place-items-center rounded-full text-background shadow-xl transition group-hover:scale-110"
                    style={{ background: "var(--gradient-warm)" }}
                  >
                    <Play className="h-6 w-6 fill-current" />
                  </span>
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                {feature.category && (
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-background"
                    style={{ background: "var(--gradient-vivid)" }}
                  >
                    {feature.category}
                  </span>
                )}
                <span
                  className="mt-3 block text-balance text-2xl font-semibold leading-tight text-background sm:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {displayTitle(feature)}
                </span>
                {feature.description && (
                  <span className="mt-2 line-clamp-2 block max-w-xl text-sm text-background/80">
                    {feature.description}
                  </span>
                )}
                <span className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-background/75">
                  {formatDate(feature.publish_date || feature.created_at) && (
                    <span>{formatDate(feature.publish_date || feature.created_at)}</span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background/20 px-3 py-1.5 text-xs font-semibold text-background">
                    {feature.media_type === "video" ? "Watch" : "Explore story"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </span>
            </MediaTrigger>
          ) : (
            <div className="grid aspect-[16/10] w-full place-items-center rounded-[30px] border border-dashed border-border bg-card text-sm text-muted-foreground">
              <span className="flex flex-col items-center gap-2 text-center">
                <Camera className="h-7 w-7" />
                {isLoading ? "Loading media…" : "Publish media from Admin to feature it here"}
              </span>
            </div>
          )}

          {side.length > 0 && (
            <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-rows-3 lg:gap-4 lg:overflow-visible lg:pb-0">
              {side.map((item, i) => (
                <MediaTrigger
                  key={item.id}
                  item={item}
                  onOpen={() => setOpenAt(i + 1)}
                  className="group relative flex w-[260px] shrink-0 snap-start gap-3 overflow-hidden rounded-3xl border border-border bg-card/80 p-2 text-left backdrop-blur transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_color-mix(in_oklab,var(--royal)_55%,transparent)] lg:w-auto"
                >
                  <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted lg:h-full lg:w-28">
                    {thumbOf(item) ? (
                      <img
                        src={thumbOf(item)}
                        alt={item.alt_text || displayTitle(item)}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-muted-foreground">
                        <Camera className="h-5 w-5" />
                      </span>
                    )}
                    {item.media_type === "video" && (
                      <span className="absolute inset-0 grid place-items-center">
                        <Play className="h-5 w-5 fill-current text-background drop-shadow" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 py-1 pr-2">
                    {item.category && (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                    <span className="mt-1 block line-clamp-2 text-sm font-semibold leading-snug">
                      {displayTitle(item)}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {formatDate(item.publish_date || item.created_at)}
                    </span>
                  </span>
                </MediaTrigger>
              ))}
            </div>
          )}
        </div>
      </div>

      {openAt !== null && (
        <MediaLightbox items={ordered} index={openAt} onIndex={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Auto-scrolling photo strips                                      */
/* ------------------------------------------------------------------ */

function StripRow({
  items,
  reverse,
  duration,
  onOpen,
}: {
  items: GalleryItem[];
  reverse?: boolean;
  duration: string;
  onOpen: (item: GalleryItem) => void;
}) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div
        className={`${reverse ? "animate-marquee-rev" : "animate-marquee"} marquee-pausable flex w-max gap-4`}
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {row.map((item, i) => (
          <button
            key={`${item.id}-${i}`}
            onClick={() => onOpen(item)}
            className="group relative h-44 w-64 shrink-0 overflow-hidden rounded-3xl border border-border bg-muted transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_color-mix(in_oklab,var(--royal)_55%,transparent)] sm:h-56 sm:w-80"
          >
            {thumbOf(item) ? (
              <img
                src={thumbOf(item)}
                alt={item.alt_text || displayTitle(item)}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
            ) : (
              <span className="grid h-full w-full place-items-center text-muted-foreground">
                <Camera className="h-6 w-6" />
              </span>
            )}
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-80"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in oklab, var(--navy) 82%, transparent), transparent)",
              }}
            />
            <span className="absolute inset-x-0 bottom-0 p-3 text-left">
              <span className="block truncate text-xs font-semibold text-background">
                {displayTitle(item)}
              </span>
              {item.category && (
                <span className="text-[10px] text-background/75">{item.category}</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PhotoStrips() {
  const { items } = useGallery();
  const photos = usePhotos(items);
  const [openAt, setOpenAt] = useState<number | null>(null);
  if (photos.length < 3) return null;

  const size = Math.ceil(photos.length / 3);
  const rows = [photos.slice(0, size), photos.slice(size, size * 2), photos.slice(size * 2)].filter(
    (r) => r.length > 0,
  );
  const open = (item: GalleryItem) => setOpenAt(photos.findIndex((p) => p.id === item.id));

  return (
    <section className="py-14 sm:py-20">
      <div className="container-x">
        <SectionHeading label="Latest from Nurpur" title="A moving wall of Nurpur" />
      </div>
      <div className="mt-8 space-y-4">
        {rows.map((row, i) => (
          <StripRow
            key={i}
            items={row}
            reverse={i % 2 === 1}
            duration={`${52 + i * 9}s`}
            onOpen={open}
          />
        ))}
      </div>
      {openAt !== null && openAt >= 0 && (
        <MediaLightbox items={photos} index={openAt} onIndex={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Explore Nurpur — dynamic categories                              */
/* ------------------------------------------------------------------ */

const CARD_GRADIENTS = [
  "linear-gradient(140deg, color-mix(in oklab, var(--royal) 85%, transparent), color-mix(in oklab, var(--purple) 70%, transparent))",
  "linear-gradient(140deg, color-mix(in oklab, var(--sun) 85%, transparent), color-mix(in oklab, var(--purple) 60%, transparent))",
  "linear-gradient(140deg, color-mix(in oklab, var(--navy) 88%, transparent), color-mix(in oklab, var(--cyan) 65%, transparent))",
  "linear-gradient(140deg, color-mix(in oklab, var(--leaf) 80%, transparent), color-mix(in oklab, var(--royal) 65%, transparent))",
];

export function ExploreNurpur() {
  const { items } = useGallery();
  const [lightbox, setLightbox] = useState<{ list: GalleryItem[]; index: number } | null>(null);
  const groups = groupByCategory(items).filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;

  return (
    <Section className="!py-16 sm:!py-24">
      <SectionHeading label="Explore Nurpur" title="Fort, temples, melas & everyday life" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => {
          const cover = g.items.find((x) => thumbOf(x)) ?? g.items[0];
          return (
            <Reveal key={g.category} delay={i * 60}>
              <button
                onClick={() => setLightbox({ list: g.items, index: 0 })}
                className="group relative block h-56 w-full overflow-hidden rounded-[26px] border border-border text-left transition hover:-translate-y-1 sm:h-64"
              >
                <span className="absolute inset-0 bg-muted">
                  {thumbOf(cover) && (
                    <img
                      src={thumbOf(cover)}
                      alt={cover.alt_text || displayTitle(cover)}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-110"
                    />
                  )}
                </span>
                <span
                  className="pointer-events-none absolute inset-0 opacity-75 transition group-hover:opacity-85"
                  style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                />
                <span className="absolute inset-0 flex flex-col justify-end p-6">
                  <Sparkles className="mb-auto h-5 w-5 text-background/80" />
                  <span
                    className="text-2xl font-semibold text-background"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {g.category}
                  </span>
                  <span className="mt-1 text-xs font-medium text-background/85">
                    {g.items.length} {g.items.length === 1 ? "item" : "items"}
                  </span>
                </span>
              </button>
            </Reveal>
          );
        })}
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

/* ------------------------------------------------------------------ */
/* 6. Latest photos — masonry                                          */
/* ------------------------------------------------------------------ */

export function LatestPhotosMasonry({ limit = 12 }: { limit?: number }) {
  const { items } = useGallery();
  const photos = usePhotos(items).slice(0, limit);
  const [openAt, setOpenAt] = useState<number | null>(null);
  if (photos.length === 0) return null;

  return (
    <Section className="!py-16 sm:!py-24">
      <SectionHeading
        label="Captured Moments"
        title="Freshly published photos"
        action={
          <Link to="/photos" className="btn-ghost !px-5 !py-2.5">
            All photos <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {photos.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setOpenAt(i)}
            className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-3xl border border-border bg-card text-left transition hover:-translate-y-1 sm:mb-4"
          >
            <span className="relative block min-h-32 bg-muted">
              {thumbOf(item) ? (
              <img
                src={thumbOf(item)}
                alt={item.alt_text || displayTitle(item)}
                loading="lazy"
                className="w-full object-cover transition duration-700 group-hover:scale-[1.05]"
              />
              ) : (
                <span
                  className="grid h-40 w-full place-items-center text-background/80"
                  style={{ background: "var(--gradient-vivid)" }}
                >
                  <Camera className="h-7 w-7" />
                </span>
              )}
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 opacity-80"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in oklab, var(--navy) 84%, transparent), transparent)",
                }}
              />
              <span className="absolute inset-x-0 bottom-0 p-4">
                {item.category && (
                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background"
                    style={{ background: "var(--gradient-vivid)" }}
                  >
                    {item.category}
                  </span>
                )}
                <span className="mt-2 block line-clamp-2 text-sm font-semibold text-background">
                  {displayTitle(item)}
                </span>
                {item.description && (
                  <span className="mt-1 line-clamp-2 block text-[11px] text-background/75">
                    {item.description}
                  </span>
                )}
                <span className="mt-1 block text-[11px] text-background/70">
                  {formatDate(item.publish_date || item.created_at)}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
      {openAt !== null && (
        <MediaLightbox items={photos} index={openAt} onIndex={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Video wall                                                       */
/* ------------------------------------------------------------------ */

export function VideoWallPremium({ limit = 7 }: { limit?: number }) {
  const { items } = useGallery();
  const videos = useVideos(items);
  const [openAt, setOpenAt] = useState<number | null>(null);
  if (videos.length === 0) return null;

  const [hero, ...rest] = videos.slice(0, limit);

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(700px 420px at 20% 10%, color-mix(in oklab, var(--purple) 22%, transparent), transparent 62%), linear-gradient(180deg, color-mix(in oklab, var(--navy) 96%, transparent), color-mix(in oklab, var(--navy) 88%, transparent))",
        }}
      />
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="flex items-center gap-3">
                <span
                  className="h-[3px] w-10 shrink-0 rounded-full"
                  style={{ background: "var(--gradient-warm)" }}
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-background/70">
                  Video
                </span>
              </span>
              <h2
                className="mt-3 text-balance text-3xl tracking-tight text-background sm:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Watch Nurpur
              </h2>
            </div>
            <Link
              to="/videos"
              className="inline-flex items-center gap-2 rounded-full border border-background/25 px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-background/10"
            >
              All videos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <button
            onClick={() => setOpenAt(0)}
            className="group relative block overflow-hidden rounded-[28px] border border-background/15 text-left"
          >
            <span className="block aspect-video bg-background/10">
              {thumbOf(hero) ? (
                <img
                  src={thumbOf(hero)}
                  alt={hero.alt_text || displayTitle(hero)}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-105"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-background/70">
                  <Film className="h-8 w-8" />
                </span>
              )}
            </span>
            <span className="absolute inset-0 grid place-items-center" aria-hidden>
              <span
                className="grid h-16 w-16 place-items-center rounded-full text-background shadow-xl transition group-hover:scale-110"
                style={{ background: "var(--gradient-warm)" }}
              >
                <Play className="h-6 w-6 fill-current" />
              </span>
            </span>
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in oklab, var(--navy) 92%, transparent), transparent)",
              }}
            />
            <span className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <span className="block text-lg font-semibold text-background sm:text-2xl">
                {displayTitle(hero)}
              </span>
              <span className="mt-1 block text-[11px] text-background/75">
                {formatDate(hero.publish_date || hero.created_at)}
              </span>
            </span>
          </button>

          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
            {rest.map((v, i) => (
              <div key={v.id} className="w-[240px] shrink-0 lg:w-auto">
                <MediaCard item={v} onOpen={() => setOpenAt(i + 1)} aspect="aspect-video" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {openAt !== null && (
        <MediaLightbox
          items={videos.slice(0, limit)}
          index={openAt}
          onIndex={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Latest reels                                                     */
/* ------------------------------------------------------------------ */

export function LatestReels() {
  const { items } = useGallery();
  const reels = useReels(items);
  if (reels.length === 0) return null;

  return (
    <Section className="!py-16 sm:!py-24">
      <SectionHeading label="Latest Reels" title="Straight from our socials" />
      <div className="no-scrollbar mt-10 flex gap-4 overflow-x-auto pb-2">
        {reels.map((r) => (
          <a
            key={r.id}
            href={r.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-[190px] shrink-0 overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 sm:w-[220px]"
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
                background:
                  "linear-gradient(to top, color-mix(in oklab, var(--navy) 84%, transparent), transparent)",
              }}
            />
            <span className="absolute inset-x-0 bottom-0 p-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-semibold text-background">
                <ExternalLink className="h-3 w-3" /> {socialPlatform(r.media_url)}
              </span>
              <span className="mt-2 block line-clamp-2 text-sm font-semibold text-background">
                {displayTitle(r)}
              </span>
              <span className="mt-1 flex items-center justify-between text-[11px] text-background/75">
                {formatDate(r.publish_date || r.created_at)}
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Play className="h-3 w-3 fill-current" /> View
                </span>
              </span>
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 9b. Featured places                                                 */
/* ------------------------------------------------------------------ */

export function FeaturedPlaces({ limit = 3 }: { limit?: number }) {
  const load = useServerFn(listPublicPlaces);
  const { data } = useQuery({
    queryKey: ["places-public", "home-featured"],
    queryFn: () => load(),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const places = (data?.items ?? []).filter((p) => p.featured === true).slice(0, limit);
  if (places.length === 0) return null;

  return (
    <Section className="!py-16 sm:!py-24">
      <SectionHeading
        label="Featured places"
        title="Must-see spots in Nurpur"
        action={
          <Link to="/places" className="btn-ghost !px-5 !py-2.5">
            All places <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <Link
              to="/places/$slug"
              params={{ slug: p.slug }}
              className="group block h-full overflow-hidden rounded-[26px] border border-border bg-card transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_color-mix(in_oklab,var(--royal)_45%,transparent)]"
            >
              <span className="relative block aspect-[16/11] w-full overflow-hidden bg-muted">
                {p.cover_image ? (
                  <img
                    src={p.cover_image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                  />
                ) : (
                  <span
                    className="grid h-full w-full place-items-center text-background/80"
                    style={{ background: "var(--gradient-vivid)" }}
                  >
                    <MapPin className="h-7 w-7" />
                  </span>
                )}
                <span
                  className="absolute left-4 top-4 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-background"
                  style={{ background: "var(--gradient-vivid)" }}
                >
                  Featured
                </span>
              </span>
              <span className="block p-5">
                {p.category && (
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {p.category}
                  </span>
                )}
                <span className="mt-1 block text-lg font-semibold tracking-tight">{p.name}</span>
                {p.description && (
                  <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </span>
                )}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Local businesses                                                */
/* ------------------------------------------------------------------ */

export function LocalBusinessRow({ limit = 6 }: { limit?: number }) {
  const load = useServerFn(listPublicClients);
  const { data } = useQuery({
    queryKey: ["clients-public", "home"],
    queryFn: () => load(),
    staleTime: 60_000,
  });
  const businesses = (data?.items ?? []).slice(0, limit);

  return (
    <Section className="!py-16 sm:!py-24">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Local business</Eyebrow>
            <h2
              className="mt-4 text-2xl tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Shops & services of Nurpur
            </h2>
          </div>
          <Link to="/business" className="btn-ghost">
            <Store className="h-4 w-4" /> Business directory
          </Link>
        </div>
      </Reveal>

      {businesses.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b, i) => (
            <Reveal key={b.id} delay={i * 50}>
              <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_color-mix(in_oklab,var(--royal)_45%,transparent)]">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-surface">
                    {b.logo ? (
                      <img
                        src={b.logo}
                        alt={`${b.company_name} logo`}
                        loading="lazy"
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <Store className="h-5 w-5 text-muted-foreground" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{b.company_name}</p>
                    {b.category && (
                      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {b.category}
                      </p>
                    )}
                  </div>
                </div>
                {b.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {b.description}
                  </p>
                )}
                <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" style={{ color: "var(--royal)" }} /> Nurpur, Himachal
                  Pradesh
                </p>
                <div className="mt-5">
                  {b.website ? (
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost !py-2 !px-4 !text-[13px]"
                    >
                      View business <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <Link to="/business" className="btn-ghost !py-2 !px-4 !text-[13px]">
                      View business <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h3 className="text-xl tracking-tight sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Promote your shop to all of Nurpur
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            We photograph, film and publish local businesses across our website and social pages.
          </p>
          <Link to="/contact" className="btn-primary mt-6">
            Get featured <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 11. Final CTA                                                       */
/* ------------------------------------------------------------------ */

export function DiscoverCTA() {
  return (
    <Section className="!pb-20 !pt-4 sm:!pb-28">
      <Reveal variant="scale">
        <div
          className="relative overflow-hidden rounded-[32px] p-8 text-center sm:p-16"
          style={{ background: "var(--gradient-vivid)" }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
            style={{ background: "color-mix(in oklab, var(--sun) 70%, transparent)" }}
          />
          <h2
            className="relative text-balance text-3xl leading-tight text-background sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Discover Nurpur. One photo at a time.
          </h2>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/photos"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
            >
              <ImageIcon className="h-4 w-4" /> Explore Photos
            </Link>
            <Link
              to="/videos"
              className="inline-flex items-center gap-2 rounded-full border border-background/40 px-6 py-3 text-sm font-semibold text-background transition hover:bg-background/10"
            >
              <Film className="h-4 w-4" /> Watch Videos
            </Link>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
