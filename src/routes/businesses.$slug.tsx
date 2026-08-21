import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ExternalLink,
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Store,
  Youtube,
} from "lucide-react";
import { SiteLayout, Section } from "@/components/site/Layout";
import { getPublicClientBySlug } from "@/lib/clients.functions";

const SITE = "https://nurpur-digital-studio.lovable.app";

export const Route = createFileRoute("/businesses/$slug")({
  loader: async ({ params }) => getPublicClientBySlug({ data: { slug: params.slug } }),
  head: ({ params, loaderData }) => {
    const b = loaderData?.item;
    const url = `${SITE}/businesses/${params.slug}`;
    if (!b) {
      return {
        meta: [
          { title: "Business unavailable — NurpurVasi Media" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = b.seo_title || `${b.company_name} — ${b.category || "Business"} in Nurpur`;
    const description =
      b.seo_description ||
      b.description ||
      `${b.company_name} — ${b.category || "local business"} in Nurpur, Himachal Pradesh. Contact details, address and photos on NurpurVasi Media.`;
    const image = b.cover_image || b.logo;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
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
            "@type": "LocalBusiness",
            name: b.company_name,
            description,
            image: image || undefined,
            telephone: b.phone || undefined,
            url: b.website || url,
            address: b.address
              ? {
                  "@type": "PostalAddress",
                  streetAddress: b.address,
                  addressLocality: "Nurpur",
                  addressRegion: "Himachal Pradesh",
                  addressCountry: "IN",
                }
              : {
                  "@type": "PostalAddress",
                  addressLocality: "Nurpur",
                  addressRegion: "Himachal Pradesh",
                  addressCountry: "IN",
                },
            hasMap: b.map_url || undefined,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE },
              { "@type": "ListItem", position: 2, name: "Business", item: `${SITE}/business` },
              { "@type": "ListItem", position: 3, name: b.company_name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: BusinessDetail,
});

function BusinessDetail() {
  const { slug } = Route.useParams();
  const load = useServerFn(getPublicClientBySlug);
  const { data } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => load({ data: { slug } }),
    initialData: Route.useLoaderData(),
  });
  const b = data?.item ?? null;

  if (!b) {
    return (
      <SiteLayout>
        <Section>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            This business is not available
          </h1>
          <Link to="/business" className="btn-primary mt-6 inline-flex">
            Back to businesses
          </Link>
        </Section>
      </SiteLayout>
    );
  }

  const media = Array.isArray(b.gallery) ? b.gallery.filter((m) => typeof m === "string" && m) : [];
  const socials = [
    { href: b.instagram, label: "Instagram", Icon: Instagram },
    { href: b.facebook, label: "Facebook", Icon: Facebook },
    { href: b.youtube, label: "YouTube", Icon: Youtube },
    { href: b.website, label: "Website", Icon: ExternalLink },
  ].filter((s) => !!s.href);

  return (
    <SiteLayout>
      <Section>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link to="/business" className="hover:text-foreground">
            Business
          </Link>
        </nav>

        <Link
          to="/business"
          className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All businesses
        </Link>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-border bg-card">
          {b.cover_image && (
            <div className="aspect-[16/9] w-full bg-muted sm:aspect-[21/9]">
              <img
                src={b.cover_image}
                alt={`${b.company_name} cover photo`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-9">
            <div className="flex items-center gap-4">
              {b.logo ? (
                <img
                  src={b.logo}
                  alt={`${b.company_name} logo`}
                  className="h-14 w-14 rounded-2xl object-contain"
                />
              ) : (
                <span
                  className="grid h-14 w-14 place-items-center rounded-2xl text-background"
                  style={{ background: "var(--gradient-vivid)" }}
                >
                  <Store className="h-6 w-6" />
                </span>
              )}
              <div className="min-w-0">
                <h1
                  className="truncate text-3xl tracking-tight sm:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {b.company_name}
                </h1>
                {b.category && (
                  <p className="text-sm text-muted-foreground">{b.category} · Nurpur</p>
                )}
              </div>
            </div>

            {b.description && (
              <p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {b.description}
              </p>
            )}

            {(b.address || b.phone) && (
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                {b.address && (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {b.address}
                  </p>
                )}
                {b.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" /> {b.phone}
                  </p>
                )}
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {b.phone && (
                <a href={`tel:${b.phone}`} className="btn-primary inline-flex">
                  <Phone className="h-4 w-4" /> Call
                </a>
              )}
              {b.whatsapp && (
                <a
                  href={`https://wa.me/${b.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost inline-flex"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
              {b.map_url && (
                <a
                  href={b.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost inline-flex"
                >
                  <MapPin className="h-4 w-4" /> Directions
                </a>
              )}
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost inline-flex"
                >
                  <Icon className="h-4 w-4" /> {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {media.length > 0 && (
          <div className="mt-14">
            <h2
              className="text-2xl tracking-tight sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Photos & videos
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {media.map((url) =>
                /\.(mp4|webm|mov)$/i.test(url) ? (
                  <video
                    key={url}
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-square w-full rounded-3xl border border-border bg-muted object-cover"
                  />
                ) : (
                  <img
                    key={url}
                    src={url}
                    alt={`${b.company_name} photo`}
                    loading="lazy"
                    className="aspect-square w-full rounded-3xl border border-border bg-muted object-cover"
                  />
                ),
              )}
            </div>
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
