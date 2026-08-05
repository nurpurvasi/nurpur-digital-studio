import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type TeamSocialLinks = {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  x?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  designation: string;
  bio: string;
  profile_image: string;
  email: string;
  phone: string;
  social_links: TeamSocialLinks;
  featured: boolean;
  sort_order: number;
  status: "draft" | "published";
  publish_date: string | null;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
};

const SELECT_COLS =
  "id, name, designation, bio, profile_image, email, phone, social_links, featured, sort_order, status, publish_date, seo_title, seo_description, created_at, updated_at";

const PUBLIC_SELECT_COLS =
  "id, name, designation, bio, profile_image, social_links, featured, sort_order, status, publish_date, seo_title, seo_description, created_at, updated_at";

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

export const listPublicTeam = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("team_members_public")
    .select(PUBLIC_SELECT_COLS)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as TeamMember[] };
  return { items: (data ?? []) as TeamMember[] };
});

export const listFeaturedTeam = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supa as any)
    .from("team_members_public")
    .select(PUBLIC_SELECT_COLS)
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { items: [] as TeamMember[] };
  return { items: (data ?? []) as TeamMember[] };
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

export const listAdminTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("team_members")
      .select(SELECT_COLS)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { items: (data ?? []) as TeamMember[] };
  });

export const getAdminTeamMember = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("team_members")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { item: (row ?? null) as TeamMember | null };
  });

const socialSchema = z.object({
  instagram: z.string().max(500).optional().default(""),
  linkedin: z.string().max(500).optional().default(""),
  facebook: z.string().max(500).optional().default(""),
  x: z.string().max(500).optional().default(""),
});

const teamInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(200).default(""),
  designation: z.string().max(200).default(""),
  bio: z.string().max(5000).default(""),
  profile_image: z.string().max(2000).default(""),
  email: z.string().max(320).default(""),
  phone: z.string().max(60).default(""),
  social_links: socialSchema.default({}),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  publish_date: z.string().nullable().optional(),
  seo_title: z.string().max(300).default(""),
  seo_description: z.string().max(500).default(""),
});

export const upsertTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => teamInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      ...data,
      publish_date: data.publish_date || null,
      created_by: context.userId,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("team_members")
      .upsert(payload, { onConflict: "id" })
      .select(SELECT_COLS)
      .single();
    if (error) throw error;
    return { item: row as TeamMember };
  });

export const deleteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any)
      .from("team_members")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const duplicateTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const { data: row, error } = await supa
      .from("team_members")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Not found");
    const copy = {
      ...row,
      id: undefined,
      name: row.name ? `${row.name} (Copy)` : "(Copy)",
      status: "draft",
      publish_date: null,
      featured: false,
      created_by: context.userId,
      created_at: undefined,
      updated_at: undefined,
    };
    const { data: inserted, error: insErr } = await supa
      .from("team_members")
      .insert(copy)
      .select(SELECT_COLS)
      .single();
    if (insErr) throw insErr;
    return { item: inserted as TeamMember };
  });

export const reorderTeam = createServerFn({ method: "POST" })
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
        .from("team_members")
        .update({ sort_order: it.sort_order })
        .eq("id", it.id);
      if (error) throw error;
    }
    return { ok: true };
  });
