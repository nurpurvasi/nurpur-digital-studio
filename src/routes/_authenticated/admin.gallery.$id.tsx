import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  getAdminGalleryItem,
  upsertGalleryItem,
  type GalleryItem,
} from "@/lib/gallery.functions";
import { MediaField } from "@/components/site/inline-editor/MediaField";
import { listAdminGalleries } from "@/lib/portal.functions";
import { slugify } from "@/lib/slug";

export const Route = createFileRoute("/_authenticated/admin/gallery/$id")({
  head: () => ({
    meta: [
      { title: "Gallery editor" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminGalleryEditor,
});

type Draft = {
  id?: string;
  slug: string;
  title: string;
  caption: string;
  location: string;
  gallery_id: string | null;
  description: string;
  category: string;
  media_type: "image" | "video";
  media_url: string;
  thumbnail: string;
  alt_text: string;
  featured: boolean;
  sort_order: number;
  status: "draft" | "published";
  publish_date: string | null;
  seo_title: string;
  seo_description: string;
};

const EMPTY: Draft = {
  slug: "",
  title: "",
  caption: "",
  location: "",
  gallery_id: null,
  description: "",
  category: "",
  media_type: "image",
  media_url: "",
  thumbnail: "",
  alt_text: "",
  featured: false,
  sort_order: 0,
  status: "draft",
  publish_date: null,
  seo_title: "",
  seo_description: "",
};

function fromRow(t: GalleryItem): Draft {
  return {
    id: t.id,
    slug: t.slug ?? "",
    title: t.title,
    caption: t.caption ?? "",
    location: t.location ?? "",
    gallery_id: t.gallery_id ?? null,
    description: t.description,
    category: t.category,
    media_type: t.media_type,
    media_url: t.media_url,
    thumbnail: t.thumbnail,
    alt_text: t.alt_text,
    featured: t.featured,
    sort_order: t.sort_order,
    status: t.status,
    publish_date: t.publish_date,
    seo_title: t.seo_title,
    seo_description: t.seo_description,
  };
}

function AdminGalleryEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(getAdminGalleryItem);
  const save = useServerFn(upsertGalleryItem);

  const loadGalleries = useServerFn(listAdminGalleries);
  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const galleries = useQuery({
    queryKey: ["admin-photo-galleries"],
    queryFn: () => loadGalleries(),
    enabled: !!admin.data?.isAdmin,
  });
  const existing = useQuery({
    queryKey: ["gallery-admin", id],
    queryFn: () => load({ data: { id } }),
    enabled: !isNew && !!admin.data?.isAdmin,
  });

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const initialized = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew && !initialized.current) {
      setDraft(EMPTY);
      initialized.current = true;
      return;
    }
    if (existing.data?.item && !initialized.current) {
      setDraft(fromRow(existing.data.item));
      initialized.current = true;
    }
  }, [existing.data, isNew]);

  const patch = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!dirty || isNew) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      setError(null);
      try {
        await save({ data: draft });
        setSavedAt(new Date());
        setDirty(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    }, 1200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, dirty, isNew, save]);

  const saveMut = useMutation({
    mutationFn: async (overrides?: Partial<Draft>) => {
      const payload = { ...draft, ...overrides };
      return save({ data: payload });
    },
    onSuccess: (res) => {
      if (res?.item) {
        setDraft(fromRow(res.item));
        setSavedAt(new Date());
        setDirty(false);
        if (isNew) {
          navigate({
            to: "/admin/gallery/$id",
            params: { id: res.item.id },
            replace: true,
          });
        }
      }
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Save failed"),
  });

  if (admin.isLoading)
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  if (!admin.data?.isAdmin)
    return <div className="grid min-h-screen place-items-center">Access denied</div>;
  if (!isNew && existing.isLoading)
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );

  const validate = () => {
    if (!draft.media_url.trim()) return "Media URL is required — upload an image or video";
    return null;
  };

  const handleSave = (overrides?: Partial<Draft>) => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    saveMut.mutate(overrides);
  };

  const previewSrc = draft.media_url;
  const previewThumb = draft.thumbnail || (draft.media_type === "image" ? draft.media_url : "");

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link to="/admin/gallery" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                {isNew ? "New gallery item" : "Edit gallery item"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Gallery
              </div>
            </div>
          </Link>
          <div className="ml-4 hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground md:flex">
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
              </>
            ) : savedAt ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" /> Saved{" "}
                {savedAt.toLocaleTimeString()}
              </>
            ) : (
              <>Not saved yet</>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => handleSave({ status: "draft" })}
              disabled={saveMut.isPending}
              className="rounded-full border border-border bg-white px-3 py-2 text-xs font-medium"
            >
              Save draft
            </button>
            <button
              onClick={() =>
                handleSave({
                  status: "published",
                  publish_date: draft.publish_date || new Date().toISOString(),
                })
              }
              disabled={saveMut.isPending}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              {saveMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Publish
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input
                value={draft.title}
                onChange={(e) => patch("title", e.target.value)}
                placeholder="Studio showcase"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base font-semibold outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label="Category">
              <input
                value={draft.category}
                onChange={(e) => patch("category", e.target.value)}
                placeholder="Branding, Web, Video…"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => patch("description", e.target.value)}
              rows={4}
              placeholder="Optional description"
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-foreground/40"
            />
          </Field>

          <Field label="Caption">
            <input
              value={draft.caption}
              onChange={(e) => patch("caption", e.target.value)}
              placeholder="Short caption shown under the photo"
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-foreground/40"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <input
                value={draft.location}
                onChange={(e) => patch("location", e.target.value)}
                placeholder="Nurpur Fort, Himachal Pradesh"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label="URL slug">
              <input
                value={draft.slug}
                onChange={(e) => patch("slug", slugify(e.target.value))}
                placeholder="auto-generated from the title"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
          </div>

          <Field label="Gallery / album">
            <select
              value={draft.gallery_id ?? ""}
              onChange={(e) => patch("gallery_id", e.target.value || null)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
            >
              <option value="">No gallery</option>
              {(galleries.data?.items ?? []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name || "Untitled gallery"}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Media type">
              <select
                value={draft.media_type}
                onChange={(e) => patch("media_type", e.target.value as "image" | "video")}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </Field>
            <Field label="Alt text">
              <input
                value={draft.alt_text}
                onChange={(e) => patch("alt_text", e.target.value)}
                placeholder="Describe the media for accessibility"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 text-sm font-medium">Media file</div>
            <MediaField
              value={draft.media_url}
              accept={draft.media_type === "video" ? "video" : "image"}
              onChange={(url) => patch("media_url", url)}
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-1 text-sm font-medium">Thumbnail</div>
            <p className="mb-3 text-xs text-muted-foreground">
              Optional. For videos, we strongly recommend a thumbnail image.
            </p>
            <MediaField
              value={draft.thumbnail}
              accept="image"
              onChange={(url) => patch("thumbnail", url)}
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-4 text-sm font-medium">Live preview</div>
            <figure className="overflow-hidden rounded-2xl border border-border bg-muted">
              <div className="relative aspect-[4/3] bg-black/5">
                {draft.media_type === "video" && previewSrc ? (
                  <video
                    key={previewSrc}
                    src={previewSrc}
                    poster={previewThumb || undefined}
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                  />
                ) : previewThumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewThumb}
                    alt={draft.alt_text}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
              {(draft.title || draft.category) && (
                <figcaption className="flex items-center justify-between gap-3 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{draft.title || "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {draft.category || "Uncategorised"}
                    </div>
                  </div>
                  <span className="rounded-full border border-border bg-white px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {draft.media_type}
                  </span>
                </figcaption>
              )}
            </figure>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 text-sm font-medium">Status & visibility</div>
            <div className="space-y-3">
              <label className="block text-xs text-muted-foreground">
                Status
                <select
                  value={draft.status}
                  onChange={(e) => patch("status", e.target.value as "draft" | "published")}
                  className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                Publish date
                <input
                  type="datetime-local"
                  value={
                    draft.publish_date
                      ? new Date(draft.publish_date).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    patch(
                      "publish_date",
                      e.target.value ? new Date(e.target.value).toISOString() : null,
                    )
                  }
                  className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => patch("featured", e.target.checked)}
                />
                Featured on homepage
              </label>
              <label className="block text-xs text-muted-foreground">
                Sort order
                <input
                  type="number"
                  value={draft.sort_order}
                  onChange={(e) =>
                    patch("sort_order", Number.parseInt(e.target.value || "0", 10) || 0)
                  }
                  className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-white p-5">
            <div className="text-sm font-medium">SEO</div>
            <Field label="SEO title">
              <input
                value={draft.seo_title}
                onChange={(e) => patch("seo_title", e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Meta description">
              <textarea
                value={draft.seo_description}
                onChange={(e) => patch("seo_description", e.target.value)}
                rows={3}
                className="w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}
