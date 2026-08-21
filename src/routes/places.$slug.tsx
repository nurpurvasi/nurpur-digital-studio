import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { MediaCard } from "@/components/media/MediaGrid";
import { useGallery } from "@/components/media/useGallery";
import { listPublicPlaces } from "@/lib/portal.functions";

const SITE = "https://nurpur-digital-studio.lovable.app";

export const Route = createFileRoute("/places/$slug")({
  loader: async ({ params }) => {
    const { items } = await listPublicPlaces();
    return { item: items.find((p) => p.slug === params.slug) ?? null };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.item;
    const url = `${SITE}/places/${params.slug}`;
    if (!p) {
      return {
        meta: [
          { title: "Place unavailable — NurpurVasi Media" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = p.seo_title || `${p.name} — Nurpur, Himachal Pradesh | NurpurVasi Media`;
    const description =
      p.seo_description ||
      p.description ||
      `${p.name} in ${p.location || "Nurpur, Himachal Pradesh"} — photos, location and visitor information on NurpurVasi Media.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(p.cover_image?.startsWith("https://")
          ? [
              { property: "og:image", content: p.cover_image },
              { name: "twitter:image", content: p.cover_image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            name: p.name,
            description,
            url,
            image: p.cover_image || undefined,
            hasMap: p.map_url || undefined,
            address: {
              "@type": "PostalAddress",
              streetAddress: p.location || undefined,
              addressLocality: "Nurpur",
              addressRegion: "Himachal Pradesh",
              addressCountry: "IN",
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
              { "@type": "ListItem", position: 2, name: "Places", item: `${SITE}/places` },
              { "@type": "ListItem", position: 3, name: p.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: PlaceDetail,
});

function PlaceDetail() {
  const { slug } = Route.useParams();
  const load = useServerFn(listPublicPlaces);
  const { data } = useQuery({
    queryKey: ["public-places"],
    queryFn: () => load(),
    staleTime: 60_000,
  });
  const initial = Route.useLoaderData();
  const place = data?.items.find((p) => p.slug === slug) ?? initial?.item ?? null;

  const { items } = useGallery();
  const key = (place?.category || place?.name || "").toLowerCase();
  const relatedPhotos = items
    .filter((i) => i.media_type === "image" && key && (i.category || "").toLowerCase() === key)
    .slice(0, 8);
  const relatedVideos = items
    .filter((i) => i.media_type === "video" && key && (i.category || "").toLowerCase() === key)
    .slice(0, 4);

  if (!place) {
    return (
      <SiteLayout>
        <Section>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            This place is not available
          </h1>
          <Link to="/places" className="btn-primary mt-6 inline-flex">
            All places
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
          <Link to="/places" className="hover:text-foreground">
            Places
          </Link>
          <span>/</span>
          <span>{place.name}</span>
        </nav>

        <Link
          to="/places"
          className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All places
        </Link>

        <div className="mt-6 max-w-3xl">
          {place.category && <Eyebrow>{place.category}</Eyebrow>}
          <h1 className="mt-4 text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            {place.name}
          </h1>
          <p className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {place.location || "Nurpur, Himachal Pradesh"}
          </p>
          {place.description && (
            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {place.description}
            </p>
          )}
          {place.map_url && (
            <a href={place.map_url} target="_blank" rel="noreferrer" className="btn-ghost mt-6 inline-flex">
              <ExternalLink className="h-4 w-4" /> Open in Google Maps
            </a>
          )}
        </div>

        {place.cover_image && (
          <img
            src={place.cover_image}
            alt={`${place.name} — ${place.location || "Nurpur, Himachal Pradesh"}`}
            loading="lazy"
            decoding="async"
            className="mt-10 aspect-[16/9] w-full rounded-[28px] border border-border object-cover"
          />
        )}

        {place.gallery.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {place.gallery.map((url) => (
              <img
                key={url}
                src={url}
                alt={`${place.name} photo — Nurpur, Himachal Pradesh`}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
              />
            ))}
          </div>
        )}

        {relatedPhotos.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              Photos from {place.category || place.name}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {relatedPhotos.map((i) => (
                <MediaCard key={i.id} item={i} detail="photos" />
              ))}
            </div>
          </div>
        )}

        {relatedVideos.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              Videos from {place.category || place.name}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {relatedVideos.map((i) => (
                <MediaCard key={i.id} item={i} detail="videos" />
              ))}
            </div>
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
