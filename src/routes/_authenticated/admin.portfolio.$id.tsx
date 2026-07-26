import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Loader2, Sparkles, Trash2 } from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import { getAdminProject, upsertProject, type PortfolioProject } from "@/lib/portfolio.functions";
import { MediaField } from "@/components/site/inline-editor/MediaField";

export const Route = createFileRoute("/admin/portfolio/$id")({
  head: () => ({ meta: [{ title: "Portfolio editor" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPortfolioEditor,
});

type Draft = {
  id?: string;
  slug: string;
  title: string;
  client: string;
  category: string;
  short_description: string;
  full_description: string;
  cover_image: string;
  gallery: string[];
  technologies: string[];
  website_url: string;
  completion_date: string | null;
  featured: boolean;
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
  client: "",
  category: "",
  short_description: "",
  full_description: "",
  cover_image: "",
  gallery: [],
  technologies: [],
  website_url: "",
  completion_date: null,
  featured: false,
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

function fromProject(p: PortfolioProject): Draft {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    client: p.client,
    category: p.category,
    short_description: p.short_description,
    full_description: p.full_description,
    cover_image: p.cover_image,
    gallery: p.gallery || [],
    technologies: p.technologies || [],
    website_url: p.website_url,
    completion_date: p.completion_date,
    featured: p.featured,
    status: p.status,
    publish_date: p.publish_date,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    og_image: p.og_image,
    canonical_url: p.canonical_url,
  };
}

function AdminPortfolioEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(getAdminProject);
  const save = useServerFn(upsertProject);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const existing = useQuery({
    queryKey: ["portfolio-admin-project", id],
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
    if (existing.data?.project && !initialized.current) {
      setDraft(fromProject(existing.data.project));
      initialized.current = true;
    }
  }, [existing.data, isNew]);

  const patch = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  // Autosave existing projects
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
      if (res?.project) {
        setDraft(fromProject(res.project));
        setSavedAt(new Date()); setDirty(false);
        if (isNew)
          navigate({
            to: "/admin/portfolio/$id",
            params: { id: res.project.id },
            replace: true,
          });
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
          <Link to="/admin/portfolio" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">{isNew ? "New project" : "Edit project"}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Portfolio</div>
            </div>
          </Link>
          <div className="ml-4 hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground md:flex">
            {saving ? (<><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>) :
             savedAt ? (<><Check className="h-3 w-3 text-emerald-600" /> Saved {savedAt.toLocaleTimeString()}</>) :
             (<>Not saved yet</>)}
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
        <div className="space-y-5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Field label="Project title">
            <input
              value={draft.title}
              onChange={(e) => {
                patch("title", e.target.value);
                if (!draft.slug || draft.slug === slugify(draft.title)) patch("slug", slugify(e.target.value));
              }}
              placeholder="A great project title"
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xl font-semibold outline-none focus:border-foreground/40"
            />
          </Field>
          <Field label="Slug">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">/portfolio/</span>
              <input
                value={draft.slug}
                onChange={(e) => patch("slug", slugify(e.target.value))}
                className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm outline-none focus:border-foreground/40"
              />
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client name">
              <input value={draft.client} onChange={(e) => patch("client", e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm" />
            </Field>
            <Field label="Category">
              <input value={draft.category} onChange={(e) => patch("category", e.target.value)}
                placeholder="e.g. Web, Brand, Product"
                className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm" />
            </Field>
          </div>
          <Field label="Short description">
            <textarea value={draft.short_description} onChange={(e) => patch("short_description", e.target.value)}
              rows={2}
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm" />
          </Field>
          <Field label="Full description (Markdown)">
            <textarea value={draft.full_description} onChange={(e) => patch("full_description", e.target.value)}
              rows={16}
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 font-mono text-sm leading-relaxed"
              placeholder={"# Overview\n\nDescribe the goals, process and results…"} />
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
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => patch("featured", e.target.checked)}
                />
                Featured project
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 text-sm font-medium">Cover image</div>
            <MediaField value={draft.cover_image} accept="image" onChange={(url) => patch("cover_image", url)} />
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <Field label="Website URL">
              <input value={draft.website_url} onChange={(e) => patch("website_url", e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" />
            </Field>
            <Field label="Completion date">
              <input
                type="date"
                value={draft.completion_date ?? ""}
                onChange={(e) => patch("completion_date", e.target.value || null)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Technologies (comma separated)">
              <input
                value={draft.technologies.join(", ")}
                onChange={(e) => patch("technologies", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
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
              <MediaField value={draft.og_image} accept="image" onChange={(url) => patch("og_image", url)} />
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
