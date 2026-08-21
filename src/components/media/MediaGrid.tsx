import { useMemo, useState } from "react";
import { Camera, Play } from "lucide-react";
import type { GalleryItem } from "@/lib/gallery.functions";
import { MediaLightbox } from "./MediaLightbox";
import { formatDate, thumbOf } from "./useGallery";

export function MediaCard({
  item,
  onOpen,
  aspect = "aspect-[4/3]",
}: {
  item: GalleryItem;
  onOpen: () => void;
  aspect?: string;
}) {
  const thumb = thumbOf(item);
  return (
    <button
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-3xl border border-border bg-card text-left shadow-[0_18px_40px_-32px_color-mix(in_oklab,var(--navy)_45%,transparent)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--royal)_45%,transparent)]"
    >
      <div className={`relative ${aspect} overflow-hidden bg-muted`}>
        {thumb ? (
          <img
            src={thumb}
            alt={item.alt_text || item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted-foreground">
            <Camera className="h-8 w-8" />
          </span>
        )}
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 opacity-70"
          style={{
            background:
              "linear-gradient(to top, color-mix(in oklab, var(--navy) 78%, transparent), transparent)",
          }}
        />
        {item.media_type === "video" && (
          <span className="absolute inset-0 grid place-items-center" aria-hidden>
            <span
              className="grid h-14 w-14 place-items-center rounded-full text-background shadow-lg transition group-hover:scale-110"
              style={{ background: "var(--gradient-warm)" }}
            >
              <Play className="h-5 w-5 fill-current" />
            </span>
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 p-4">
          {item.category && (
            <span
              className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background"
              style={{ background: "var(--gradient-vivid)" }}
            >
              {item.category}
            </span>
          )}
          <span className="mt-2 block truncate text-sm font-semibold text-background">
            {item.title || "Untitled"}
          </span>
          {formatDate(item.publish_date || item.created_at) && (
            <span className="mt-0.5 block text-[11px] text-background/75">
              {formatDate(item.publish_date || item.created_at)}
            </span>
          )}
        </span>
      </div>
    </button>
  );
}

/** Category-filtered, lightbox-enabled grid used by /photos and /videos. */
export function MediaGrid({
  items,
  emptyLabel = "No media published yet.",
}: {
  items: GalleryItem[];
  emptyLabel?: string;
}) {
  const [active, setActive] = useState<string>("All");
  const [openAt, setOpenAt] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => (i.category || "").trim()).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(
    () => (active === "All" ? items : items.filter((i) => (i.category || "").trim() === active)),
    [items, active],
  );

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface/60 p-12 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div>
      {categories.length > 2 && (
        <div className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                active === c
                  ? "border-transparent text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
              style={active === c ? { background: "var(--gradient-brand)" } : undefined}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item, i) => (
          <MediaCard key={item.id} item={item} onOpen={() => setOpenAt(i)} />
        ))}
      </div>

      {openAt !== null && (
        <MediaLightbox
          items={filtered}
          index={openAt}
          onIndex={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </div>
  );
}
