import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Landmark } from "lucide-react";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { listPublicPlaces } from "@/lib/portal.functions";

const SITE = "https://nurpur-digital-studio.lovable.app";

export const Route = createFileRoute("/places/")({
  head: () => ({
    meta: [
      { title: "Places to See in Nurpur — Fort, Temples & Viewpoints | NurpurVasi Media" },
      {
        name: "description",
        content:
          "Explore places in Nurpur, Himachal Pradesh — Nurpur Fort, temples, viewpoints and local landmarks, with photos and directions.",
      },
      { property: "og:title", content: "Places to See in Nurpur" },
      {
        property: "og:description",
        content: "Nurpur Fort, temples, viewpoints and local landmarks with photos and directions.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/places` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/places` }],
  }),
  component: PlacesIndex,
});

function PlacesIndex() {
  const load = useServerFn(listPublicPlaces);
  const { data } = useQuery({
    queryKey: ["public-places"],
    queryFn: () => load(),
    staleTime: 60_000,
  });
  const places = data?.items ?? [];

  return (
    <SiteLayout>
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Explore Nurpur</Eyebrow>
          <h1 className="mt-5 text-4xl tracking-tight sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
            Places in <span className="text-gradient italic">Nurpur</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Landmarks, temples, forts and viewpoints across Nurpur, Kangra district, Himachal Pradesh.
          </p>
        </div>

        {places.length > 0 ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p) => (
              <Link
                key={p.id}
                to="/places/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-[26px] border border-border bg-card transition hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {p.cover_image ? (
                    <img
                      src={p.cover_image}
                      alt={`${p.name} — Nurpur, Himachal Pradesh`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-muted-foreground">
                      <Landmark className="h-8 w-8" />
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.location || "Nurpur, Himachal Pradesh"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-sm text-muted-foreground">Places are being added soon.</p>
        )}
      </Section>
    </SiteLayout>
  );
}
