import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  gallery: string[];
  category: string;
  tags: string[];
  author: string;
  status: "draft" | "published";
  publish_date: string | null;
  seo_title: string;
  seo_description: string;
  og_image: string;
  canonical_url: string;
  created_at: string;
  updated_at: string;
};

function serverPublicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const SELECT_COLS =
  "id, slug, title, excerpt, content, featured_image, gallery, category, tags, author, status, publish_date, seo_title, seo_description, og_image, canonical_url, created_at, updated_at";

function normalize(row: Record<string, unknown>): BlogPost {
  return {
    ...(row as unknown as BlogPost),
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

// ---------- PUBLIC ----------

export const listPublicPosts = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("blog_posts")
    .select(SELECT_COLS)
    .eq("status", "published")
    .order("publish_date", { ascending: false, nullsFirst: false });
  if (error) return { posts: [] as BlogPost[] };
  return { posts: (data ?? []).map(normalize) };
});

export const getPublicPost = createServerFn({ method: "GET" })
  .inputValidator((i: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(i))
  .handler(async ({ data }) => {
    const supa = serverPublicClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (supa as any)
      .from("blog_posts")
      .select(SELECT_COLS)
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!row) return { post: null as BlogPost | null };
    return { post: normalize(row) };
  });

// ---------- ADMIN ----------

async function assertAdmin(ctx: { supabase: unknown; userId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = ctx.supabase as any;
  const { data } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const listAdminPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("blog_posts")
      .select(SELECT_COLS)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { posts: (data ?? []).map(normalize) };
  });

export const getAdminPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("blog_posts")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { post: row ? normalize(row) : null };
  });

const postInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(1000).default(""),
  content: z.string().default(""),
  featured_image: z.string().max(1000).default(""),
  gallery: z.array(z.string()).default([]),
  category: z.string().max(120).default(""),
  tags: z.array(z.string()).default([]),
  author: z.string().max(200).default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  publish_date: z.string().nullable().optional(),
  seo_title: z.string().max(300).default(""),
  seo_description: z.string().max(500).default(""),
  og_image: z.string().max(1000).default(""),
  canonical_url: z.string().max(500).default(""),
});

export const upsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => postInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      ...data,
      publish_date: data.publish_date || null,
      created_by: context.userId,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("blog_posts")
      .upsert(payload, { onConflict: "id" })
      .select(SELECT_COLS)
      .single();
    if (error) throw error;
    return { post: normalize(row) };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any).from("blog_posts").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const duplicatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const { data: row, error } = await supa
      .from("blog_posts")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Not found");
    const suffix = Math.random().toString(36).slice(2, 6);
    const copy = {
      ...row,
      id: undefined,
      slug: `${row.slug}-copy-${suffix}`,
      title: `${row.title} (Copy)`,
      status: "draft",
      publish_date: null,
      created_by: context.userId,
      created_at: undefined,
      updated_at: undefined,
    };
    const { data: inserted, error: insErr } = await supa
      .from("blog_posts")
      .insert(copy)
      .select(SELECT_COLS)
      .single();
    if (insErr) throw insErr;
    return { post: normalize(inserted) };
  });
