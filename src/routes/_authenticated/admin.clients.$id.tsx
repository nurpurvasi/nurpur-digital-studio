import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Building2, Check, Loader2 } from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  CLIENT_CATEGORIES,
  getAdminClient,
  slugify,
  upsertClient,
  type ClientBrand,
} from "@/lib/clients.functions";
import { MediaField } from "@/components/site/inline-editor/MediaField";
import { MediaGalleryField } from "@/components/admin/MediaGalleryField";
import { ClientLogo } from "@/components/site/Clients";

export const Route = createFileRoute("/_authenticated/admin/clients/$id")({
  head: () => ({
    meta: [
      { title: "Business editor" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminClientEditor,
});

type Draft = {
  id?: string;
  company_name: string;
  slug: string;
  logo: string;
  website: string;
  description: string;
  category: string;
  featured: boolean;
  display_order: number;
  published: boolean;
  seo_title: string;
  seo_description: string;
  phone: string;
  whatsapp: string;
  address: string;
  map_url: string;
  cover_image: string;
  instagram: string;
  facebook: string;
  youtube: string;
  opening_hours: string;
  gallery: string[];
};

const EMPTY: Draft = {
  company_name: "",
  slug: "",
  logo: "",
  website: "",
  description: "",
  category: "Business",
  featured: false,
  display_order: 0,
  published: false,
  seo_title: "",
  seo_description: "",
  phone: "",
  whatsapp: "",
  address: "",
  map_url: "",
  cover_image: "",
  instagram: "",
  facebook: "",
  youtube: "",
  opening_hours: "",
  gallery: [],
};

function fromRow(c: ClientBrand): Draft {
  return {
    id: c.id,
    company_name: c.company_name,
    slug: c.slug,
    logo: c.logo,
    website: c.website,
    description: c.description,
    category: c.category || "Business",
    featured: c.featured,
    display_order: c.display_order,
    published: c.published,
    seo_title: c.seo_title,
    seo_description: c.seo_description,
    phone: c.phone ?? "",
    whatsapp: c.whatsapp ?? "",
    address: c.address ?? "",
    map_url: c.map_url ?? "",
    cover_image: c.cover_image ?? "",
    instagram: c.instagram ?? "",
    facebook: c.facebook ?? "",
    youtube: c.youtube ?? "",
    opening_hours: c.opening_hours ?? "",
    gallery: Array.isArray(c.gallery) ? c.gallery.filter(Boolean) : [],
  };
}

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-foreground/30";

function AdminClientEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(getAdminClient);
  const save = useServerFn(upsertClient);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const existing = useQuery({
    queryKey: ["clients-admin", id],
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

  const patchName = (v: string) => {
    setDraft((d) => ({ ...d, company_name: v, slug: slugTouched ? d.slug : slugify(v) }));
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
          navigate({ to: "/admin/clients/$id", params: { id: res.item.id }, replace: true });
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
    if (!draft.company_name.trim()) {
      setError("Company name is required");
      return;
    }
    setError(null);
    saveMut.mutate(overrides);
  };

  const previewClient: ClientBrand = {
    id: draft.id ?? "preview",
    company_name: draft.company_name || "Company name",
    slug: draft.slug,
    logo: draft.logo,
    website: draft.website,
    description: draft.description,
    category: draft.category,
    featured: draft.featured,
    display_order: draft.display_order,
    published: draft.published,
    seo_title: draft.seo_title,
    seo_description: draft.seo_description,
    phone: draft.phone,
    whatsapp: draft.whatsapp,
    address: draft.address,
    map_url: draft.map_url,
    cover_image: draft.cover_image,
    instagram: draft.instagram,
    facebook: draft.facebook,
    youtube: draft.youtube,
    opening_hours: draft.opening_hours,
    gallery: draft.gallery,
    created_at: "",
    updated_at: "",
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link to="/admin/clients" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Building2 className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                {isNew ? "New business" : "Edit business"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Business Promotion
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
            <Field label="Company name">
              <input
                value={draft.company_name}
                onChange={(e) => patchName(e.target.value)}
                placeholder="Acme Hotels"
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
                placeholder="acme-hotels"
                className={inputCls}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select
                  value={draft.category}
                  onChange={(e) => patch("category", e.target.value)}
                  className={inputCls}
                >
                  {CLIENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Website URL">
                <input
                  value={draft.website}
                  onChange={(e) => patch("website", e.target.value)}
                  placeholder="https://example.com"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                value={draft.description}
                onChange={(e) => patch("description", e.target.value)}
                rows={4}
                placeholder="What this business offers in Nurpur…"
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Logo">
            <MediaField value={draft.logo} onChange={(v) => patch("logo", v)} accept="image" />
          </Card>

          <Card title="Cover image">
            <MediaField
              value={draft.cover_image}
              onChange={(v) => patch("cover_image", v)}
              accept="image"
            />
          </Card>

          <Card title="Photos & videos">
            <MediaGalleryField
              value={draft.gallery}
              onChange={(v) => patch("gallery", v)}
              onSetCover={(url) => patch("cover_image", url)}
            />
          </Card>

          <Card title="Contact & location">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <input
                  value={draft.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="+91 00000 00000"
                  className={inputCls}
                />
              </Field>
              <Field label="WhatsApp number">
                <input
                  value={draft.whatsapp}
                  onChange={(e) => patch("whatsapp", e.target.value)}
                  placeholder="+91 00000 00000"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Address">
              <textarea
                value={draft.address}
                onChange={(e) => patch("address", e.target.value)}
                rows={2}
                placeholder="Main Bazaar, Nurpur, Himachal Pradesh"
                className={inputCls}
              />
            </Field>
            <Field label="Google Maps URL">
              <input
                value={draft.map_url}
                onChange={(e) => patch("map_url", e.target.value)}
                placeholder="https://maps.google.com/…"
                className={inputCls}
              />
            </Field>
            <Field label="Opening hours">
              <textarea
                value={draft.opening_hours}
                onChange={(e) => patch("opening_hours", e.target.value)}
                rows={3}
                placeholder={"Mon–Sat: 9:00 AM – 8:00 PM\nSunday: Closed"}
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Social links">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram">
                <input
                  value={draft.instagram}
                  onChange={(e) => patch("instagram", e.target.value)}
                  placeholder="https://instagram.com/…"
                  className={inputCls}
                />
              </Field>
              <Field label="Facebook">
                <input
                  value={draft.facebook}
                  onChange={(e) => patch("facebook", e.target.value)}
                  placeholder="https://facebook.com/…"
                  className={inputCls}
                />
              </Field>
              <Field label="YouTube">
                <input
                  value={draft.youtube}
                  onChange={(e) => patch("youtube", e.target.value)}
                  placeholder="https://youtube.com/@…"
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
            <ClientLogo client={previewClient} showDescription />
          </Card>
        </aside>
      </main>
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
