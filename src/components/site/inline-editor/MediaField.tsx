import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload, X } from "lucide-react";
import { createMediaUploadUrl } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";

export function MediaField({
  value,
  onChange,
  accept = "any",
}: {
  value: string;
  onChange: (v: string) => void;
  accept?: "image" | "video" | "any";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const getUploadUrl = useServerFn(createMediaUploadUrl);

  const acceptAttr =
    accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  async function handleFile(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const { path, token, signedUrl } = await getUploadUrl({
        data: { filename: file.name, contentType: file.type || "application/octet-stream" },
      });
      const { error } = await supabase.storage
        .from("site-media")
        .uploadToSignedUrl(path, token, file, { contentType: file.type });
      if (error) throw error;
      onChange(signedUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const isVideo = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(value);

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
          {isVideo ? (
            <video src={value} className="h-40 w-full object-cover" muted playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-40 w-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white transition hover:bg-black"
            aria-label="Remove media"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {value ? "Replace" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste a URL"
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-[color:var(--royal)]"
        />
      </div>
      {err ? <p className="text-[11px] text-red-600">{err}</p> : null}
    </div>
  );
}
