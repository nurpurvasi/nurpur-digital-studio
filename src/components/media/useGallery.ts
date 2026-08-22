import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicGallery, type GalleryItem } from "@/lib/gallery.functions";
import { normalizeMediaUrl } from "@/lib/media-url";

/** Single shared read of the published gallery — every media section reuses it. */
export function useGallery() {
  const load = useServerFn(listPublicGallery);
  const { data, isLoading } = useQuery({
    queryKey: ["gallery-public", "all"],
    queryFn: () => load(),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const items = data?.items ?? [];
  return { items, isLoading };
}

export function isSocialUrl(url: string) {
  return /instagram\.com|facebook\.com|fb\.watch|youtube\.com|youtu\.be/i.test(url || "");
}

export function socialPlatform(url: string): "Instagram" | "Facebook" | "YouTube" | "Link" {
  if (/instagram\.com/i.test(url)) return "Instagram";
  if (/facebook\.com|fb\.watch/i.test(url)) return "Facebook";
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  return "Link";
}

export function youtubeThumb(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : "";
}

/**
 * Thumbnail priority: uploaded/custom thumbnail → the image itself →
 * platform thumbnail (YouTube) → "" so callers render a clean fallback visual.
 */
export function thumbOf(item: GalleryItem) {
  if (item.thumbnail) return normalizeMediaUrl(item.thumbnail);
  if (item.media_type === "image" && item.media_url) return normalizeMediaUrl(item.media_url);
  if (isSocialUrl(item.media_url)) return youtubeThumb(item.media_url);
  return "";
}

/** Photos = images that are not outbound social links. */
export function usePhotos(items: GalleryItem[]) {
  return useMemo(
    () => items.filter((i) => i.media_type === "image" && !isSocialUrl(i.media_url)),
    [items],
  );
}

/** Videos hosted in the Media Library (playable inline). */
export function useVideos(items: GalleryItem[]) {
  return useMemo(
    () => items.filter((i) => i.media_type === "video" && !isSocialUrl(i.media_url)),
    [items],
  );
}

/** Reels = any item whose media URL points at Instagram / Facebook / YouTube. */
export function useReels(items: GalleryItem[]) {
  return useMemo(() => items.filter((i) => isSocialUrl(i.media_url)), [items]);
}

export function groupByCategory(items: GalleryItem[]) {
  const map = new Map<string, GalleryItem[]>();
  for (const item of items) {
    const key = (item.category || "Nurpur").trim();
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([category, list]) => ({ category, items: list }));
}

export function formatDate(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * True when a stored title is really a storage object name / UUID-ish filename
 * (e.g. "F48E640A C0B4 4E01 9E9F 5AEE87B4CA39", "IMG 2043", "b7f1c2d4e5...").
 * Such values must never be shown as a user-facing photo title.
 */
export function looksLikeGeneratedName(value: string) {
  const v = (value || "").trim();
  if (!v) return true;
  const compact = v.replace(/[\s_-]+/g, "");
  if (/^[0-9a-f]{8}[0-9a-f-]{8,}$/i.test(compact)) return true; // uuid / hex blob
  if (/^[0-9a-f]{16,}$/i.test(compact)) return true;
  if (/^(img|dsc|dscn|pxl|photo|video|vid|mvimg|screenshot|whatsapp)[\s_-]*\d{3,}/i.test(v)) return true;
  if (/^\d{6,}$/.test(compact)) return true;
  return false;
}

/** The title to render anywhere a photo/video is shown publicly. */
export function displayTitle(item: {
  title?: string | null;
  caption?: string | null;
  seo_title?: string | null;
  category?: string | null;
  media_type?: string | null;
}) {
  const title = (item.title || "").trim();
  if (title && !looksLikeGeneratedName(title)) return title;
  const caption = (item.caption || "").trim();
  if (caption) return caption.length > 90 ? `${caption.slice(0, 87)}…` : caption;
  const seo = (item.seo_title || "").trim();
  if (seo && !looksLikeGeneratedName(seo)) return seo;
  const kind = item.media_type === "video" ? "video" : "photo";
  const cat = (item.category || "").trim();
  return cat ? `${cat} ${kind}` : `Nurpur ${kind}`;
}

/**
 * Social reels are external content: return the platform URL to open, or null
 * when the item is self-hosted media (or the stored URL is unusable).
 */
export function externalReelHref(item: { media_url?: string | null }): string | null {
  const url = (item.media_url || "").trim();
  if (!url || !isSocialUrl(url)) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
}
