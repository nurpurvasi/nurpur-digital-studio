import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Loader2, Plus, Sparkles, X } from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  getAdminService,
  slugify,
  upsertService,
  type PricingType,
  type ServiceItem,
} from "@/lib/services.functions";
import { MediaField } from "@/components/site/inline-editor/MediaField";
import { SERVICE_ICON_KEYS, getServiceIcon } from "@/components/site/service-icons";

export const Route = createFileRoute("/_authenticated/admin/services/$id")({
  head: () => ({
    meta: [
      { title: "Service editor" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminServiceEditor,
});

type Draft = {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  icon: string;
  featured_image: string;
  gallery_images: string[];
  category: string;
  pricing_type: PricingType;
  price: string;
  duration: string;
  features: string[];
  technologies: string[];
  cta_text: string;
  cta_link: string;
  seo_title: string;
  seo_description: string;
  display_order: number;
  featured: boolean;
  published: boolean;
};

const EMPTY: Draft = {
  title: "",
  slug: "",
  short_description: "",
  full_description: "",
  icon: "sparkles",
  featured_image: "",
  gallery_images: [],
  category: "",
  pricing_type: "Custom Quote",
  price: "",
  duration: "",
  features: [],
  technologies: [],
  cta_text: "Get a free consultation",
  cta_link: "/contact",
  seo_title: "",
  seo_description: "",
  display_order: 0,
  featured: false,
  published: false,
};

function fromRow(s: ServiceItem): Draft {
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    short_description: s.short_description,
    full_description: s.full_description,
    icon: s.icon || "sparkles",
    featured_image: s.featured_image,
    gallery_images: Array.isArray(s.gallery_images) ? s.gallery_images : [],
    category: s.category,
    pricing_type: s.pricing_type,
    price: s.price,
    duration: s.duration,
    features: Array.isArray(s.features) ? s.features : [],
    technologies: Array.isArray(s.technologies) ? s.technologies : [],
    cta_text: s.cta_text,
    cta_link: s.cta_link,
    seo_title: s.seo_title,
    seo_description: s.seo_description,
    display_order: s.display_order,
    featured: s.featured,
    published: s.published,
  };
}

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-foreground/30";

function AdminServiceEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(getAdminService);
  const save = useServerFn(upsertService);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const existing = useQuery({
    queryKey: ["services-admin", id],
    queryFn: () => load({ data: { id } }),
    enabled: !isNew && !!admin.data?.isAdmin,
  });

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const initialized = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [galleryDraft, setGalleryDraft] = useState("");

  useEffect(() => {
    if (isNew && !initialized.current) {
      setDraft(EMPTY);
      initialized.current = true;
      return;
    }
    if (existing.data?.item && !initialized.current) {
      setDraft(fromRow(existing.data.item));
      setSlugTouched(true);
      initialized.current = true;
    }
  }, [existing.data, isNew]);

  const patch = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  const patchTitle = (v: string) => {
    setDraft((d) => ({ ...d, title: v, slug: slugTouched ? d.slug : slugify(v) }));
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
    mutationFn: async (overrides?: Partial<Draft>) => save({ data: { ...draft, ...overrides } }),
    onSuccess: (res) => {
      if (res?.item) {
        setDraft(fromRow(res.item));
        setSlugTouched(true);
        setSavedAt(new Date());
        setDirty(false);
        if (isNew) {
          navigate({ to: "/admin/services/$id", params: { id: res.item.id }, replace: true });
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

  const handleSave = (overrides?: Partial<Draft>) => {
    if (!draft.title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    saveMut.mutate(overrides);
  };

  const PreviewIcon = getServiceIcon(draft.icon);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link to="/admin/services" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                {isNew ? "New service" : "Edit service"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Services
              </div>
            </div>
          </Link>
          <div className="ml-4 hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground md:flex">
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
              </>
            ) : dirty ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Unsaved changes
              </>
            ) : savedAt ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" /> Saved
              </>
            ) : (
              <>Autosave on</>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => handleSave()}
              disabled={saveMut.isPending}
              className="rounded-full border border-border bg-white px-4 py-2 text-xs font-medium hover:-translate-y-0.5 hover:shadow-md"
            >
              Save draft
            </button>
            <button
              onClick={() => handleSave({ published: true })}
              disabled={saveMut.isPending}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              {saveMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {draft.published ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card title="Basics">
            <Field label="Title">
              <input
                value={draft.title}
                onChange={(e) => patchTitle(e.target.value)}
                placeholder="Website Design"
                className={inputCls}
              />
            </Field>
            <Field label="Slug">
              <input
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  patch("slug", slugify(e.target.value));
                }}
                placeholder="website-design"
                className={inputCls}
              />
            </Field>
            <Field label="Category">
              <input
                value={draft.category}
                onChange={(e) => patch("category", e.target.value)}
                placeholder="Design"
                className={inputCls}
              />
            </Field>
            <Field label="Short description">
              <textarea
                value={draft.short_description}
                onChange={(e) => patch("short_description", e.target.value)}
                rows={3}
                placeholder="One or two lines shown on cards…"
                className={inputCls}
              />
            </Field>
            <Field label="Full description">
              <textarea
                value={draft.full_description}
                onChange={(e) => patch("full_description", e.target.value)}
                rows={10}
                placeholder="Detailed description shown on the service page…"
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Icon">
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
              {SERVICE_ICON_KEYS.map((key) => {
                const Icon = getServiceIcon(key);
                const active = draft.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => patch("icon", key)}
                    title={key}
                    className={`grid aspect-square place-items-center rounded-xl border transition ${
                      active
                        ? "border-transparent text-white"
                        : "border-border bg-white hover:-translate-y-0.5"
                    }`}
                    style={active ? { background: "var(--gradient-brand)" } : undefined}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Media">
            <Field label="Featured image">
              <MediaField
                value={draft.featured_image}
                onChange={(v) => patch("featured_image", v)}
                accept="image"
              />
            </Field>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Gallery images
              </span>
              <div className="grid gap-3 sm:grid-cols-3">
                {draft.gallery_images.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <img src={src} alt="" className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        patch(
                          "gallery_images",
                          draft.gallery_images.filter((_, idx) => idx !== i),
                        )
                      }
                      className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-dashed border-border p-3">
                <MediaField
                  value={galleryDraft}
                  onChange={(v) => {
                    if (!v) {
                      setGalleryDraft("");
                      return;
                    }
                    patch("gallery_images", [...draft.gallery_images, v]);
                    setGalleryDraft("");
                  }}
                  accept="image"
                />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Upload or pick an image to append it to the gallery.
                </p>
              </div>
            </div>
          </Card>

          <Card title="Pricing">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Pricing type">
                <select
                  value={draft.pricing_type}
                  onChange={(e) => patch("pricing_type", e.target.value as PricingType)}
                  className={inputCls}
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Starting From">Starting From</option>
                  <option value="Custom Quote">Custom Quote</option>
                </select>
              </Field>
              <Field label="Price">
                <input
                  value={draft.price}
                  onChange={(e) => patch("price", e.target.value)}
                  placeholder="₹49,000"
                  className={inputCls}
                />
              </Field>
              <Field label="Duration">
                <input
                  value={draft.duration}
                  onChange={(e) => patch("duration", e.target.value)}
                  placeholder="3–4 weeks"
                  className={inputCls}
                />
              </Field>
            </div>
          </Card>

          <Card title="Features">
            <TagEditor
              items={draft.features}
              value={featureInput}
              setValue={setFeatureInput}
              onChange={(v) => patch("features", v)}
              placeholder="Add a feature and press Enter"
              block
            />
          </Card>

          <Card title="Technologies">
            <TagEditor
              items={draft.technologies}
              value={techInput}
              setValue={setTechInput}
              onChange={(v) => patch("technologies", v)}
              placeholder="Add a technology and press Enter"
            />
          </Card>

          <Card title="Call to action">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CTA text">
                <input
                  value={draft.cta_text}
                  onChange={(e) => patch("cta_text", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="CTA link">
                <input
                  value={draft.cta_link}
                  onChange={(e) => patch("cta_link", e.target.value)}
                  placeholder="/contact"
                  className={inputCls}
                />
              </Field>
            </div>
          </Card>

          <Card title="SEO">
            <Field label="SEO title">
              <input
                value={draft.seo_title}
                onChange={(e) => patch("seo_title", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="SEO description">
              <textarea
                value={draft.seo_description}
                onChange={(e) => patch("seo_description", e.target.value)}
                rows={3}
                className={inputCls}
              />
            </Field>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Publishing">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Published</span>
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => patch("published", e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Featured</span>
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => patch("featured", e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <Field label="Display order">
              <input
                type="number"
                value={draft.display_order}
                onChange={(e) => patch("display_order", Number(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}
          </Card>

          <Card title="Live preview">
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              {draft.featured_image && (
                <img src={draft.featured_image} alt="" className="h-32 w-full object-cover" />
              )}
              <div className="p-5">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-white"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <PreviewIcon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-base font-semibold">{draft.title || "Service title"}</div>
                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                  {draft.short_description || "Short description appears here."}
                </p>
                <div className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {draft.pricing_type}
                  {draft.price ? ` · ${draft.price}` : ""}
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function TagEditor({
  items,
  value,
  setValue,
  onChange,
  placeholder,
  block,
}: {
  items: string[];
  value: string;
  setValue: (v: string) => void;
  onChange: (v: string[]) => void;
  placeholder: string;
  block?: boolean;
}) {
  const add = () => {
    const v = value.trim();
    if (!v) return;
    onChange([...items, v]);
    setValue("");
  };
  return (
    <div className="space-y-3">
      <div className={block ? "space-y-2" : "flex flex-wrap gap-2"}>
        {items.map((it, i) => (
          <span
            key={`${it}-${i}`}
            className={`inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs ${
              block ? "w-full justify-between" : ""
            }`}
          >
            <span className="truncate">{it}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-muted-foreground hover:text-red-600"
              aria-label="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={inputCls}
        />
        <button
          type="button"
          onClick={add}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-white hover:-translate-y-0.5 hover:shadow"
          aria-label="Add"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
