import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { ContactCTA } from "@/components/site/Sections";
import { Reveal } from "@/components/site/Reveal";
import { FaqAccordion, FaqJsonLd } from "@/components/site/Faqs";
import { listPublicFaqs, faqPlainText, type Faq } from "@/lib/faqs.functions";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,follow" },
      { title: "Frequently Asked Questions — NurpurVasi Digitals" },
      {
        name: "description",
        content:
          "Answers about our web design, development, SEO and digital services — timelines, pricing, support and how we work with businesses, agencies, schools, hotels, hospitals and NGOs.",
      },
      { property: "og:title", content: "Frequently Asked Questions — NurpurVasi Digitals" },
      {
        property: "og:description",
        content:
          "Everything you need to know about working with NurpurVasi Digitals — process, timelines, pricing and support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const load = useServerFn(listPublicFaqs);
  const { data, isLoading } = useQuery({
    queryKey: ["faqs-public", "all"],
    queryFn: () => load(),
  });
  const items = (data?.items ?? []) as Faq[];

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((f) => f.category && set.add(f.category));
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (!query) return true;
      return (
        f.question.toLowerCase().includes(query) ||
        faqPlainText(f.answer).toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query)
      );
    });
  }, [items, q, category]);

  return (
    <SiteLayout>
      <FaqJsonLd items={items} />
      <Section className="pt-8 sm:pt-12">
        <Reveal variant="up">
          <div className="max-w-3xl">
            <Eyebrow>FAQ</Eyebrow>
            <h1
              className="mt-5 text-5xl font-normal tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Answers to <span className="text-gradient italic">common questions</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Search our knowledge base or browse by category. Still curious? Reach out — we reply
              to every inquiry personally.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions…"
              aria-label="Search FAQs"
              className="w-full rounded-full border border-border bg-white/80 px-11 py-3 text-sm outline-none backdrop-blur-xl transition focus:border-foreground/30"
            />
          </div>
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                    category === c
                      ? "border-foreground bg-foreground text-white"
                      : "border-border bg-white/80 hover:-translate-y-0.5 hover:shadow"
                  }`}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-3xl border border-border bg-white/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/70 p-14 text-center text-sm text-muted-foreground backdrop-blur-xl">
              {items.length === 0
                ? "Questions and answers will appear here soon."
                : "No questions match your search."}
            </div>
          ) : (
            <Reveal variant="up">
              <FaqAccordion items={filtered} query={q} />
            </Reveal>
          )}
        </div>
      </Section>

      <ContactCTA />
    </SiteLayout>
  );
}
