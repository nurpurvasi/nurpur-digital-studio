import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { listPublicPosts, type BlogPost } from "@/lib/blog.functions";
import { Search, Calendar, ArrowRight, Clock } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Nurpur News & Local Stories — NurpurVasi Media" },
      { name: "description", content: "Local stories, event reports and updates from Nurpur, Kangra district, Himachal Pradesh — published by NurpurVasi Media." },
      { property: "og:title", content: "Nurpur News & Local Stories — NurpurVasi Media" },
      { property: "og:description", content: "Local stories, event reports and updates from Nurpur, Himachal Pradesh." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nurpur-digital-studio.lovable.app/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nurpur-digital-studio.lovable.app/blog" }],
  }),
  component: BlogIndex,
});

const PAGE_SIZE = 9;

export function readingTime(text: string): number {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function BlogIndex() {
  const fetchPosts = useServerFn(listPublicPosts);
  const { data, isLoading } = useQuery({
    queryKey: ["blog-public-posts"],
    queryFn: () => fetchPosts(),
  });

  const posts: BlogPost[] = data?.posts ?? [];
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => Array.from(new Set(posts.map(p => p.category).filter(Boolean))), [posts]);
  const tags = useMemo(() => Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 24), [posts]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter(p => {
      if (cat && p.category !== cat) return false;
      if (tag && !(p.tags || []).includes(tag)) return false;
      if (!term) return true;
      return (
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term)
      );
    });
  }, [posts, q, cat, tag]);

  const featured = posts.slice(0, 1)[0];
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <SiteLayout>
      <Section className="!pt-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">News</span>
        </nav>
        <Eyebrow>News & stories</Eyebrow>
        <h1 className="mt-4 text-4xl sm:text-6xl font-semibold tracking-tight">Nurpur News &amp; Stories</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Local news, event reports, culture and community stories from Nurpur, Himachal Pradesh.
        </p>

        {/* Featured */}
        {featured && (
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="group mt-12 grid gap-6 rounded-3xl border border-border bg-white p-6 shadow-[0_10px_40px_-20px_rgba(30,40,90,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_rgba(30,40,90,0.3)] md:grid-cols-2 md:p-8"
          >
            <div className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-accent">
              {featured.featured_image ? (
                <img src={featured.featured_image} alt={featured.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
              ) : (
                <div className="h-full w-full" style={{ background: "var(--gradient-brand)" }} />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {featured.category && <span className="rounded-full bg-accent px-3 py-1">{featured.category}</span>}
                {featured.publish_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(featured.publish_date)}</span>}
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {readingTime(featured.content)} min</span>
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">{featured.title}</h2>
              {featured.excerpt && <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>}
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        )}

        {/* Filters */}
        <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search articles…"
              className="w-full rounded-full border border-border bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-foreground/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setCat(""); setTag(""); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs ${!cat && !tag ? "bg-foreground text-background" : "bg-accent"}`}>All</button>
            {categories.map(c => (
              <button key={c} onClick={() => { setCat(c === cat ? "" : c); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs ${cat === c ? "bg-foreground text-background" : "bg-accent"}`}>{c}</button>
            ))}
          </div>
        </div>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map(t => (
              <button key={t} onClick={() => { setTag(t === tag ? "" : t); setPage(1); }} className={`rounded-full border border-border px-2.5 py-1 text-[11px] ${tag === t ? "bg-foreground text-background border-foreground" : "text-muted-foreground hover:text-foreground"}`}>#{t}</button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-4">
              <div className="aspect-[16/10] w-full rounded-xl bg-accent" />
              <div className="mt-4 h-4 w-3/4 rounded bg-accent" />
              <div className="mt-2 h-3 w-1/2 rounded bg-accent" />
            </div>
          ))}
          {!isLoading && pageItems.map(p => (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group overflow-hidden rounded-2xl border border-border bg-white transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_rgba(30,40,90,0.25)]"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-accent">
                {p.featured_image ? (
                  <img src={p.featured_image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                ) : (
                  <div className="h-full w-full" style={{ background: "var(--gradient-brand)" }} />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  {p.category && <span className="rounded-full bg-accent px-2 py-0.5">{p.category}</span>}
                  {p.publish_date && <span>{formatDate(p.publish_date)}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {readingTime(p.content)} min</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight leading-snug">{p.title}</h3>
                {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No posts found. Try clearing filters.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-9 min-w-9 rounded-full px-3 text-sm ${currentPage === i + 1 ? "bg-foreground text-background" : "bg-accent"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
