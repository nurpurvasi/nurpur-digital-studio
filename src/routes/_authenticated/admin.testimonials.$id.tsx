import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Loader2, Sparkles, Star } from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  getAdminTestimonial,
  upsertTestimonial,
  type Testimonial,
} from "@/lib/testimonials.functions";
import { MediaField } from "@/components/site/inline-editor/MediaField";

export const Route = createFileRoute("/_authenticated/admin/testimonials/$id")({
  head: () => ({
    meta: [
      { title: "Testimonial editor" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminTestimonialEditor,
});

type Draft = {
  id?: string;
  client_name: string;
  company: string;
  designation: string;
  testimonial: string;
  rating: number;
  client_photo: string;
  company_logo: string;
  location: string;
  featured: boolean;
  sort_order: number;
  status: "draft" | "published";
  publish_date: string | null;
  seo_title: string;
  seo_description: string;
};

const EMPTY: Draft = {
  client_name: "",
  company: "",
  designation: "",
  testimonial: "",
  rating: 5,
  client_photo: "",
  company_logo: "",
  location: "",
  featured: false,
  sort_order: 0,
  status: "draft",
  publish_date: null,
  seo_title: "",
  seo_description: "",
};

function fromRow(t: Testimonial): Draft {
  return {
    id: t.id,
    client_name: t.client_name,
    company: t.company,
    designation: t.designation,
    testimonial: t.testimonial,
    rating: t.rating,
    client_photo: t.client_photo,
    company_logo: t.company_logo,
    location: t.location,
    featured: t.featured,
    sort_order: t.sort_order,
    status: t.status,
    publish_date: t.publish_date,
    seo_title: t.seo_title,
    seo_description: t.seo_description,
  };
}

function AdminTestimonialEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(getAdminTestimonial);
  const save = useServerFn(upsertTestimonial);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const existing = useQuery({
    queryKey: ["testimonial-admin", id],
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
    if (existing.data?.testimonial && !initialized.current) {
      setDraft(fromRow(existing.data.testimonial));
      initialized.current = true;
    }
  }, [existing.data, isNew]);

  const patch = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  // Autosave existing rows
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
      if (res?.testimonial) {
        setDraft(fromRow(res.testimonial));
        setSavedAt(new Date());
        setDirty(false);
        if (isNew) {
          navigate({
            to: "/admin/testimonials/$id",
            params: { id: res.testimonial.id },
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
    if (!draft.client_name.trim()) return "Client name is required";
    if (!draft.testimonial.trim()) return "Testimonial text is required";
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

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link to="/admin/testimonials" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                {isNew ? "New testimonial" : "Edit testimonial"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Testimonials
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
            <Field label="Client name">
              <input
                value={draft.client_name}
                onChange={(e) => patch("client_name", e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base font-semibold outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label="Designation">
              <input
                value={draft.designation}
                onChange={(e) => patch("designation", e.target.value)}
                placeholder="Founder & CEO"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label="Company">
              <input
                value={draft.company}
                onChange={(e) => patch("company", e.target.value)}
                placeholder="Acme Inc."
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label="Location">
              <input
                value={draft.location}
                onChange={(e) => patch("location", e.target.value)}
                placeholder="Mumbai, India"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
          </div>

          <Field label="Testimonial">
            <textarea
              value={draft.testimonial}
              onChange={(e) => patch("testimonial", e.target.value)}
              rows={8}
              placeholder="Write the client's kind words here…"
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-foreground/40"
            />
          </Field>

          <Field label="Rating">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => patch("rating", r)}
                  className="p-1"
                  aria-label={`${r} star${r > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      r <= draft.rating
                        ? "fill-[color:var(--royal)] text-[color:var(--royal)]"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs text-muted-foreground">{draft.rating}/5</span>
            </div>
          </Field>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-4 text-sm font-medium">Preview</div>
            <figure
              className="relative overflow-hidden rounded-3xl border border-border bg-white p-8"
              style={{
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.7) inset, 0 20px 40px -30px color-mix(in oklab, var(--navy) 25%, transparent)",
              }}
            >
              <div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl"
                style={{ background: "var(--gradient-brand)" }}
              />
              <div className="flex gap-1 text-[color:var(--royal)]">
                {Array.from({ length: draft.rating }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="relative mt-4 text-[15px] leading-relaxed text-foreground/90">
                "{draft.testimonial || "Your testimonial preview appears here."}"
              </blockquote>
              <figcaption className="relative mt-6 flex items-center gap-4 border-t border-border pt-5">
                {draft.client_photo ? (
                  <img
                    src={draft.client_photo}
                    alt={draft.client_name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <span
                    className="grid h-12 w-12 place-items-center rounded-full text-sm font-semibold text-white ring-2 ring-white"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {(draft.client_name || "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {draft.client_name || "Client name"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[draft.designation, draft.company].filter(Boolean).join(" · ") ||
                      "Designation · Company"}
                  </p>
                </div>
                {draft.company_logo && (
                  <img
                    src={draft.company_logo}
                    alt={draft.company}
                    className="h-8 max-w-[80px] object-contain opacity-80"
                  />
                )}
              </figcaption>
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
                  onChange={(e) =>
                    patch("status", e.target.value as "draft" | "published")
                  }
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

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 text-sm font-medium">Client photo</div>
            <MediaField
              value={draft.client_photo}
              accept="image"
              onChange={(url) => patch("client_photo", url)}
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 text-sm font-medium">Company logo</div>
            <MediaField
              value={draft.company_logo}
              accept="image"
              onChange={(url) => patch("company_logo", url)}
            />
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
