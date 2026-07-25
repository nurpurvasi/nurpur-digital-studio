import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: string;
  short_description: string;
  full_description: string;
  cover_image: string;
  gallery: string[];
  technologies: string[];
  website_url: string;
  completion_date: string | null;
  featured: boolean;
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
  "id, slug, title, client, category, short_description, full_description, cover_image, gallery, technologies, website_url, completion_date, featured, status, publish_date, seo_title, seo_description, og_image, canonical_url, created_at, updated_at";

function normalize(row: Record<string, unknown>): PortfolioProject {
  return {
    ...(row as unknown as PortfolioProject),
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    technologies: Array.isArray(row.technologies) ? (row.technologies as string[]) : [],
  };
}

// ---------- PUBLIC ----------

export const listPublicProjects = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("portfolio_projects")
    .select(SELECT_COLS)
    .eq("status", "published")
    .lte("publish_date", new Date().toISOString())
    .order("publish_date", { ascending: false });
  if (error) return { projects: [] as PortfolioProject[] };
  return { projects: (data ?? []).map(normalize) };
});

export const getPublicProject = createServerFn({ method: "GET" })
  .inputValidator((i: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(i))
  .handler(async ({ data }) => {
    const supa = serverPublicClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (supa as any)
      .from("portfolio_projects")
      .select(SELECT_COLS)
      .eq("slug", data.slug)
      .eq("status", "published")
      .lte("publish_date", new Date().toISOString())
      .maybeSingle();
    if (!row) return { project: null as PortfolioProject | null };
    return { project: normalize(row) };
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

export const listAdminProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("portfolio_projects")
      .select(SELECT_COLS)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { projects: (data ?? []).map(normalize) };
  });

export const getAdminProject = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("portfolio_projects")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { project: row ? normalize(row) : null };
  });

const projectInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  client: z.string().max(200).default(""),
  category: z.string().max(120).default(""),
  short_description: z.string().max(1000).default(""),
  full_description: z.string().default(""),
  cover_image: z.string().max(1000).default(""),
  gallery: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  website_url: z.string().max(500).default(""),
  completion_date: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  publish_date: z.string().nullable().optional(),
  seo_title: z.string().max(300).default(""),
  seo_description: z.string().max(500).default(""),
  og_image: z.string().max(1000).default(""),
  canonical_url: z.string().max(500).default(""),
});

export const upsertProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => projectInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      ...data,
      publish_date: data.publish_date || null,
      completion_date: data.completion_date || null,
      created_by: context.userId,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("portfolio_projects")
      .upsert(payload, { onConflict: "id" })
      .select(SELECT_COLS)
      .single();
    if (error) throw error;
    return { project: normalize(row) };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any)
      .from("portfolio_projects")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const duplicateProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const { data: row, error } = await supa
      .from("portfolio_projects")
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
      featured: false,
      created_by: context.userId,
      created_at: undefined,
      updated_at: undefined,
    };
    const { data: inserted, error: insErr } = await supa
      .from("portfolio_projects")
      .insert(copy)
      .select(SELECT_COLS)
      .single();
    if (insErr) throw insErr;
    return { project: normalize(inserted) };
  });
