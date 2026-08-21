import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicGallery, type GalleryItem } from "@/lib/gallery.functions";

/** Single shared read of the published gallery — every media section reuses it. */
export function useGallery() {
  const load = useServerFn(listPublicGallery);
  const { data, isLoading } = useQuery({
    queryKey: ["gallery-public", "all"],
    queryFn: () => load(),
    staleTime: 60_000,
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

export function thumbOf(item: GalleryItem) {
  if (item.thumbnail) return item.thumbnail;
  if (item.media_type === "image") return item.media_url;
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
