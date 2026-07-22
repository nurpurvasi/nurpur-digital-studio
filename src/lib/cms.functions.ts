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

async function assertAdmin(ctx: { supabase: SupabaseLike; userId: string }) {
  const { data: role } = await ctx.supabase
    .from("user_roles").select("role")
    .eq("user_id", ctx.userId).eq("role", "admin").maybeSingle();
  if (!role) throw new Error("Forbidden");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = any;

export const MEDIA_FOLDERS = ["logos", "hero", "portfolio", "gallery", "services", "team", "testimonials", "general"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

/** Generate a signed upload URL for a media file. Admin only. */
export const createMediaUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { filename: string; contentType: string; folder?: string; overwritePath?: string }) => {
    return z.object({
      filename: z.string().min(1).max(200),
      contentType: z.string().min(1).max(100),
      folder: z.string().max(50).optional(),
      overwritePath: z.string().max(300).optional(),
    }).parse(input);
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    let path: string;
    if (data.overwritePath) {
      path = data.overwritePath;
      await context.supabase.storage.from("site-media").remove([path]);
    } else {
      const folder = (data.folder ?? "general").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "general";
      path = `${folder}/${Date.now()}-${safe}`;
    }

    const { data: signed, error } = await context.supabase.storage
      .from("site-media")
      .createSignedUploadUrl(path);
    if (error) throw error;

    const { data: publicUrlData } = context.supabase.storage
      .from("site-media")
      .getPublicUrl(path);

    const { data: signedRead } = await context.supabase.storage
      .from("site-media")
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    return {
      path,
      uploadUrl: signed.signedUrl,
      token: signed.token,
      publicUrl: publicUrlData.publicUrl,
      signedUrl: signedRead?.signedUrl ?? publicUrlData.publicUrl,
    };
  });

/** List media files in a folder. Admin only. */
export const listMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { folder: string }) =>
    z.object({ folder: z.enum(MEDIA_FOLDERS) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: list, error } = await context.supabase.storage
      .from("site-media")
      .list(data.folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = (list ?? []).filter((f: any) => f.id && f.name);
    const items = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      files.map(async (f: any) => {
        const path = `${data.folder}/${f.name}`;
        const { data: signed } = await context.supabase.storage
          .from("site-media")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        return {
          name: f.name as string,
          path,
          size: (f.metadata?.size as number) ?? 0,
          contentType: (f.metadata?.mimetype as string) ?? "",
          createdAt: (f.created_at as string) ?? null,
          url: signed?.signedUrl ?? "",
        };
      }),
    );
    return { items };
  });

/** Delete media files. Admin only. */
export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { paths: string[] }) =>
    z.object({ paths: z.array(z.string().min(1).max(300)).min(1).max(100) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.storage.from("site-media").remove(data.paths);
    if (error) throw error;
    return { ok: true };
  });

/** Rename (move) a media file within its folder. Admin only. */
export const renameMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string; newName: string }) =>
    z.object({
      path: z.string().min(1).max(300),
      newName: z.string().min(1).max(200),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const parts = data.path.split("/");
    const folder = parts.slice(0, -1).join("/") || "general";
    const safe = data.newName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const newPath = `${folder}/${safe}`;
    if (newPath === data.path) return { ok: true, path: newPath, url: "" };
    const { error } = await context.supabase.storage.from("site-media").move(data.path, newPath);
    if (error) throw error;
    const { data: signed } = await context.supabase.storage
      .from("site-media")
      .createSignedUrl(newPath, 60 * 60 * 24 * 365);
    return { ok: true, path: newPath, url: signed?.signedUrl ?? "" };
  });
