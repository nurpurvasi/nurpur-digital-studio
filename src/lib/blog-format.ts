/** Rough reading time in minutes for a Markdown article body. */
export function readingTime(text: string): number {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
