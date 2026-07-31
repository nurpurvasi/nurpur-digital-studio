import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { getPublicService } from "@/lib/services.functions";
import { getServiceIcon } from "@/components/site/service-icons";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const res = await getPublicService({ data: { slug: params.slug } });
    if (!res.item) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.item) {
      return {
        meta: [{ title: "Service unavailable" }, { name: "robots", content: "noindex" }],
      };
    }
    const s = loaderData.item;
    const title = s.seo_title || `${s.title} — NurpurVasi Digitals`;
    const description =
      s.seo_description || s.short_description || `${s.title} services by NurpurVasi Digitals.`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (s.featured_image?.startsWith("https://")) {
      meta.push({ property: "og:image", content: s.featured_image });
      meta.push({ name: "twitter:image", content: s.featured_image });
    }
    return { meta };
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <Section>
        <p role="alert" className="text-sm text-muted-foreground">
          {error.message}
        </p>
      </Section>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <Section>
        <h1 className="text-3xl font-semibold">Service not found</h1>
        <Link to="/services" className="mt-4 inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>
      </Section>
    </SiteLayout>
  ),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { item, related } = Route.useLoaderData();
  if (!item) return null;
  const Icon = getServiceIcon(item.icon);
  const gallery = Array.isArray(item.gallery_images) ? item.gallery_images : [];
  const features = Array.isArray(item.features) ? item.features : [];
  const technologies = Array.isArray(item.technologies) ? item.technologies : [];

  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <Reveal variant="up">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All services
          </Link>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <Eyebrow>{item.category || "Service"}</Eyebrow>
              <h1
                className="mt-5 text-5xl font-normal tracking-tight sm:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.title}
              </h1>
              {item.short_description && (
                <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                  {item.short_description}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-border bg-card px-4 py-2">
                  {item.pricing_type}
                  {item.price ? ` · ${item.price}` : ""}
                </span>
                {item.duration && (
                  <span className="rounded-full border border-border bg-card px-4 py-2">
                    {item.duration}
                  </span>
                )}
              </div>
              <div className="mt-8">
                <a
                  href={item.cta_link || "/contact"}
                  className="btn-primary inline-flex items-center gap-2 !px-6 !py-3 text-sm"
                >
                  {item.cta_text || "Get a free consultation"}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-[28px] border border-border bg-card">
              {item.featured_image ? (
                <img
                  src={item.featured_image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div
                  className="grid aspect-[4/3] w-full place-items-center text-white"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <Icon className="h-16 w-16" />
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {item.full_description && (
          <Reveal variant="up" delay={100} className="mt-16 block">
            <div className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {item.full_description}
            </div>
          </Reveal>
        )}

        {features.length > 0 && (
          <Reveal variant="up" delay={120} className="mt-16 block">
            <h2 className="text-2xl font-semibold tracking-tight">What's included</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {features.map((f, i) => (
                <li
                  key={`${f}-${i}`}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm"
                >
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {technologies.length > 0 && (
          <Reveal variant="up" delay={140} className="mt-16 block">
            <h2 className="text-2xl font-semibold tracking-tight">Technologies</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {technologies.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="rounded-full border border-border bg-card px-4 py-2 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        {gallery.length > 0 && (
          <Reveal variant="up" delay={160} className="mt-16 block">
            <h2 className="text-2xl font-semibold tracking-tight">Gallery</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="overflow-hidden rounded-3xl border border-border bg-card"
                >
                  <img
                    src={src}
                    alt={`${item.title} ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {related.length > 0 && (
          <Reveal variant="up" delay={180} className="mt-20 block">
            <h2 className="text-2xl font-semibold tracking-tight">Related services</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const RIcon = getServiceIcon(r.icon);
                return (
                  <Link
                    key={r.id}
                    to="/services/$slug"
                    params={{ slug: r.slug }}
                    className="group rounded-3xl border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(30,40,90,0.25)]"
                  >
                    <div
                      className="grid h-11 w-11 place-items-center rounded-2xl text-white"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <RIcon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold">{r.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {r.short_description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        )}
      </Section>
    </SiteLayout>
  );
}
