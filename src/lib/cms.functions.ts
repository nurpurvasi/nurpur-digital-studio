import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

/** Whether the caller has the 'admin' role. Reads own row via RLS. */
export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return { isAdmin: false };
    return { isAdmin: !!data };
  });

/** Load the draft content for the CMS editor. Admin only. */
export const getDraftContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Verify admin
    const { data: role } = await context.supabase
      .from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { data, error } = await context.supabase
      .from("site_content")
      .select("draft, published, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    return {
      draft: (data?.draft ?? {}) as Json,
      published: (data?.published ?? {}) as Json,
      updatedAt: data?.updated_at ?? null,
    };
  });

const contentSchema = z.record(z.any());

/** Save the draft JSON (autosave). Admin only. */
export const saveDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { draft: Json }) => ({
    draft: contentSchema.parse(input.draft) as Json,
  }))
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase
      .from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { error } = await context.supabase
      .from("site_content")
      .update({ draft: data.draft, updated_by: context.userId })
      .eq("id", 1);
    if (error) throw error;
    return { ok: true };
  });

/** Publish: copy draft → published. */
export const publishDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase
      .from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { data: row, error: readErr } = await context.supabase
      .from("site_content").select("draft").eq("id", 1).maybeSingle();
    if (readErr) throw readErr;

    const { error } = await context.supabase
      .from("site_content")
      .update({ published: row?.draft ?? {}, updated_by: context.userId })
      .eq("id", 1);
    if (error) throw error;
    return { ok: true };
  });

/** Discard draft: copy published → draft. */
export const discardDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase
      .from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { data: row } = await context.supabase
      .from("site_content").select("published").eq("id", 1).maybeSingle();
    const { error } = await context.supabase
      .from("site_content")
      .update({ draft: row?.published ?? {}, updated_by: context.userId })
      .eq("id", 1);
    if (error) throw error;
    return { ok: true };
  });

/**
 * Update one top-level section of the site content. Writes to BOTH draft
 * and published so inline edits go live instantly. Admin only.
 */
export const saveInlineEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { section: string; value: Json }) =>
    z.object({
      section: z.string().min(1).max(50),
      value: z.any(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase
      .from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { data: row, error: readErr } = await context.supabase
      .from("site_content")
      .select("draft, published")
      .eq("id", 1)
      .maybeSingle();
    if (readErr) throw readErr;

    const draft = { ...((row?.draft ?? {}) as Record<string, unknown>), [data.section]: data.value };
    const published = { ...((row?.published ?? {}) as Record<string, unknown>), [data.section]: data.value };

    const { error } = await context.supabase
      .from("site_content")
      .update({ draft: draft as Json, published: published as Json, updated_by: context.userId })
      .eq("id", 1);
    if (error) throw error;
    return { ok: true };
  });

/** Generate a signed upload URL for a media file. Admin only. */
export const createMediaUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { filename: string; contentType: string }) => {
    return z.object({
      filename: z.string().min(1).max(200),
      contentType: z.string().min(1).max(100),
    }).parse(input);
  })
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase
      .from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Forbidden");

    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safe}`;

    const { data: signed, error } = await context.supabase.storage
      .from("site-media")
      .createSignedUploadUrl(path);
    if (error) throw error;

    const { data: publicUrlData } = context.supabase.storage
      .from("site-media")
      .getPublicUrl(path);

    return { path, uploadUrl: signed.signedUrl, token: signed.token, publicUrl: publicUrlData.publicUrl };
  });
