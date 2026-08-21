import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const CLIENT_CATEGORIES = [
  "Business",
  "Agency",
  "School",
  "Hotel",
  "Hospital",
  "Restaurant",
  "Real Estate",
  "NGO",
] as const;

export type ClientCategory = (typeof CLIENT_CATEGORIES)[number];

export type ClientBrand = {
  id: string;
  company_name: string;
  slug: string;
  logo: string;
  website: string;
  description: string;
  category: string;
  featured: boolean;
  display_order: number;
  published: boolean;
  seo_title: string;
  seo_description: string;
  phone: string;
  whatsapp: string;
  address: string;
  map_url: string;
  cover_image: string;
  instagram: string;
  facebook: string;
  youtube: string;
  gallery: string[];
  created_at: string;
  updated_at: string;
};

const SELECT_COLS =
  "id, company_name, slug, logo, website, description, category, featured, display_order, published, seo_title, seo_description, phone, whatsapp, address, map_url, cover_image, instagram, facebook, youtube, gallery, created_at, updated_at";

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

export const listPublicClients = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("clients")
    .select(SELECT_COLS)
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as ClientBrand[] };
  return { items: (data ?? []) as ClientBrand[] };
});

export const listFeaturedClients = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("clients")
    .select(SELECT_COLS)
    .eq("published", true)
    .eq("featured", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as ClientBrand[] };
  return { items: (data ?? []) as ClientBrand[] };
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

export const listAdminClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("clients")
      .select(SELECT_COLS)
      .order("display_order", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { items: (data ?? []) as ClientBrand[] };
  });

export const getAdminClient = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("clients")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { item: (row ?? null) as ClientBrand | null };
  });

const clientInput = z.object({
  id: z.string().uuid().optional(),
  company_name: z.string().max(200).default(""),
  slug: z.string().max(200).default(""),
  logo: z.string().max(1000).default(""),
  website: z.string().max(500).default(""),
  description: z.string().max(2000).default(""),
  category: z.string().max(60).default("Business"),
  featured: z.boolean().default(false),
  display_order: z.number().int().default(0),
  published: z.boolean().default(false),
  seo_title: z.string().max(300).default(""),
  seo_description: z.string().max(500).default(""),
});

export const upsertClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => clientInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const base = slugify(data.slug || data.company_name) || `client-${Date.now()}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;

    let slug = base;
    for (let n = 0; n < 25; n++) {
      const { data: clash } = await supa
        .from("clients")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!clash || (data.id && clash.id === data.id)) break;
      slug = `${base}-${n + 2}`;
    }

    const payload = { ...data, slug, created_by: context.userId };
    const { data: row, error } = await supa
      .from("clients")
      .upsert(payload, { onConflict: "id" })
      .select(SELECT_COLS)
      .single();
    if (error) throw error;
    return { item: row as ClientBrand };
  });

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any).from("clients").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const duplicateClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const { data: row, error } = await supa
      .from("clients")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Not found");
    const copy = {
      ...row,
      id: undefined,
      company_name: row.company_name ? `${row.company_name} (Copy)` : "(Copy)",
      slug: `${row.slug || "client"}-copy-${Date.now().toString(36)}`,
      published: false,
      featured: false,
      created_by: context.userId,
      created_at: undefined,
      updated_at: undefined,
    };
    const { data: inserted, error: insErr } = await supa
      .from("clients")
      .insert(copy)
      .select(SELECT_COLS)
      .single();
    if (insErr) throw insErr;
    return { item: inserted as ClientBrand };
  });

export const reorderClients = createServerFn({ method: "POST" })
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
        .from("clients")
        .update({ display_order: it.display_order })
        .eq("id", it.id);
      if (error) throw error;
    }
    return { ok: true };
  });

/** Public: one business by slug (published only). */
export const getPublicClientBySlug = createServerFn({ method: "GET" })
  .inputValidator((i: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(i))
  .handler(async ({ data }) => {
    const supa = serverPublicClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (supa as any)
      .from("clients")
      .select(SELECT_COLS)
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return { item: (row ?? null) as ClientBrand | null };
  });
