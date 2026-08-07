import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { mediaUrlForPath } from "@/lib/media-url";

const MEDIA_COLUMNS: Record<string, string[]> = {
  blog_posts: ["featured_image", "gallery", "og_image", "content"],
  clients: ["logo"],
  faqs: ["answer"],
  gallery: ["media_url", "thumbnail"],
  portfolio_projects: ["cover_image", "gallery", "og_image"],
  services: ["featured_image", "gallery_images"],
  team_members: ["profile_image"],
  testimonials: ["client_photo", "company_logo"],
};

function replaceDeep(value: unknown, oldUrl: string, newUrl: string): unknown {
  if (typeof value === "string") return value.split(oldUrl).join(newUrl);
  if (Array.isArray(value)) return value.map((item) => replaceDeep(item, oldUrl, newUrl));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceDeep(item, oldUrl, newUrl)]),
    );
  }
  return value;
}

function containsDeep(value: unknown, url: string): boolean {
  if (typeof value === "string") return value.includes(url);
  if (Array.isArray(value)) return value.some((item) => containsDeep(item, url));
  if (value && typeof value === "object") return Object.values(value).some((item) => containsDeep(item, url));
  return false;
}

export async function replaceMediaReferences(oldPath: string, newPath: string) {
  const oldUrl = mediaUrlForPath(oldPath);
  const newUrl = mediaUrlForPath(newPath);

  const { data: content, error: contentError } = await supabaseAdmin
    .from("site_content")
    .select("id, draft, published");
  if (contentError) throw contentError;
  for (const row of content ?? []) {
    if (!containsDeep(row, oldUrl)) continue;
    const { error } = await supabaseAdmin
      .from("site_content")
      .update({
        draft: replaceDeep(row.draft, oldUrl, newUrl),
        published: replaceDeep(row.published, oldUrl, newUrl),
      })
      .eq("id", row.id);
    if (error) throw error;
  }

  for (const [table, columns] of Object.entries(MEDIA_COLUMNS)) {
    const { data: rows, error: readError } = await supabaseAdmin
      .from(table)
      .select(["id", ...columns].join(","));
    if (readError) throw readError;
    for (const row of rows ?? []) {
      const updates: Record<string, unknown> = {};
      for (const column of columns) {
        const current = row[column];
        if (containsDeep(current, oldUrl)) updates[column] = replaceDeep(current, oldUrl, newUrl);
      }
      if (Object.keys(updates).length === 0) continue;
      const { error } = await supabaseAdmin.from(table).update(updates).eq("id", row.id);
      if (error) throw error;
    }
  }
}

export async function assertMediaUnreferenced(paths: string[]) {
  const urls = paths.map(mediaUrlForPath);
  const { data: content, error: contentError } = await supabaseAdmin
    .from("site_content")
    .select("draft, published");
  if (contentError) throw contentError;
  if ((content ?? []).some((row) => urls.some((url) => containsDeep(row, url)))) {
    throw new Error("This asset is still used by website content. Remove or replace it there before deleting.");
  }

  for (const [table, columns] of Object.entries(MEDIA_COLUMNS)) {
    const { data: rows, error } = await supabaseAdmin.from(table).select(columns.join(","));
    if (error) throw error;
    if ((rows ?? []).some((row) => urls.some((url) => containsDeep(row, url)))) {
      throw new Error("This asset is still used by a CMS item. Remove or replace it there before deleting.");
    }
  }
}

export async function downloadMedia(path: string) {
  return supabaseAdmin.storage.from("site-media").download(path);
}