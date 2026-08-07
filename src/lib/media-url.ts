const MEDIA_PREFIX = "/api/media/";

export function mediaUrlForPath(path: string): string {
  const encoded = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${MEDIA_PREFIX}${encoded}`;
}

export function mediaPathFromUrl(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, "http://local.invalid");
    if (!url.pathname.startsWith(MEDIA_PREFIX)) return null;
    return url.pathname
      .slice(MEDIA_PREFIX.length)
      .split("/")
      .map((part) => decodeURIComponent(part))
      .join("/");
  } catch {
    return null;
  }
}