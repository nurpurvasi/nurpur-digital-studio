import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { ContactCTA } from "@/components/site/Sections";
import { Reveal } from "@/components/site/Reveal";
import { AddPlaceholder } from "@/components/site/AddPlaceholder";
import { listPublicProjects, type PortfolioProject } from "@/lib/portfolio.functions";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — NurpurVasi Digitals" },
      {
        name: "description",
        content: "Selected work from NurpurVasi Digitals — premium websites, products and brands.",
      },
      { property: "og:title", content: "Portfolio — NurpurVasi Digitals" },
      {
        property: "og:description",
        content: "Selected work: premium websites, products and brands.",
      },
      { property: "og:url", content: "/portfolio" },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const load = useServerFn(listPublicProjects);
  const { data } = useQuery<{ projects: PortfolioProject[] }>({
    queryKey: ["public-portfolio"],
    queryFn: () => load(),
    initialData: { projects: [] },
    staleTime: 60_000,
  });

  const projects: PortfolioProject[] = data?.projects ?? [];
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [projects]);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!query ||
          p.title.toLowerCase().includes(query) ||
          p.client.toLowerCase().includes(query) ||
          p.short_description.toLowerCase().includes(query) ||
          p.technologies.some((t) => t.toLowerCase().includes(query)))
    );
  }, [projects, q, cat]);

  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <Reveal variant="up">
          <div className="max-w-3xl">
            <Eyebrow>Selected work</Eyebrow>
            <h1
              className="mt-5 text-5xl font-normal tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Work we're <span className="text-gradient italic">proud of</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              A curated selection of recent engagements across brand, product and platform.
            </p>
          </div>
        </Reveal>

        {projects.length > 0 && (
          <Reveal variant="up" delay={80} className="mt-10 block">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search projects, clients, tech…"
                  className="w-full rounded-full border border-border bg-white px-11 py-3 text-sm outline-none focus:border-foreground/30"
                />
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCat("")}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                      !cat ? "border-foreground bg-foreground text-white" : "border-border bg-white hover:-translate-y-0.5"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                        cat === c ? "border-foreground bg-foreground text-white" : "border-border bg-white hover:-translate-y-0.5"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        )}

        <Reveal variant="up" delay={120} className="mt-12 block">
          {filtered.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={i % 3 === 0 ? "md:col-span-2" : ""}>
                  <AddPlaceholder label="Add Portfolio Project" minHeight="280px" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filtered.map((p, i) => (
                <Link
                  key={p.id}
                  to="/portfolio/$slug"
                  params={{ slug: p.slug }}
                  className={`group relative overflow-hidden rounded-[28px] border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(30,40,90,0.25)] ${
                    i % 3 === 0 ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    {p.cover_image ? (
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]"
                        style={{ background: "var(--gradient-brand)" }}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 p-6">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {[p.category, p.client].filter(Boolean).join(" · ")}
                      </p>
                      <h3 className="mt-1 truncate text-lg font-semibold">{p.title}</h3>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background transition-colors group-hover:bg-accent">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Reveal>
      </Section>
      <ContactCTA />
    </SiteLayout>
  );
}
