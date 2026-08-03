import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { ContactCTA } from "@/components/site/Sections";
import { Reveal } from "@/components/site/Reveal";
import { ClientsGrid } from "@/components/site/Clients";
import { listPublicClients, type ClientBrand } from "@/lib/clients.functions";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Our Clients & Brands — NurpurVasi Digitals" },
      {
        name: "description",
        content:
          "Businesses, agencies, schools, hotels, hospitals, restaurants, real estate firms and NGOs that trust NurpurVasi Digitals for design, development and growth.",
      },
      { property: "og:title", content: "Our Clients & Brands — NurpurVasi Digitals" },
      {
        property: "og:description",
        content:
          "A selection of the brands we partner with across business, hospitality, education, healthcare and social impact.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const load = useServerFn(listPublicClients);
  const { data, isLoading } = useQuery({
    queryKey: ["clients-public", "all"],
    queryFn: () => load(),
  });
  const items = (data?.items ?? []) as ClientBrand[];

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((c) => c.category && set.add(c.category));
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (!query) return true;
      return (
        c.company_name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    });
  }, [items, q, category]);

  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <Reveal variant="up">
          <div className="max-w-3xl">
            <Eyebrow>Clients</Eyebrow>
            <h1
              className="mt-5 text-5xl font-normal tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Brands that <span className="text-gradient italic">trust us</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              From boutique businesses to hospitals, hotels and NGOs — we build digital experiences
              that carry each brand forward.
            </p>
          </div>
        </Reveal>

        {items.length > 0 && (
          <div className="mt-12 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search clients…"
                aria-label="Search clients"
                className="w-full rounded-full border border-border bg-card/60 px-11 py-3 text-sm outline-none focus:border-foreground/30"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                    category === c
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card/60 hover:-translate-y-0.5"
                  }`}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center text-sm text-muted-foreground">
              {isLoading
                ? "Loading clients…"
                : items.length === 0
                  ? "Client logos will appear here once published."
                  : "No clients match your search."}
            </div>
          ) : (
            <ClientsGrid items={filtered} showDescription />
          )}
        </div>
      </Section>
      <ContactCTA />
    </SiteLayout>
  );
}
