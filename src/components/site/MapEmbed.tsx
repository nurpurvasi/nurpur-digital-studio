/**
 * Renders the Google Maps location saved in Site settings → Contact → "Google Maps embed URL".
 * Accepts a plain maps URL, an /maps/embed URL, or pasted <iframe …> code, and always
 * renders a sanitised, responsive iframe. Returns null when nothing usable is saved,
 * so the section stays hidden instead of showing an empty box.
 */
export function toMapEmbedSrc(raw: string): string {
  const value = (raw || "").trim();
  if (!value) return "";

  // Pasted iframe code — pull out the src only, never render the markup.
  const fromIframe = value.match(/src\s*=\s*["']([^"']+)["']/i);
  const candidate = fromIframe ? fromIframe[1] : value;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return "";
  }
  if (url.protocol !== "https:") return "";

  const host = url.hostname.toLowerCase();
  const allowed =
    host === "google.com" ||
    host.endsWith(".google.com") ||
    host === "maps.google.com" ||
    host === "goo.gl" ||
    host === "maps.app.goo.gl";
  if (!allowed) return "";

  // Already an embeddable URL.
  if (url.pathname.includes("/maps/embed") || url.searchParams.get("output") === "embed") {
    return url.toString();
  }

  // Short links can't be turned into an embed query — open-in-maps only.
  if (host === "goo.gl" || host === "maps.app.goo.gl") return "";

  // Normal maps link → embeddable query form.
  const place = url.pathname.match(/\/maps\/place\/([^/]+)/);
  const q =
    url.searchParams.get("q") || (place ? decodeURIComponent(place[1]).replace(/\+/g, " ") : "");
  const coords = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const query = q || (coords ? `${coords[1]},${coords[2]}` : "");
  if (!query) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function MapEmbed({
  value,
  title = "Location map",
  className = "",
}: {
  value: string;
  title?: string;
  className?: string;
}) {
  const src = toMapEmbedSrc(value);
  if (!src) return null;

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-border bg-muted ${className}`}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-popups"
        allowFullScreen
        className="block h-[260px] w-full border-0 sm:h-[340px]"
      />
    </div>
  );
}
