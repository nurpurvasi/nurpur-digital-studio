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

export function normalizeMediaUrl(value: string): string {
  if (!value || value.startsWith(MEDIA_PREFIX)) return value;
  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/site-media\/(.+)$/);
    if (!match?.[1]) return value;
    return mediaUrlForPath(
      match[1]
        .split("/")
        .map((part) => decodeURIComponent(part))
        .join("/"),
    );
  } catch {
    return value;
  }
}

export function normalizeMediaDeep<T>(value: T): T {
  if (typeof value === "string") return normalizeMediaUrl(value) as T;
  if (Array.isArray(value)) return value.map((item) => normalizeMediaDeep(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeMediaDeep(item)]),
    ) as T;
  }
  return value;
}