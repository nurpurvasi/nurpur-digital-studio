import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Image as ImageIcon, Play, X } from "lucide-react";
import { Eyebrow, Section } from "./Layout";
import { Reveal } from "./Reveal";
import { AddPlaceholder } from "./AddPlaceholder";
import { listFeaturedGallery, listPublicGallery, type GalleryItem } from "@/lib/gallery.functions";

export type GalleryVariant = "featured" | "all";

export function Gallery({
  variant = "all",
  eyebrow = "Gallery",
  title = "Selected work",
  intro,
  columns = 3,
  showEmpty = true,
}: {
  variant?: GalleryVariant;
  eyebrow?: string;
  title?: string;
  intro?: string;
  columns?: 2 | 3 | 4;
  showEmpty?: boolean;
}) {
  const loadFeatured = useServerFn(listFeaturedGallery);
  const loadAll = useServerFn(listPublicGallery);
  const { data } = useQuery({
    queryKey: ["gallery-public", variant],
    queryFn: () => (variant === "featured" ? loadFeatured() : loadAll()),
    staleTime: 60_000,
  });

  const items = data?.items ?? [];
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const gridCols =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
      ? "sm:grid-cols-2"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2
          className="mt-5 text-4xl font-normal tracking-tight sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        {intro ? (
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">{intro}</p>
        ) : null}
      </div>

      <div className={`mt-14 grid gap-6 ${gridCols}`}>
        {items.length === 0
          ? showEmpty
            ? Array.from({ length: columns }).map((_, i) => (
                <Reveal key={i} delay={i * 100}>
                  <AddPlaceholder label="Add Gallery Item" minHeight="280px" />
                </Reveal>
              ))
            : null
          : items.map((item, i) => (
              <Reveal key={item.id} delay={i * 80}>
                <GalleryCard item={item} onOpen={() => setLightbox(item)} />
              </Reveal>
            ))}
      </div>

      {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </Section>
  );
}

function GalleryCard({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  const thumb = item.thumbnail || (item.media_type === "image" ? item.media_url : "");
  return (
    <button
      onClick={onOpen}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-white text-left transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_40px_80px_-30px_color-mix(in_oklab,var(--navy)_30%,transparent)]"
      style={{
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.7) inset, 0 20px 40px -30px color-mix(in oklab, var(--navy) 25%, transparent)",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {thumb ? (
          <img
            src={thumb}
            alt={item.alt_text || item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : item.media_type === "video" && item.media_url ? (
          <video src={item.media_url} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        {item.media_type === "video" && (
          <span
            className="absolute inset-0 grid place-items-center"
            aria-hidden
          >
            <span
              className="grid h-14 w-14 place-items-center rounded-full text-white shadow-lg transition group-hover:scale-110"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Play className="h-5 w-5 fill-current" />
            </span>
          </span>
        )}
      </div>
      {(item.title || item.category) && (
        <div className="flex items-center justify-between gap-3 p-5">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{item.title || "Untitled"}</div>
            {item.category && (
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.category}
              </div>
            )}
          </div>
        </div>
      )}
    </button>
  );
}

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {item.media_type === "video" ? (
          <video
            src={item.media_url}
            poster={item.thumbnail || undefined}
            className="max-h-[80vh] w-full"
            controls
            autoPlay
            playsInline
          />
        ) : (
          <img
            src={item.media_url}
            alt={item.alt_text || item.title}
            className="max-h-[80vh] w-full object-contain"
          />
        )}
        {(item.title || item.description) && (
          <div className="bg-black/60 p-5 text-white">
            {item.title && <div className="text-lg font-semibold">{item.title}</div>}
            {item.description && (
              <p className="mt-1 text-sm text-white/80">{item.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
