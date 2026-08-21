import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/** Publishable-key client for public reads from server functions. */
export function serverPublicClient() {
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

/** Throws unless the authenticated caller holds the admin role. */
export async function assertAdmin(ctx: { supabase: unknown; userId: string }) {
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

type AnyClient = unknown;

export async function publicList(table: string, cols: string, order: string) {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from(table)
    .select(cols)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order(order, { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function adminList(client: AnyClient, table: string, cols: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from(table)
    .select(cols)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsert(
  client: AnyClient,
  table: string,
  cols: string,
  payload: Record<string, unknown>,
) {
  const body = { ...payload };
  if (!body.id) delete body.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from(table)
    .upsert(body, { onConflict: "id" })
    .select(cols)
    .single();
  if (error) throw error;
  return data;
}

export async function adminDelete(client: AnyClient, table: string, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client as any).from(table).delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function adminReorder(
  client: AnyClient,
  table: string,
  items: { id: string; sort_order: number }[],
) {
  for (const it of items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (client as any)
      .from(table)
      .update({ sort_order: it.sort_order })
      .eq("id", it.id);
    if (error) throw error;
  }
  return { ok: true };
}

export const idSchema = z.object({ id: z.string().uuid() });
export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int() })).max(500),
});

const seo = {
  seo_title: z.string().max(300).default(""),
  seo_description: z.string().max(500).default(""),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  sort_order: z.number().int().default(0),
};

export const photoGallerySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(300).default(""),
  slug: z.string().max(300).default(""),
  category: z.string().max(200).default(""),
  cover_image: z.string().max(2000).default(""),
  description: z.string().max(5000).default(""),
  location: z.string().max(300).default(""),
  event_date: z.string().nullable().optional(),
  ...seo,
});

export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(300).default(""),
  slug: z.string().max(300).default(""),
  cover_image: z.string().max(2000).default(""),
  event_date: z.string().nullable().optional(),
  event_time: z.string().max(100).default(""),
  location: z.string().max(300).default(""),
  map_url: z.string().max(2000).default(""),
  description: z.string().max(5000).default(""),
  category: z.string().max(200).default(""),
  ...seo,
});

export const placeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(300).default(""),
  slug: z.string().max(300).default(""),
  category: z.string().max(200).default(""),
  cover_image: z.string().max(2000).default(""),
  gallery: z.array(z.string().max(2000)).max(200).default([]),
  description: z.string().max(8000).default(""),
  location: z.string().max(300).default(""),
  map_url: z.string().max(2000).default(""),
  ...seo,
});

export const tickerSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().max(500).default(""),
  link: z.string().max(2000).default(""),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

/** Empty date strings must become NULL for Postgres date columns. */
export function normalizeDates<T extends Record<string, unknown>>(row: T, keys: string[]) {
  const out: Record<string, unknown> = { ...row };
  for (const k of keys) if (out[k] === "" || out[k] === undefined) out[k] = null;
  return out as T;
}
