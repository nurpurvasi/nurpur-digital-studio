/** Shared slug helper (browser + server safe). */
export function slugify(v: string) {
  return (v || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120);
}
