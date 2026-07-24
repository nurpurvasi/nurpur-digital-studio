import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout, Section } from "@/components/site/Layout";
import { getPublicPost, listPublicPosts, type BlogPost } from "@/lib/blog.functions";
import { readingTime } from "./blog";
import { Calendar, Clock, ArrowLeft, Facebook, Linkedin, Twitter, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { post } = await getPublicPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    const { posts } = await listPublicPosts();
    const related = posts
      .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
      .slice(0, 3);
    return { post, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.post;
    const title = p.seo_title || `${p.title} — NurpurVasi Digitals`;
    const description = p.seo_description || p.excerpt || "";
    const image = p.og_image || p.featured_image;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    const links: Array<Record<string, string>> = [];
    if (p.canonical_url) links.push({ rel: "canonical", href: p.canonical_url });
    return { meta, links };
  },
  errorComponent: () => (
    <SiteLayout>
      <Section>
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <Link to="/blog" className="mt-6 inline-block text-sm underline">Back to blog</Link>
      </Section>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <Section>
        <h1 className="text-3xl font-semibold">Article not found</h1>
        <p className="mt-4 text-muted-foreground">The post you're looking for is unavailable.</p>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-sm underline">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </Section>
    </SiteLayout>
  ),
  component: BlogPostPage,
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch { return ""; }
}

// Very light markdown -> HTML: paragraphs, headings, bold, italic, links, code, lists.
function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false;
  let inCode = false;
  let paraBuf: string[] = [];
  const flushPara = () => {
    if (paraBuf.length) {
      let text = esc(paraBuf.join(" "));
      text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
      text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
      text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      html += `<p>${text}</p>`;
      paraBuf = [];
    }
  };
  for (const raw of lines) {
    const line = raw;
    if (line.trim().startsWith("```")) {
      flushPara();
      if (inList) { html += "</ul>"; inList = false; }
      if (!inCode) { html += "<pre><code>"; inCode = true; } else { html += "</code></pre>"; inCode = false; }
      continue;
    }
    if (inCode) { html += esc(line) + "\n"; continue; }
    if (/^#{1,3}\s/.test(line)) {
      flushPara();
      if (inList) { html += "</ul>"; inList = false; }
      const level = line.match(/^#+/)![0].length;
      const text = esc(line.replace(/^#+\s*/, ""));
      html += `<h${level}>${text}</h${level}>`;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      flushPara();
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${esc(line.replace(/^\s*[-*]\s+/, ""))}</li>`;
      continue;
    }
    if (line.trim() === "") {
      flushPara();
      if (inList) { html += "</ul>"; inList = false; }
      continue;
    }
    paraBuf.push(line);
  }
  flushPara();
  if (inList) html += "</ul>";
  if (inCode) html += "</code></pre>";
  return html;
}

function BlogPostPage() {
  const { post, related } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const share = (network: "twitter" | "facebook" | "linkedin") => {
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(post.title);
    const link =
      network === "twitter"
        ? `https://twitter.com/intent/tweet?url=${u}&text=${t}`
        : network === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${u}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  };

  return (
    <SiteLayout>
      <article>
        <Section className="!pt-10">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground line-clamp-1">{post.title}</span>
          </nav>

          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {post.category && <span className="rounded-full bg-accent px-3 py-1">{post.category}</span>}
              {post.publish_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(post.publish_date)}</span>}
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {readingTime(post.content)} min read</span>
              {post.author && <span>· by {post.author}</span>}
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
          </div>

          {post.featured_image && (
            <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-border bg-accent">
              <img src={post.featured_image} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-neutral mx-auto mt-10 max-w-3xl prose-headings:tracking-tight prose-a:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {post.gallery.length > 0 && (
            <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
              {post.gallery.map((src, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border">
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">#{t}</span>
              ))}
            </div>
          )}

          <div className="mx-auto mt-8 flex max-w-3xl items-center gap-2 border-t border-border pt-6">
            <span className="text-xs text-muted-foreground mr-2">Share</span>
            <button onClick={() => share("twitter")} aria-label="Share on Twitter" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"><Twitter className="h-4 w-4" /></button>
            <button onClick={() => share("facebook")} aria-label="Share on Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"><Facebook className="h-4 w-4" /></button>
            <button onClick={() => share("linkedin")} aria-label="Share on LinkedIn" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"><Linkedin className="h-4 w-4" /></button>
            <button onClick={copy} aria-label="Copy link" className="ml-1 inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs hover:-translate-y-0.5 hover:shadow">
              <LinkIcon className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </Section>

        {related.length > 0 && (
          <Section>
            <h2 className="text-2xl font-semibold tracking-tight">Related articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p: BlogPost) => (
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
                    <div className="text-[11px] text-muted-foreground">{p.category}</div>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight leading-snug">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </article>
    </SiteLayout>
  );
}
