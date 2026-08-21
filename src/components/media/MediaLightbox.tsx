import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useCallback, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize2,
  Minimize2,
  Share2,
  Tag,
  X,
} from "lucide-react";
import type { GalleryItem } from "@/lib/gallery.functions";
import { displayTitle, formatDate, thumbOf } from "./useGallery";


/**
 * Full-screen photo/video viewer with keyboard + swipe-free arrow navigation.
 * No page reload — used by every media surface (home strips, /photos, /videos).
 */
export function MediaLightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: GalleryItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const [zoomed, setZoomed] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  // Reset zoom + scroll position whenever a different item is shown.
  useEffect(() => {
    setZoomed(false);
    stageRef.current?.scrollTo({ top: 0, left: 0 });
  }, [index]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!zoomed || !el || e.pointerType === "touch") return;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!drag.current || !el) return;
    el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    el.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };
  const endDrag = () => {
    drag.current = null;
  };



  const prev = useCallback(
    () => onIndex((index - 1 + items.length) % items.length),
    [index, items.length, onIndex],
  );
  const next = useCallback(() => onIndex((index + 1) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  if (!item) return null;

  const share = async () => {
    const url = `${window.location.origin}/photos/${item.id}`;
    try {
      if (navigator.share) await navigator.share({ title: displayTitle(item) || "NurpurVasi Media", url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* user dismissed */
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col bg-foreground/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={displayTitle(item) || "Media viewer"}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="rounded-full bg-background/15 px-3 py-1 text-xs font-medium text-background">
          {index + 1} / {items.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={share}
            aria-label="Share"
            className="grid h-10 w-10 place-items-center rounded-full bg-background/15 text-background transition hover:bg-background/25"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            aria-label="Close viewer"
            className="grid h-10 w-10 place-items-center rounded-full bg-background/15 text-background transition hover:bg-background/25"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-stretch justify-center">
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-1 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/15 text-background transition hover:bg-background/30 sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-1 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/15 text-background transition hover:bg-background/30 sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {item.media_type !== "video" && (
          <button
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Fit image to screen" : "View image at full size"}
            className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-2 text-xs font-semibold text-background transition hover:bg-background/30 sm:bottom-4 sm:right-4"
          >
            {zoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {zoomed ? "Fit" : "Full size"}
          </button>
        )}

        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`min-h-0 w-full flex-1 overflow-auto overscroll-contain px-2 py-2 sm:px-14 ${
            zoomed ? "cursor-grab touch-pan-x touch-pan-y" : ""
          }`}
        >
          <div className="flex min-h-full w-full items-center justify-center">
            {item.media_type === "video" ? (
              <video
                key={item.id}
                src={item.media_url}
                poster={item.thumbnail || undefined}
                className="max-h-[70vh] w-full max-w-5xl rounded-2xl"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                key={item.id}
                src={item.media_url || thumbOf(item)}
                alt={item.alt_text || displayTitle(item)}
                draggable={false}
                decoding="async"
                className={`rounded-2xl object-contain select-none ${
                  zoomed ? "h-auto w-auto max-w-none" : "h-auto max-h-[68vh] w-auto max-w-full sm:max-h-[76vh]"
                }`}
              />
            )}
          </div>
        </div>
      </div>


      <div className="shrink-0 px-4 pb-5 pt-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-background/70">
            {item.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-background/15 px-2.5 py-1">
                <Tag className="h-3 w-3" />
                {item.category}
              </span>
            )}
            {formatDate(item.publish_date || item.created_at) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-background/15 px-2.5 py-1">
                <MapPin className="h-3 w-3" />
                {formatDate(item.publish_date || item.created_at)}
              </span>
            )}
          </div>
          {(
            <h2
              className="mt-3 text-xl text-background sm:text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {displayTitle(item)}
            </h2>
          )}
          {item.description && (
            <p className="mt-1.5 line-clamp-3 text-sm text-background/70">{item.description}</p>
          )}
          <Link
            to="/photos/$id"
            params={{ id: item.slug || item.id }}
            className="mt-3 inline-flex text-xs font-semibold text-background underline decoration-background/40 underline-offset-4"
          >
            Open full details page
          </Link>
        </div>

        {items.length > 1 && (
          <div className="no-scrollbar mx-auto mt-4 flex max-w-4xl gap-2 overflow-x-auto pb-1">
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => onIndex(i)}
                aria-label={displayTitle(it) || `Item ${i + 1}`}
                className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === index ? "border-background" : "border-transparent opacity-60"
                }`}
              >
                {thumbOf(it) ? (
                  <img src={thumbOf(it)} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="block h-full w-full bg-background/20" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
