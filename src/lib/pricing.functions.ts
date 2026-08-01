import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type BillingCycle = "One Time" | "Monthly" | "Quarterly" | "Yearly";

export type PricingPlan = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  price: string;
  currency: string;
  billing_cycle: BillingCycle;
  badge: string;
  button_text: string;
  button_link: string;
  plan_color: string;
  icon: string;
  features: string[];
  limitations: string[];
  display_order: number;
  featured: boolean;
  published: boolean;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
};

const SELECT_COLS =
  "id, title, slug, short_description, price, currency, billing_cycle, badge, button_text, button_link, plan_color, icon, features, limitations, display_order, featured, published, seo_title, seo_description, created_at, updated_at";

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

export const listPublicPricingPlans = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("pricing_plans")
    .select(SELECT_COLS)
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as PricingPlan[] };
  return { items: (data ?? []) as PricingPlan[] };
});

export const listFeaturedPricingPlans = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("pricing_plans")
    .select(SELECT_COLS)
    .eq("published", true)
    .eq("featured", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as PricingPlan[] };
  return { items: (data ?? []) as PricingPlan[] };
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

export const listAdminPricingPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("pricing_plans")
      .select(SELECT_COLS)
      .order("display_order", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { items: (data ?? []) as PricingPlan[] };
  });

export const getAdminPricingPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("pricing_plans")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { item: (row ?? null) as PricingPlan | null };
  });

const planInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(200).default(""),
  slug: z.string().max(200).default(""),
  short_description: z.string().max(1000).default(""),
  price: z.string().max(120).default(""),
  currency: z.string().max(20).default("INR"),
  billing_cycle: z.enum(["One Time", "Monthly", "Quarterly", "Yearly"]).default("One Time"),
  badge: z.string().max(60).default(""),
  button_text: z.string().max(120).default(""),
  button_link: z.string().max(500).default(""),
  plan_color: z.string().max(60).default(""),
  icon: z.string().max(100).default(""),
  features: z.array(z.string().max(300)).max(100).default([]),
  limitations: z.array(z.string().max(300)).max(100).default([]),
  display_order: z.number().int().default(0),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  seo_title: z.string().max(300).default(""),
  seo_description: z.string().max(500).default(""),
});

export const upsertPricingPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => planInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const base = slugify(data.slug || data.title) || `plan-${Date.now()}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;

    let slug = base;
    for (let n = 0; n < 25; n++) {
      const { data: clash } = await supa
        .from("pricing_plans")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!clash || (data.id && clash.id === data.id)) break;
      slug = `${base}-${n + 2}`;
    }

    const payload = { ...data, slug, created_by: context.userId };
    const { data: row, error } = await supa
      .from("pricing_plans")
      .upsert(payload, { onConflict: "id" })
      .select(SELECT_COLS)
      .single();
    if (error) throw error;
    return { item: row as PricingPlan };
  });

export const deletePricingPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any)
      .from("pricing_plans")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const duplicatePricingPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const { data: row, error } = await supa
      .from("pricing_plans")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Not found");
    const copy = {
      ...row,
      id: undefined,
      title: row.title ? `${row.title} (Copy)` : "(Copy)",
      slug: `${row.slug || "plan"}-copy-${Date.now().toString(36)}`,
      published: false,
      featured: false,
      created_by: context.userId,
      created_at: undefined,
      updated_at: undefined,
    };
    const { data: inserted, error: insErr } = await supa
      .from("pricing_plans")
      .insert(copy)
      .select(SELECT_COLS)
      .single();
    if (insErr) throw insErr;
    return { item: inserted as PricingPlan };
  });

export const reorderPricingPlans = createServerFn({ method: "POST" })
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
        .from("pricing_plans")
        .update({ display_order: it.display_order })
        .eq("id", it.id);
      if (error) throw error;
    }
    return { ok: true };
  });
