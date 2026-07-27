import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type LeadStatus = "new" | "contacted" | "in_progress" | "closed" | "spam";
export type LeadPriority = "low" | "medium" | "high";

export type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  source_page: string | null;
  website_template: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_to: string | null;
  notes: string | null;
  ip_address: string | null;
  user_agent: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = any;

async function ensureAdmin(ctx: { supabase: SupabaseLike; userId: string }) {
  const { data } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

const submitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(320),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(5000),
  source_page: z.string().trim().max(500).optional().or(z.literal("")),
  website_template: z.string().trim().max(80).optional().or(z.literal("")),
  user_agent: z.string().trim().max(500).optional().or(z.literal("")),
});

/** Public: submit a new lead. Uses the anon key server-side to bypass client bundle issues. */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: z.input<typeof submitSchema>) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      subject: data.subject || null,
      message: data.message,
      source_page: data.source_page || null,
      website_template: data.website_template || null,
      user_agent: data.user_agent || null,
    };

    const { error } = await supabase.from("leads").insert(payload);
    if (error) {
      console.error("Lead insert failed", error);
      throw new Error("Could not submit right now. Please try again.");
    }
    return { ok: true };
  });

/** Admin: list all leads. */
export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { leads: (data ?? []) as Lead[] };
  });

/** Admin: get one lead. */
export const getLead = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { data: row, error } = await context.supabase
      .from("leads")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { lead: row as Lead | null };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "in_progress", "closed", "spam"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assigned_to: z.string().max(200).nullable().optional(),
  notes: z.string().max(10000).nullable().optional(),
});

/** Admin: update lead fields. */
export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof updateSchema>) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { id, ...rest } = data;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) if (v !== undefined) patch[k] = v;
    const { error } = await context.supabase.from("leads").update(patch).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

/** Admin: delete a lead. */
export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("leads").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
