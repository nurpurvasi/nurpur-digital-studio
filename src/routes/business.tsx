import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Store } from "lucide-react";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { listPublicClients } from "@/lib/clients.functions";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Nurpur Business Directory — Promote Your Local Shop | NurpurVasi Media" },
      {
        name: "description",
        content:
          "Discover shops, services and local brands from Nurpur. Get your business promoted to thousands of NurpurVasi Media followers.",
      },
      { property: "og:title", content: "Nurpur Business Directory — Promote Your Local Shop" },
      {
        property: "og:description",
        content: "Local Nurpur shops, services and brands — plus promotion for your own business.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nurpur-digital-studio.lovable.app/business" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nurpur-digital-studio.lovable.app/business" }],
  }),
  component: BusinessPage,
});

function BusinessPage() {
  const load = useServerFn(listPublicClients);
  const { data } = useQuery({
    queryKey: ["clients-public", "business"],
    queryFn: () => load(),
    staleTime: 60_000,
  });
  const businesses = data?.items ?? [];

  return (
    <SiteLayout>
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Business promotion</Eyebrow>
          <h1
            className="mt-5 text-4xl tracking-tight sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Local businesses of <span className="text-gradient italic">Nurpur</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Shops, services and brands from our town. Want your business featured here and on our
            social pages? Get in touch.
          </p>
        </div>

        {businesses.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">
            Local businesses will be listed here as soon as they are published.
          </p>
        ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => {
              const Card = (
                <>
                  <div className="flex items-center gap-4">
                    {b.logo ? (
                      <img
                        src={b.logo}
                        alt={`${b.company_name} logo`}
                        loading="lazy"
                        className="h-12 w-12 rounded-2xl object-contain"
                      />
                    ) : (
                      <span
                        className="grid h-12 w-12 place-items-center rounded-2xl text-background"
                        style={{ background: "var(--gradient-vivid)" }}
                      >
                        <Store className="h-5 w-5" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{b.company_name}</p>
                      {b.category && (
                        <p className="truncate text-xs text-muted-foreground">{b.category}</p>
                      )}
                    </div>
                  </div>
                  {b.description && (
                    <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{b.description}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    View details <ExternalLink className="h-3 w-3" />
                  </span>
                </>
              );
              const cls =
                "block rounded-3xl border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_color-mix(in_oklab,var(--royal)_45%,transparent)]";
              return (
                <Link key={b.id} to="/businesses/$slug" params={{ slug: b.slug }} className={cls}>
                  {Card}
                </Link>
              );
            })}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
