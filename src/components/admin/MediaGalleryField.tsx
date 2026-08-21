import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { GripVertical, Loader2, Star, Upload, X } from "lucide-react";
import { createMediaUploadUrl } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import { normalizeMediaUrl } from "@/lib/media-url";

/**
 * Multi-media gallery field. Uses the canonical Media Library upload pipeline
 * (signed upload URL + site-media bucket) — no second storage system.
 */
export function MediaGalleryField({
  value,
  onChange,
  onSetCover,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  onSetCover?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const getUploadUrl = useServerFn(createMediaUploadUrl);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const items = Array.isArray(value) ? value.filter(Boolean) : [];

  async function handleFiles(files: FileList) {
    setBusy(true);
    setErr(null);
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const { path, token, signedUrl } = await getUploadUrl({
          data: { filename: file.name, contentType: file.type || "application/octet-stream" },
        });
        const { error } = await supabase.storage
          .from("site-media")
          .uploadToSignedUrl(path, token, file, { contentType: file.type });
        if (error) throw error;
        added.push(signedUrl);
      }
      if (added.length) onChange([...items, ...added]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it!);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((url, i) => {
            const src = normalizeMediaUrl(url);
            const isVideo = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(src);
            return (
              <li
                key={`${url}-${i}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) move(dragIndex, i);
                  setDragIndex(null);
                }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-muted"
              >
                {isVideo ? (
                  <video src={src} muted playsInline className="h-28 w-full object-cover" />
                ) : (
                  <img src={src} alt="" loading="lazy" className="h-28 w-full object-cover" />
                )}
                <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
                  <GripVertical className="h-3.5 w-3.5" />
                </span>
                <div className="absolute right-1.5 top-1.5 flex gap-1">
                  {onSetCover && !isVideo && (
                    <button
                      type="button"
                      aria-label="Set as cover image"
                      title="Set as cover"
                      onClick={() => onSetCover(url)}
                      className="grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
                    >
                      <Star className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Remove media"
                    onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                    className="grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Move earlier"
                    onClick={() => move(i, i - 1)}
                    className="rounded-full bg-black/60 px-2 text-xs text-white hover:bg-black"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Move later"
                    onClick={() => move(i, i + 1)}
                    className="rounded-full bg-black/60 px-2 text-xs text-white hover:bg-black"
                  >
                    →
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-accent disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload photos or videos
        </button>
        <span className="text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"} · drag to reorder
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
          }}
        />
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

export default MediaGalleryField;
