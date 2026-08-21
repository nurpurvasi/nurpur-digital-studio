import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { createMediaUploadUrl } from "@/lib/cms.functions";
import { createGalleryItems } from "@/lib/gallery.functions";
import { listAdminGalleries } from "@/lib/portal.functions";
import { supabase } from "@/integrations/supabase/client";

/**
 * Multi-file upload for photos/videos. Uses the canonical Media Library
 * pipeline (signed upload URL + site-media bucket) and then creates
 * gallery rows in one call.
 */
export function BulkPhotoUpload() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const getUploadUrl = useServerFn(createMediaUploadUrl);
  const createMany = useServerFn(createGalleryItems);
  const loadGalleries = useServerFn(listAdminGalleries);

  const galleries = useQuery({
    queryKey: ["admin-photo-galleries"],
    queryFn: () => loadGalleries(),
  });

  const [galleryId, setGalleryId] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  async function handleFiles(files: File[]) {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const uploaded: { title: string; media_url: string; media_type: "image" | "video" }[] = [];
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        const { path, token, signedUrl } = await getUploadUrl({
          data: { filename: file.name, contentType: file.type || "application/octet-stream" },
        });
        const { error: upErr } = await supabase.storage
          .from("site-media")
          .uploadToSignedUrl(path, token, file, { contentType: file.type });
        if (upErr) throw upErr;
        uploaded.push({
          title: file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
          media_url: signedUrl,
          media_type: file.type.startsWith("video") ? "video" : "image",
        });
      }
      setProgress("Saving…");
      const res = await createMany({
        data: {
          gallery_id: galleryId || null,
          category,
          location,
          status: publishNow ? "published" : "draft",
          items: uploaded,
        },
      });
      setDone(res.count);
      qc.invalidateQueries({ queryKey: ["gallery-admin"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div
      className="rounded-2xl border border-dashed border-border bg-white p-5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length) void handleFiles(files);
      }}
    >
      <div className="text-sm font-semibold">Upload multiple photos / videos</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Drag &amp; drop files here, or pick them below. Files go to the Media Library and become
        gallery items instantly.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-xs text-muted-foreground">
          Gallery / album
          <select
            value={galleryId}
            onChange={(e) => setGalleryId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">No gallery</option>
            {(galleries.data?.items ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name || "Untitled gallery"}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-muted-foreground">
          Category
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Mela, Temple, Nature"
            className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Location
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Nurpur, Himachal Pradesh"
            className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn-primary !px-4 !py-2 text-xs"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {busy ? progress || "Working…" : "Choose files"}
        </button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={publishNow}
            onChange={(e) => setPublishNow(e.target.checked)}
          />
          Publish immediately
        </label>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) void handleFiles(files);
          }}
        />
        {done !== null && (
          <span className="text-xs font-medium text-emerald-600">{done} item(s) added</span>
        )}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}
