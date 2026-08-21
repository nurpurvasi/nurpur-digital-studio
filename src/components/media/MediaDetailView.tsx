import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Images,
  Share2,
  Tag,
} from "lucide-react";
import type { GalleryItem } from "@/lib/gallery.functions";
import { recordGalleryView } from "@/lib/gallery.functions";
import { useServerFn } from "@tanstack/react-start";
import { Section } from "@/components/site/Layout";
import { MediaCard } from "./MediaGrid";
import { listPublicGalleries } from "@/lib/portal.functions";
import { displayTitle, formatDate, thumbOf, useGallery, usePhotos, useVideos } from "./useGallery";

type Kind = "photos" | "videos";

/** Shared, SEO-friendly detail page body for a single photo or video. */
export function MediaDetailView({
  item,
  kind,
  galleryName = "",
}: {
  item: GalleryItem;
  kind: Kind;
  galleryName?: string;
}) {
  const { items } = useGallery();
  const photos = usePhotos(items);
  const videos = useVideos(items);
  const siblings = kind === "videos" ? videos : photos;
  const bump = useServerFn(recordGalleryView);

  useEffect(() => {
    const key = `nv-view-${item.id}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) return;
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode */
    }
    void bump({ data: { id: item.id } }).catch(() => undefined);
  }, [item.id, bump]);

  const { prev, next } = useMemo(() => {
    const i = siblings.findIndex((s) => s.id === item.id);
    if (i < 0) return { prev: null, next: null };
    return { prev: siblings[i - 1] ?? null, next: siblings[i + 1] ?? null };
  }, [siblings, item.id]);

  const loadGalleries = useServerFn(listPublicGalleries);
  const { data: galleryData } = useQuery({
    queryKey: ["public-galleries"],
    queryFn: () => loadGalleries(),
    staleTime: 5 * 60_000,
    enabled: Boolean(item.gallery_id),
  });
  const parentGallery = item.gallery_id
    ? (galleryData?.items.find((g) => g.id === item.gallery_id) ?? null)
    : null;

  const sameCategory = items.filter(
    (i) => i.id !== item.id && (i.category || "") === (item.category || ""),
  );
  const relatedPhotos = sameCategory.filter((i) => i.media_type === "image").slice(0, 8);
  const relatedVideos = sameCategory.filter((i) => i.media_type === "video").slice(0, 4);

  const detailRoute = kind === "videos" ? "/videos/$id" : "/photos/$id";
  const listRoute = kind === "videos" ? "/videos" : "/photos";
  const views = (item.views ?? 0) + 1;

  const share = async () => {
    const url = `${window.location.origin}/${kind}/${item.slug || item.id}`;
    try {
      if (navigator.share) await navigator.share({ title: item.title || "NurpurVasi Media", url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* dismissed */
    }
  };

  return (
    <Section>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link to={listRoute} className="hover:text-foreground">
          {kind === "videos" ? "Videos" : "Photos"}
        </Link>
        {item.category && (
          <>
            <span>/</span>
            <span>{item.category}</span>
          </>
        )}
      </nav>

      <Link
        to={listRoute}
        className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All {kind === "videos" ? "videos" : "photos"}
      </Link>

      <div className="mt-5 overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_30px_80px_-50px_color-mix(in_oklab,var(--navy)_50%,transparent)]">
        <div className="bg-foreground/95">
          {item.media_type === "video" ? (
            <video
              src={item.media_url}
              poster={item.thumbnail || undefined}
              className="max-h-[75vh] w-full"
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={item.media_url || thumbOf(item)}
              alt={item.alt_text || displayTitle(item)}
              className="max-h-[75vh] w-full object-contain"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          )}
        </div>

        <div className="p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {item.category && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-background"
                style={{ background: "var(--gradient-vivid)" }}
              >
                <Tag className="h-3 w-3" />
                {item.category}
              </span>
            )}
            {formatDate(item.publish_date || item.created_at) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(item.publish_date || item.created_at)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
              <Eye className="h-3 w-3" />
              {views.toLocaleString("en-IN")} views
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
              <MapPin className="h-3 w-3" />
              {item.location || "Nurpur, Himachal Pradesh"}
            </span>
            {parentGallery ? (
              <Link
                to="/galleries/$slug"
                params={{ slug: parentGallery.slug }}
                className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 font-semibold hover:text-foreground"
              >
                <Images className="h-3 w-3" />
                {parentGallery.name}
              </Link>
            ) : (
              galleryName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                  <Tag className="h-3 w-3" />
                  {galleryName}
                </span>
              )
            )}
          </div>

          <h1
            className="mt-5 text-3xl tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {item.title}
          </h1>
          {item.caption && (
            <p className="mt-4 max-w-3xl text-base font-medium text-foreground/90">{item.caption}</p>
          )}
          {item.description && (
            <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button onClick={share} className="btn-ghost inline-flex">
              <Share2 className="h-4 w-4" /> Share
            </button>
            {prev && (
              <Link to={detailRoute} params={{ id: prev.slug || prev.id }} className="btn-ghost inline-flex">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            )}
            {next && (
              <Link to={detailRoute} params={{ id: next.slug || next.id }} className="btn-ghost inline-flex">
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {parentGallery && (
        <div className="mt-12">
          <Link to="/galleries/$slug" params={{ slug: parentGallery.slug }} className="btn-ghost inline-flex">
            <Images className="h-4 w-4" /> See the full {parentGallery.name} gallery
          </Link>
        </div>
      )}

      {relatedPhotos.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            More photos from {item.category || "Nurpur"}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {relatedPhotos.map((r) => (
              <MediaCard key={r.id} item={r} detail="photos" />
            ))}
          </div>
        </div>
      )}

      {relatedVideos.length > 0 && (
        <div className="mt-14">
          <h2 className="text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Videos from {item.category || "Nurpur"}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {relatedVideos.map((r) => (
              <MediaCard key={r.id} item={r} detail="videos" />
            ))}
          </div>
        </div>
      )}

    </Section>
  );
}

/** Shown when an id does not resolve to a published item. */
export function MediaMissing({ kind }: { kind: Kind }) {
  return (
    <Section>
      <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
        This media is not available
      </h1>
      <Link to={kind === "videos" ? "/videos" : "/photos"} className="btn-primary mt-6 inline-flex">
        Back to {kind === "videos" ? "videos" : "photos"}
      </Link>
    </Section>
  );
}

/** Shared head() builder for photo/video detail routes. */
export function mediaDetailHead({
  item,
  kind,
  id,
  site,
}: {
  item: GalleryItem | null | undefined;
  kind: Kind;
  id: string;
  site: string;
}) {
  const url = `${site}/${kind}/${id}`;
  if (!item) {
    return {
      meta: [
        { title: "Media unavailable — NurpurVasi Media" },
        { name: "robots", content: "noindex" },
      ],
    };
  }
  const label = kind === "videos" ? "video" : "photo";
  const title = item.seo_title || `${item.title} — Nurpur ${label} | NurpurVasi Media`;
  const description =
    item.seo_description ||
    item.description ||
    `${item.title} — ${label} from ${item.category || "Nurpur"}, Himachal Pradesh, published by NurpurVasi Media.`;
  const image = item.media_type === "image" ? item.media_url : item.thumbnail;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      ...(image?.startsWith("https://")
        ? [
            { property: "og:image", content: image },
            { name: "twitter:image", content: image },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": item.media_type === "video" ? "VideoObject" : "ImageObject",
          name: item.title,
          description,
          contentUrl: item.media_url,
          thumbnailUrl: item.thumbnail || undefined,
          uploadDate: item.publish_date || item.created_at,
          caption: item.alt_text || displayTitle(item),
          contentLocation: {
            "@type": "Place",
            name: item.category || "Nurpur, Himachal Pradesh",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site },
            {
              "@type": "ListItem",
              position: 2,
              name: kind === "videos" ? "Videos" : "Photos",
              item: `${site}/${kind}`,
            },
            { "@type": "ListItem", position: 3, name: item.title, item: url },
          ],
        }),
      },
    ],
  };
}
