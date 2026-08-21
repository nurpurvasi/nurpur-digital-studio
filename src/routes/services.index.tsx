import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { ContactCTA, ServicesGrid } from "@/components/site/Sections";
import { Reveal } from "@/components/site/Reveal";
import { listPublicServices, type ServiceItem } from "@/lib/services.functions";
import { getServiceIcon } from "@/components/site/service-icons";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,follow" },
      { title: "Services — NurpurVasi Digitals" },
      {
        name: "description",
        content:
          "Website design, development, SEO, analytics and bespoke digital solutions from NurpurVasi Digitals.",
      },
      { property: "og:title", content: "Services — NurpurVasi Digitals" },
      {
        property: "og:description",
        content: "Premium services: design, development, SEO and digital solutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const load = useServerFn(listPublicServices);
  const { data } = useQuery({ queryKey: ["services-public", "all"], queryFn: () => load() });
  const items = (data?.items ?? []) as ServiceItem[];

  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <Reveal variant="up">
          <div className="max-w-3xl">
            <Eyebrow>Services</Eyebrow>
            <h1
              className="mt-5 text-5xl font-normal tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Everything your brand needs, <span className="text-gradient italic">nothing it doesn't</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              A tight, senior team covering the full spectrum from strategy and design to
              engineering, SEO and long-term partnership.
            </p>
          </div>
        </Reveal>

        <div className="mt-16">
          {items.length === 0 ? (
            <Reveal variant="up" delay={120} className="block">
              <ServicesGrid />
            </Reveal>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s, i) => {
                const Icon = getServiceIcon(s.icon);
                return (
                  <Reveal key={s.id} delay={i * 70}>
                    <Link
                      to="/services/$slug"
                      params={{ slug: s.slug }}
                      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(30,40,90,0.25)]"
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: "var(--gradient-brand)" }}
                      />
                      <div className="flex items-start justify-between">
                        <div
                          className="grid h-12 w-12 place-items-center rounded-2xl text-white"
                          style={{ background: "var(--gradient-brand)" }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {s.category && (
                          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {s.category}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-6 text-lg font-semibold">{s.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {s.short_description}
                      </p>
                      <div className="mt-6 flex items-center justify-between pt-2 text-sm">
                        <span className="text-muted-foreground">
                          {s.pricing_type === "Custom Quote"
                            ? "Custom quote"
                            : `${s.pricing_type === "Starting From" ? "From " : ""}${s.price || "—"}`}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium">
                          Explore
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </Section>
      <ContactCTA />
    </SiteLayout>
  );
}
