import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getAdminPost, upsertPost, type BlogPost } from "@/lib/blog.functions";
import { getIsAdmin } from "@/lib/cms.functions";
import { ArrowLeft, Loader2, Check, Sparkles, ExternalLink, Trash2 } from "lucide-react";
import { MediaField } from "@/components/site/inline-editor/MediaField";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({
  component: AdminBlogEditor,
});

type Draft = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  gallery: string[];
  category: string;
  tags: string[];
  author: string;
  status: "draft" | "published";
  publish_date: string | null;
  seo_title: string;
  seo_description: string;
  og_image: string;
  canonical_url: string;
};

const EMPTY: Draft = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  featured_image: "",
  gallery: [],
  category: "",
  tags: [],
  author: "",
  status: "draft",
  publish_date: null,
  seo_title: "",
  seo_description: "",
  og_image: "",
  canonical_url: "",
};

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160);
}

function fromPost(p: BlogPost): Draft {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    featured_image: p.featured_image,
    gallery: p.gallery || [],
    category: p.category,
    tags: p.tags || [],
    author: p.author,
    status: p.status,
    publish_date: p.publish_date,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    og_image: p.og_image,
    canonical_url: p.canonical_url,
  };
}

function AdminBlogEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(getAdminPost);
  const save = useServerFn(upsertPost);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const existing = useQuery({
    queryKey: ["blog-admin-post", id],
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
    if (existing.data?.post && !initialized.current) {
      setDraft(fromPost(existing.data.post));
      initialized.current = true;
    }
  }, [existing.data, isNew]);

  const patch = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  // Autosave (only for existing posts to avoid creating on empty)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!dirty || isNew || !draft.title || !draft.slug) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true); setError(null);
      try {
        await save({ data: draft });
        setSavedAt(new Date()); setDirty(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      } finally { setSaving(false); }
    }, 1200);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [draft, dirty, isNew, save]);

  const saveMut = useMutation({
    mutationFn: async (overrides?: Partial<Draft>) => {
      const payload = { ...draft, ...overrides };
      return save({ data: payload });
    },
    onSuccess: (res) => {
      if (res?.post) {
        setDraft(fromPost(res.post));
        setSavedAt(new Date()); setDirty(false);
        if (isNew) navigate({ to: "/_authenticated/admin/blog/$id", params: { id: res.post.id }, replace: true });
      }
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Save failed"),
  });

  if (admin.isLoading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!admin.data?.isAdmin) return <div className="grid min-h-screen place-items-center">Access denied</div>;
  if (!isNew && existing.isLoading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const validate = () => {
    if (!draft.title.trim()) return "Title is required";
    if (!draft.slug.trim()) return "Slug is required";
    return null;
  };

  const handleSave = (overrides?: Partial<Draft>) => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    saveMut.mutate(overrides);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-6">
          <Link to="/_authenticated/admin/blog" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">{isNew ? "New post" : "Edit post"}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Blog</div>
            </div>
          </Link>
          <div className="ml-4 hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground md:flex">
            {saving ? (<><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>) :
             dirty ? (<><span className="h-2 w-2 rounded-full bg-amber-500" /> Unsaved</>) :
             savedAt ? (<><Check className="h-3 w-3 text-emerald-600" /> Saved</>) :
             (<>All changes saved</>)}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/_authenticated/admin/blog" className="hidden items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium sm:inline-flex">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            {draft.slug && !isNew && draft.status === "published" && (
              <Link to="/blog/$slug" params={{ slug: draft.slug }} target="_blank" className="hidden items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium sm:inline-flex">
                <ExternalLink className="h-3 w-3" /> View
              </Link>
            )}
            <button
              onClick={() => handleSave({ status: "draft" })}
              disabled={saveMut.isPending}
              className="rounded-full border border-border bg-white px-3 py-2 text-xs font-medium"
            >
              Save draft
            </button>
            <button
              onClick={() => handleSave({ status: "published", publish_date: draft.publish_date || new Date().toISOString() })}
              disabled={saveMut.isPending}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              {saveMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Publish
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="space-y-5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Field label="Title">
            <input
              value={draft.title}
              onChange={(e) => {
                patch("title", e.target.value);
                if (!draft.slug || draft.slug === slugify(draft.title)) patch("slug", slugify(e.target.value));
              }}
              placeholder="A great post title"
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xl font-semibold outline-none focus:border-foreground/40"
            />
          </Field>
          <Field label="Slug">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">/blog/</span>
              <input
                value={draft.slug}
                onChange={(e) => patch("slug", slugify(e.target.value))}
                className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm outline-none focus:border-foreground/40"
              />
            </div>
          </Field>
          <Field label="Excerpt">
            <textarea
              value={draft.excerpt}
              onChange={(e) => patch("excerpt", e.target.value)}
              rows={2}
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-foreground/40"
            />
          </Field>
          <Field label="Content (Markdown)">
            <textarea
              value={draft.content}
              onChange={(e) => patch("content", e.target.value)}
              rows={20}
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-foreground/40"
              placeholder={"# Heading\n\nSupports **bold**, *italic*, [links](https://…), `code`, lists, and ``` code fences ```."}
            />
          </Field>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 text-sm font-medium">Gallery</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {draft.gallery.map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg border border-border">
                  <img src={src} alt="" className="aspect-video w-full object-cover" />
                  <button
                    onClick={() => patch("gallery", draft.gallery.filter((_, j) => j !== i))}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-600 shadow"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <MediaField
                value=""
                accept="image"
               
                onChange={(url) => { if (url) patch("gallery", [...draft.gallery, url]); }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 text-sm font-medium">Status & schedule</div>
            <div className="space-y-3">
              <label className="block text-xs text-muted-foreground">Status
                <select
                  value={draft.status}
                  onChange={(e) => patch("status", e.target.value as "draft" | "published")}
                  className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">Publish date
                <input
                  type="datetime-local"
                  value={draft.publish_date ? new Date(draft.publish_date).toISOString().slice(0, 16) : ""}
                  onChange={(e) => patch("publish_date", e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 text-sm font-medium">Featured image</div>
            <MediaField
              value={draft.featured_image}
              accept="image"
             
              onChange={(url) => patch("featured_image", url)}
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <Field label="Category">
              <input value={draft.category} onChange={(e) => patch("category", e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
            </Field>
            <Field label="Tags (comma separated)">
              <input
                value={draft.tags.join(", ")}
                onChange={(e) => patch("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Author">
              <input value={draft.author} onChange={(e) => patch("author", e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
            </Field>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <div className="text-sm font-medium">SEO</div>
            <Field label="SEO title">
              <input value={draft.seo_title} onChange={(e) => patch("seo_title", e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
            </Field>
            <Field label="Meta description">
              <textarea value={draft.seo_description} onChange={(e) => patch("seo_description", e.target.value)}
                rows={3}
                className="w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm" />
            </Field>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Open Graph image</div>
              <MediaField
                value={draft.og_image}
                accept="image"
               
                onChange={(url) => patch("og_image", url)}
              />
            </div>
            <Field label="Canonical URL">
              <input value={draft.canonical_url} onChange={(e) => patch("canonical_url", e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
            </Field>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
