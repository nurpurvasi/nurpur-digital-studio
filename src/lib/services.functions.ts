import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type PricingType = "Fixed" | "Starting From" | "Custom Quote";

export type ServiceItem = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  icon: string;
  featured_image: string;
  gallery_images: string[];
  category: string;
  pricing_type: PricingType;
  price: string;
  duration: string;
  features: string[];
  technologies: string[];
  cta_text: string;
  cta_link: string;
  seo_title: string;
  seo_description: string;
  display_order: number;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const SELECT_COLS =
  "id, title, slug, short_description, full_description, icon, featured_image, gallery_images, category, pricing_type, price, duration, features, technologies, cta_text, cta_link, seo_title, seo_description, display_order, featured, published, created_at, updated_at";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

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

export const listPublicServices = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("services")
    .select(SELECT_COLS)
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as ServiceItem[] };
  return { items: (data ?? []) as ServiceItem[] };
});

export const listFeaturedServices = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("services")
    .select(SELECT_COLS)
    .eq("published", true)
    .eq("featured", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as ServiceItem[] };
  return { items: (data ?? []) as ServiceItem[] };
});

export const getPublicService = createServerFn({ method: "GET" })
  .inputValidator((i: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(i))
  .handler(async ({ data }) => {
    const supa = serverPublicClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (supa as any)
      .from("services")
      .select(SELECT_COLS)
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!row) return { item: null as ServiceItem | null, related: [] as ServiceItem[] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let relatedQuery = (supa as any)
      .from("services")
      .select(SELECT_COLS)
      .eq("published", true)
      .neq("id", row.id)
      .order("display_order", { ascending: true })
      .limit(3);
    if (row.category) relatedQuery = relatedQuery.eq("category", row.category);
    let { data: related } = await relatedQuery;
    if (!related || related.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fallback = await (supa as any)
        .from("services")
        .select(SELECT_COLS)
        .eq("published", true)
        .neq("id", row.id)
        .order("display_order", { ascending: true })
        .limit(3);
      related = fallback.data ?? [];
    }
    return { item: row as ServiceItem, related: (related ?? []) as ServiceItem[] };
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

export const listAdminServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("services")
      .select(SELECT_COLS)
      .order("display_order", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { items: (data ?? []) as ServiceItem[] };
  });

export const getAdminService = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("services")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { item: (row ?? null) as ServiceItem | null };
  });

const serviceInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(200).default(""),
  slug: z.string().max(200).default(""),
  short_description: z.string().max(1000).default(""),
  full_description: z.string().max(20000).default(""),
  icon: z.string().max(100).default(""),
  featured_image: z.string().max(2000).default(""),
  gallery_images: z.array(z.string().max(2000)).max(50).default([]),
  category: z.string().max(120).default(""),
  pricing_type: z.enum(["Fixed", "Starting From", "Custom Quote"]).default("Custom Quote"),
  price: z.string().max(120).default(""),
  duration: z.string().max(120).default(""),
  features: z.array(z.string().max(300)).max(100).default([]),
  technologies: z.array(z.string().max(100)).max(100).default([]),
  cta_text: z.string().max(120).default(""),
  cta_link: z.string().max(500).default(""),
  seo_title: z.string().max(300).default(""),
  seo_description: z.string().max(500).default(""),
  display_order: z.number().int().default(0),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export const upsertService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => serviceInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const base = slugify(data.slug || data.title) || `service-${Date.now()}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;

    let slug = base;
    for (let n = 0; n < 25; n++) {
      const { data: clash } = await supa
        .from("services")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!clash || (data.id && clash.id === data.id)) break;
      slug = `${base}-${n + 2}`;
    }

    const payload = { ...data, slug, created_by: context.userId };
    const { data: row, error } = await supa
      .from("services")
      .upsert(payload, { onConflict: "id" })
      .select(SELECT_COLS)
      .single();
    if (error) throw error;
    return { item: row as ServiceItem };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any)
      .from("services")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const duplicateService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const { data: row, error } = await supa
      .from("services")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Not found");
    const copy = {
      ...row,
      id: undefined,
      title: row.title ? `${row.title} (Copy)` : "(Copy)",
      slug: `${row.slug || "service"}-copy-${Date.now().toString(36)}`,
      published: false,
      featured: false,
      created_by: context.userId,
      created_at: undefined,
      updated_at: undefined,
    };
    const { data: inserted, error: insErr } = await supa
      .from("services")
      .insert(copy)
      .select(SELECT_COLS)
      .single();
    if (insErr) throw insErr;
    return { item: inserted as ServiceItem };
  });

export const reorderServices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        items: z
          .array(z.object({ id: z.string().uuid(), display_order: z.number().int() }))
          .max(500),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    for (const it of data.items) {
      const { error } = await supa
        .from("services")
        .update({ display_order: it.display_order })
        .eq("id", it.id);
      if (error) throw error;
    }
    return { ok: true };
  });
