import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const FAQ_CATEGORIES = [
  "Business",
  "Agency",
  "School",
  "Hotel",
  "Hospital",
  "Restaurant",
  "Real Estate",
  "NGO",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  featured: boolean;
  published: boolean;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
};

const SELECT_COLS =
  "id, question, answer, category, display_order, featured, published, seo_title, seo_description, created_at, updated_at";

/** Strip rich-text markup down to plain text (used for JSON-LD + search). */
export function faqPlainText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove dangerous markup from admin-authored rich text before storing/rendering. */
export function sanitizeRichText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
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

export const listPublicFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("faqs")
    .select(SELECT_COLS)
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return { items: [] as Faq[] };
  return { items: (data ?? []) as Faq[] };
});

export const listFeaturedFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("faqs")
    .select(SELECT_COLS)
    .eq("published", true)
    .eq("featured", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return { items: [] as Faq[] };
  return { items: (data ?? []) as Faq[] };
});

// ---------- ADMIN ----------

async function assertStaff(ctx: { supabase: unknown; userId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = ctx.supabase as any;
  const { data } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .in("role", ["admin", "editor"]);
  if (!data || data.length === 0) throw new Error("Forbidden");
}

export const listAdminFaqs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("faqs")
      .select(SELECT_COLS)
      .order("display_order", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { items: (data ?? []) as Faq[] };
  });

export const getAdminFaq = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("faqs")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { item: (row ?? null) as Faq | null };
  });

const faqInput = z.object({
  id: z.string().uuid().optional(),
  question: z.string().max(500).default(""),
  answer: z.string().max(20000).default(""),
  category: z.string().max(60).default("Business"),
  display_order: z.number().int().default(0),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  seo_title: z.string().max(300).default(""),
  seo_description: z.string().max(500).default(""),
});

export const upsertFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => faqInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const payload = {
      ...data,
      answer: sanitizeRichText(data.answer),
      created_by: context.userId,
    };
    const { data: row, error } = await supa
      .from("faqs")
      .upsert(payload, { onConflict: "id" })
      .select(SELECT_COLS)
      .single();
    if (error) throw error;
    return { item: row as Faq };
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any).from("faqs").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const duplicateFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const { data: row, error } = await supa
      .from("faqs")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Not found");
    const copy = {
      ...row,
      id: undefined,
      question: row.question ? `${row.question} (Copy)` : "(Copy)",
      published: false,
      featured: false,
      created_by: context.userId,
      created_at: undefined,
      updated_at: undefined,
    };
    const { data: inserted, error: insErr } = await supa
      .from("faqs")
      .insert(copy)
      .select(SELECT_COLS)
      .single();
    if (insErr) throw insErr;
    return { item: inserted as Faq };
  });

export const reorderFaqs = createServerFn({ method: "POST" })
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
    await assertStaff(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    for (const it of data.items) {
      const { error } = await supa
        .from("faqs")
        .update({ display_order: it.display_order })
        .eq("id", it.id);
      if (error) throw error;
    }
    return { ok: true };
  });
