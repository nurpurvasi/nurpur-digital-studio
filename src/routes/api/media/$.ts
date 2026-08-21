import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rawPath = params._splat ?? "";
        let path: string;
        try {
          path = rawPath
            .split("/")
            .map((part) => decodeURIComponent(part))
            .join("/");
        } catch {
          return new Response("Invalid media path", { status: 400 });
        }
        if (!path || path.includes("..") || path.startsWith("/")) {
          return new Response("Invalid media path", { status: 400 });
        }

        const { downloadMedia } = await import("@/lib/media.server");
        const { data, error } = await downloadMedia(path);
        if (error || !data) return new Response("Media not found", { status: 404 });

        return new Response(data, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            // Media paths are content-addressed by upload name; safe to cache
            // at the edge while staying revalidatable for replacements.
            "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});