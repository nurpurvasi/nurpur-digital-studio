import { useMemo } from "react";
import { ArrowRight, Play } from "lucide-react";
import { useSiteContent } from "@/content/SiteContentContext";

/** True when the hero media should be rendered as a <video>. */
function isVideo(src: string, type?: string) {
  if (type === "video") return true;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(src);
}

/**
 * Premium 16:9 "Featured Story" hero.
 * Fully driven by the existing Homepage Hero CMS section (siteContent.hero):
 * badge, headline, subheading, media (image or video), and two configurable CTAs.
 * Single featured item — deliberately no carousel.
 */
export function FeaturedStoryHero() {
  const content = useSiteContent();
  const hero = content.hero;
  const src = (hero.media?.src || "").trim();
  const video = src ? isVideo(src, hero.media?.type) : false;
  const badge = (hero.badge || "").trim();
  const primary = hero.primaryCta;
  const secondary = hero.secondaryCta;

  return (
    <section className="relative overflow-hidden pb-8 pt-6 sm:pb-12 sm:pt-9">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 480px at 10% 0%, color-mix(in oklab, var(--royal) 16%, transparent), transparent 62%), radial-gradient(720px 420px at 92% 8%, color-mix(in oklab, var(--purple) 14%, transparent), transparent 60%), linear-gradient(180deg, #ffffff, #f6f7fb)",
        }}
      />
      <div className="container-x">
        <div className="animate-fade-up relative overflow-hidden rounded-[22px] border border-border/70 bg-muted shadow-[0_50px_100px_-60px_color-mix(in_oklab,var(--navy)_70%,transparent)] sm:rounded-[30px]">
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/9]">
            {src ? (
              video ? (
                <video
                  src={src}
                  poster={hero.media?.poster || undefined}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={src}
                  alt={hero.media?.alt || hero.headline || "Featured story"}
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              )
            ) : (
              <div
                className="h-full w-full"
                style={{ background: "var(--gradient-vivid)" }}
                aria-hidden="true"
              />
            )}

            {/* Readability gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in oklab, var(--navy) 88%, transparent) 0%, color-mix(in oklab, var(--navy) 55%, transparent) 38%, transparent 72%)",
              }}
            />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-12">
              <div className="max-w-3xl">
                {badge && (
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-background sm:text-[11px]"
                    style={{ background: "var(--gradient-vivid)" }}
                  >
                    {badge}
                  </span>
                )}
                {hero.headline && (
                  <h1
                    className="mt-3 text-balance text-2xl leading-[1.12] tracking-tight text-background sm:mt-4 sm:text-4xl lg:text-5xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {hero.headline}
                  </h1>
                )}
                {hero.subheading && (
                  <p className="mt-2.5 line-clamp-3 max-w-2xl text-sm leading-relaxed text-background/80 sm:mt-4 sm:text-base">
                    {hero.subheading}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
                  {primary?.label && primary?.href && (
                    <a
                      href={primary.href}
                      className="btn-primary group !px-5 !py-2.5 sm:!px-7 sm:!py-3.5"
                    >
                      {video ? <Play className="h-4 w-4" /> : null}
                      {primary.label}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                  {secondary?.label && secondary?.href && (
                    <a
                      href={secondary.href}
                      className="inline-flex items-center gap-2 rounded-full border border-background/40 bg-background/10 px-5 py-2.5 text-sm font-semibold text-background backdrop-blur transition hover:bg-background/20 sm:px-7 sm:py-3.5"
                    >
                      {secondary.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Second, independently editable marquee directly below the hero.
 * Content lives in siteContent.bottomTicker — completely separate from the
 * Breaking Ticker (ticker_items table), which stays untouched.
 */
export function BottomTicker() {
  const { bottomTicker } = useSiteContent();

  const items = useMemo(
    () =>
      (bottomTicker?.items ?? [])
        .map((i) => ({ text: (i.text || "").trim(), link: (i.link || "").trim() }))
        .filter((i) => i.text.length > 0),
    [bottomTicker],
  );

  if (bottomTicker?.enabled === false || items.length === 0) return null;
  const row = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-[color-mix(in_oklab,var(--navy)_94%,transparent)]">
      <div
        className="animate-marquee marquee-pausable flex w-max items-center gap-8 py-2.5"
        style={{ ["--marquee-duration" as string]: "44s" }}
      >
        {row.map((item, i) => (
          <span
            key={`${item.text}-${i}`}
            className="flex shrink-0 items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.26em] text-background"
          >
            {item.link ? (
              <a href={item.link} className="hover:underline">
                {item.text}
              </a>
            ) : (
              item.text
            )}
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--gradient-vivid)" }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
