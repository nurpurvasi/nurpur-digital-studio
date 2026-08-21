import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  media_type: "image" | "video";
  media_url: string;
  thumbnail: string;
  alt_text: string;
  featured: boolean;
  sort_order: number;
  status: "draft" | "published";
  publish_date: string | null;
  seo_title: string;
  seo_description: string;
  views: number;
  created_at: string;
  updated_at: string;
};

const SELECT_COLS =
  "id, title, description, category, media_type, media_url, thumbnail, alt_text, featured, sort_order, status, publish_date, seo_title, seo_description, views, created_at, updated_at";

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

// ---------- PUBLIC ----------

export const listPublicGallery = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("gallery")
    .select(SELECT_COLS)
    .eq("status", "published")
    .lte("publish_date", new Date().toISOString())
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as GalleryItem[] };
  return { items: (data ?? []) as GalleryItem[] };
});

export const listFeaturedGallery = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("gallery")
    .select(SELECT_COLS)
    .eq("status", "published")
    .eq("featured", true)
    .lte("publish_date", new Date().toISOString())
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as GalleryItem[] };
  return { items: (data ?? []) as GalleryItem[] };
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

export const listAdminGallery = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("gallery")
      .select(SELECT_COLS)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { items: (data ?? []) as GalleryItem[] };
  });

export const getAdminGalleryItem = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("gallery")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { item: (row ?? null) as GalleryItem | null };
  });

const galleryInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(300).default(""),
  description: z.string().max(5000).default(""),
  category: z.string().max(200).default(""),
  media_type: z.enum(["image", "video"]).default("image"),
  media_url: z.string().max(2000).default(""),
  thumbnail: z.string().max(2000).default(""),
  alt_text: z.string().max(500).default(""),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  publish_date: z.string().nullable().optional(),
  seo_title: z.string().max(300).default(""),
  seo_description: z.string().max(500).default(""),
});

export const upsertGalleryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => galleryInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      ...data,
      publish_date: data.publish_date || null,
      created_by: context.userId,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("gallery")
      .upsert(payload, { onConflict: "id" })
      .select(SELECT_COLS)
      .single();
    if (error) throw error;
    return { item: row as GalleryItem };
  });

export const deleteGalleryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any)
      .from("gallery")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const duplicateGalleryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const { data: row, error } = await supa
      .from("gallery")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Not found");
    const copy = {
      ...row,
      id: undefined,
      title: row.title ? `${row.title} (Copy)` : "(Copy)",
      status: "draft",
      publish_date: null,
      featured: false,
      views: 0,
      created_by: context.userId,
      created_at: undefined,
      updated_at: undefined,
    };
    const { data: inserted, error: insErr } = await supa
      .from("gallery")
      .insert(copy)
      .select(SELECT_COLS)
      .single();
    if (insErr) throw insErr;
    return { item: inserted as GalleryItem };
  });

export const reorderGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        items: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int() })).max(500),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    for (const it of data.items) {
      const { error } = await supa
        .from("gallery")
        .update({ sort_order: it.sort_order })
        .eq("id", it.id);
      if (error) throw error;
    }
    return { ok: true };
  });

// Public single-item read used by the photo/video detail pages.
export const getPublicGalleryItem = createServerFn({ method: "GET" })
  .inputValidator((i: { id: string }) => z.object({ id: z.string().min(1).max(100) }).parse(i))
  .handler(async ({ data }) => {
    const supa = serverPublicClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (supa as any)
      .from("gallery")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .eq("status", "published")
      .maybeSingle();
    return { item: (row ?? null) as GalleryItem | null };
  });

/** Public: bump the view counter for a published item. Fire-and-forget. */
export const recordGalleryView = createServerFn({ method: "POST" })
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const supa = serverPublicClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supa as any).rpc("increment_gallery_views", { _id: data.id });
    return { ok: true };
  });
