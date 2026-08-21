import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { MediaCard } from "@/components/media/MediaGrid";
import { formatDate, thumbOf, useGallery } from "@/components/media/useGallery";
import { getPublicGalleryBySlug } from "@/lib/portal.functions";

const SITE = "https://nurpur-digital-studio.lovable.app";

export const Route = createFileRoute("/galleries/$slug")({
  loader: async ({ params }) => getPublicGalleryBySlug({ data: { slug: params.slug } }),
  head: ({ params, loaderData }) => {
    const g = loaderData?.item;
    const url = `${SITE}/galleries/${params.slug}`;
    if (!g) {
      return {
        meta: [
          { title: "Gallery unavailable — NurpurVasi Media" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = g.seo_title || `${g.name} — Nurpur photo gallery | NurpurVasi Media`;
    const description =
      g.seo_description ||
      g.description ||
      `${g.name} — photo gallery from ${g.location || "Nurpur, Himachal Pradesh"} on NurpurVasi Media.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(g.cover_image?.startsWith("https://")
          ? [
              { property: "og:image", content: g.cover_image },
              { name: "twitter:image", content: g.cover_image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            name: g.name,
            description,
            url,
            image: g.cover_image || undefined,
            contentLocation: {
              "@type": "Place",
              name: g.location || "Nurpur, Himachal Pradesh",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE },
              { "@type": "ListItem", position: 2, name: "Photos", item: `${SITE}/photos` },
              { "@type": "ListItem", position: 3, name: g.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: GalleryDetail,
});

function GalleryDetail() {
  const { slug } = Route.useParams();
  const load = useServerFn(getPublicGalleryBySlug);
  const { data } = useQuery({
    queryKey: ["public-gallery", slug],
    queryFn: () => load({ data: { slug } }),
    initialData: Route.useLoaderData(),
  });
  const gallery = data?.item ?? null;
  const { items } = useGallery();
  const inGallery = gallery ? items.filter((i) => i.gallery_id === gallery.id) : [];

  if (!gallery) {
    return (
      <SiteLayout>
        <Section>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            This gallery is not available
          </h1>
          <Link to="/photos" className="btn-primary mt-6 inline-flex">
            Browse all photos
          </Link>
        </Section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Section>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link to="/photos" className="hover:text-foreground">
            Photos
          </Link>
          <span>/</span>
          <span>{gallery.name}</span>
        </nav>

        <Link
          to="/photos"
          className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All photos
        </Link>

        <div className="mt-6 max-w-3xl">
          {gallery.category && <Eyebrow>{gallery.category}</Eyebrow>}
          <h1 className="mt-4 text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            {gallery.name}
          </h1>
          {gallery.description && (
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {gallery.description}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
              <MapPin className="h-3 w-3" />
              {gallery.location || "Nurpur, Himachal Pradesh"}
            </span>
            {formatDate(gallery.event_date) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(gallery.event_date)}
              </span>
            )}
          </div>
        </div>

        {gallery.cover_image && inGallery.length === 0 && (
          <img
            src={gallery.cover_image}
            alt={`${gallery.name} — Nurpur`}
            loading="lazy"
            decoding="async"
            className="mt-10 aspect-[16/9] w-full rounded-[28px] border border-border object-cover"
          />
        )}

        {inGallery.length > 0 && (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {inGallery.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                detail={item.media_type === "video" ? "videos" : "photos"}
              />
            ))}
          </div>
        )}

        {inGallery.length === 0 && !gallery.cover_image && (
          <p className="mt-10 text-sm text-muted-foreground">Photos from this gallery are coming soon.</p>
        )}
      </Section>
    </SiteLayout>
  );
}

export { thumbOf };
