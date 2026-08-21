import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://nurpur-digital-studio.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/photos", changefreq: "daily", priority: "0.9" },
  { path: "/videos", changefreq: "daily", priority: "0.9" },
  { path: "/reels", changefreq: "weekly", priority: "0.7" },
  { path: "/places", changefreq: "weekly", priority: "0.7" },
  { path: "/business", changefreq: "weekly", priority: "0.7" },
  { path: "/weather", changefreq: "daily", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC];

        try {
          const { serverPublicClient } = await import("@/lib/collection.server");
          const supa = serverPublicClient();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const db = supa as any;

          const [media, galleries, places, businesses, posts] = await Promise.all([
            db
              .from("gallery")
              .select("id, slug, media_type, media_url")
              .eq("status", "published")
              .limit(2000),
            db.from("photo_galleries").select("slug").eq("status", "published").limit(500),
            db.from("places").select("slug").eq("status", "published").limit(500),
            db.from("clients").select("slug").eq("published", true).limit(500),
            db.from("blog_posts").select("slug").eq("status", "published").limit(500),
          ]);

          const social = /instagram\.com|facebook\.com|fb\.watch|youtube\.com|youtu\.be/i;
          for (const row of media.data ?? []) {
            // Reels point at external social URLs — they have no crawlable page here.
            if (social.test(row.media_url || "")) continue;
            const key = row.slug || row.id;
            if (!key) continue;
            entries.push({
              path: `/${row.media_type === "video" ? "videos" : "photos"}/${key}`,
              changefreq: "monthly",
              priority: "0.8",
            });
          }
          for (const g of galleries.data ?? [])
            if (g.slug) entries.push({ path: `/galleries/${g.slug}`, changefreq: "weekly", priority: "0.8" });
          for (const p of places.data ?? [])
            if (p.slug) entries.push({ path: `/places/${p.slug}`, changefreq: "monthly", priority: "0.7" });
          for (const b of businesses.data ?? [])
            if (b.slug) entries.push({ path: `/businesses/${b.slug}`, changefreq: "monthly", priority: "0.6" });
          for (const p of posts.data ?? [])
            if (p.slug) entries.push({ path: `/blog/${p.slug}`, changefreq: "monthly", priority: "0.6" });
        } catch {
          // Fall back to the static routes if the database is unreachable.
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
