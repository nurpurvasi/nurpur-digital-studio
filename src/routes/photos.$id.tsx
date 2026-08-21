import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CalendarDays, MapPin, Share2, Tag } from "lucide-react";
import { SiteLayout, Section } from "@/components/site/Layout";
import { MediaCard } from "@/components/media/MediaGrid";
import { formatDate, thumbOf, useGallery } from "@/components/media/useGallery";
import { getPublicGalleryItem } from "@/lib/gallery.functions";

const SITE = "https://nurpur-digital-studio.lovable.app";

export const Route = createFileRoute("/photos/$id")({
  loader: async ({ params }) => getPublicGalleryItem({ data: { id: params.id } }),
  head: ({ params, loaderData }) => {
    const item = loaderData?.item;
    const url = `${SITE}/photos/${params.id}`;
    if (!item) {
      return {
        meta: [{ title: "Media unavailable — NurpurVasi Media" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = item.seo_title || `${item.title} — NurpurVasi Media`;
    const description =
      item.seo_description ||
      item.description ||
      `${item.title} — photo from ${item.category || "Nurpur"}, published by NurpurVasi Media.`;
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
            contentLocation: { "@type": "Place", name: item.category || "Nurpur, Himachal Pradesh" },
          }),
        },
      ],
    };
  },
  component: MediaDetail,
});

function MediaDetail() {
  const { id } = Route.useParams();
  const load = useServerFn(getPublicGalleryItem);
  const { data } = useQuery({
    queryKey: ["gallery-item", id],
    queryFn: () => load({ data: { id } }),
    initialData: Route.useLoaderData(),
  });
  const item = data?.item ?? null;
  const navigate = useNavigate();
  const { items } = useGallery();
  const related = items.filter((i) => i.id !== id && i.category === item?.category).slice(0, 8);

  const share = async () => {
    const url = `${window.location.origin}/photos/${id}`;
    try {
      if (navigator.share) await navigator.share({ title: item?.title || "NurpurVasi Media", url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* dismissed */
    }
  };

  if (!item) {
    return (
      <SiteLayout>
        <Section>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            This media is not available
          </h1>
          <Link to="/photos" className="btn-primary mt-6 inline-flex">
            Back to photos
          </Link>
        </Section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Section>
        <Link
          to="/photos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All media
        </Link>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_30px_80px_-50px_color-mix(in_oklab,var(--navy)_50%,transparent)]">
          <div className="bg-foreground/95">
            {item.media_type === "video" ? (
              <video
                src={item.media_url}
                poster={item.thumbnail || undefined}
                className="max-h-[75vh] w-full"
                controls
                playsInline
              />
            ) : (
              <img
                src={item.media_url || thumbOf(item)}
                alt={item.alt_text || item.title}
                className="max-h-[75vh] w-full object-contain"
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
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(item.publish_date || item.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                <MapPin className="h-3 w-3" />
                Nurpur, Himachal Pradesh
              </span>
            </div>

            <h1
              className="mt-5 text-3xl tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {item.title}
            </h1>
            {item.description && (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            )}
            <button onClick={share} className="btn-ghost mt-7 inline-flex">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              More from {item.category || "Nurpur"}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {related.map((r) => (
                <MediaCard
                  key={r.id}
                  item={r}
                  onOpen={() => navigate({ to: "/photos/$id", params: { id: r.id } })}
                />
              ))}
            </div>
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
