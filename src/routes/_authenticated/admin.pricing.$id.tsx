import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Loader2, Plus, Tag, X } from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  getAdminPricingPlan,
  slugify,
  upsertPricingPlan,
  type BillingCycle,
  type PricingPlan,
} from "@/lib/pricing.functions";
import { SERVICE_ICON_KEYS, getServiceIcon } from "@/components/site/service-icons";
import { PLAN_COLORS, PricingCard } from "@/components/site/Pricing";

export const Route = createFileRoute("/_authenticated/admin/pricing/$id")({
  head: () => ({
    meta: [
      { title: "Pricing editor" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPricingEditor,
});

type Draft = {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  price: string;
  currency: string;
  billing_cycle: BillingCycle;
  badge: string;
  button_text: string;
  button_link: string;
  plan_color: string;
  icon: string;
  features: string[];
  limitations: string[];
  display_order: number;
  featured: boolean;
  published: boolean;
  seo_title: string;
  seo_description: string;
};

const EMPTY: Draft = {
  title: "",
  slug: "",
  short_description: "",
  price: "",
  currency: "INR",
  billing_cycle: "One Time",
  badge: "",
  button_text: "Get started",
  button_link: "/contact",
  plan_color: "",
  icon: "sparkles",
  features: [],
  limitations: [],
  display_order: 0,
  featured: false,
  published: false,
  seo_title: "",
  seo_description: "",
};

function fromRow(p: PricingPlan): Draft {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    short_description: p.short_description,
    price: p.price,
    currency: p.currency || "INR",
    billing_cycle: p.billing_cycle,
    badge: p.badge,
    button_text: p.button_text,
    button_link: p.button_link,
    plan_color: p.plan_color,
    icon: p.icon || "sparkles",
    features: Array.isArray(p.features) ? p.features : [],
    limitations: Array.isArray(p.limitations) ? p.limitations : [],
    display_order: p.display_order,
    featured: p.featured,
    published: p.published,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
  };
}

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-foreground/30";

function AdminPricingEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(getAdminPricingPlan);
  const save = useServerFn(upsertPricingPlan);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const existing = useQuery({
    queryKey: ["pricing-admin", id],
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
  const [limitInput, setLimitInput] = useState("");

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
          navigate({ to: "/admin/pricing/$id", params: { id: res.item.id }, replace: true });
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

  const previewPlan: PricingPlan = {
    id: draft.id ?? "preview",
    title: draft.title || "Plan name",
    slug: draft.slug,
    short_description: draft.short_description,
    price: draft.price,
    currency: draft.currency,
    billing_cycle: draft.billing_cycle,
    badge: draft.badge,
    button_text: draft.button_text,
    button_link: draft.button_link,
    plan_color: draft.plan_color,
    icon: draft.icon,
    features: draft.features,
    limitations: draft.limitations,
    display_order: draft.display_order,
    featured: draft.featured,
    published: draft.published,
    seo_title: draft.seo_title,
    seo_description: draft.seo_description,
    created_at: "",
    updated_at: "",
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link to="/admin/pricing" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Tag className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                {isNew ? "New plan" : "Edit plan"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Pricing
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
            <Field label="Plan title">
              <input
                value={draft.title}
                onChange={(e) => patchTitle(e.target.value)}
                placeholder="Growth"
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
                placeholder="growth"
                className={inputCls}
              />
            </Field>
            <Field label="Short description">
              <textarea
                value={draft.short_description}
                onChange={(e) => patch("short_description", e.target.value)}
                rows={3}
                placeholder="Who this plan is for…"
                className={inputCls}
              />
            </Field>
            <Field label="Badge">
              <input
                value={draft.badge}
                onChange={(e) => patch("badge", e.target.value)}
                placeholder="Most popular"
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Pricing">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price">
                <input
                  value={draft.price}
                  onChange={(e) => patch("price", e.target.value)}
                  placeholder="49,000"
                  className={inputCls}
                />
              </Field>
              <Field label="Currency">
                <select
                  value={draft.currency}
                  onChange={(e) => patch("currency", e.target.value)}
                  className={inputCls}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                </select>
              </Field>
              <Field label="Billing cycle">
                <select
                  value={draft.billing_cycle}
                  onChange={(e) => patch("billing_cycle", e.target.value as BillingCycle)}
                  className={inputCls}
                >
                  <option value="One Time">One Time</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </Field>
            </div>
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

          <Card title="Plan colour">
            <div className="flex flex-wrap gap-2">
              {PLAN_COLORS.map((c) => {
                const active = draft.plan_color === c.key;
                return (
                  <button
                    key={c.key || "brand"}
                    type="button"
                    onClick={() => patch("plan_color", c.key)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                      active ? "border-foreground bg-foreground text-white" : "border-border bg-white"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ background: c.value }}
                      aria-hidden
                    />
                    {c.label}
                  </button>
                );
              })}
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

          <Card title="Limitations">
            <TagEditor
              items={draft.limitations}
              value={limitInput}
              setValue={setLimitInput}
              onChange={(v) => patch("limitations", v)}
              placeholder="Add a limitation and press Enter"
              block
            />
          </Card>

          <Card title="Call to action">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button text">
                <input
                  value={draft.button_text}
                  onChange={(e) => patch("button_text", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Button link">
                <input
                  value={draft.button_link}
                  onChange={(e) => patch("button_link", e.target.value)}
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
            <PricingCard plan={previewPlan} />
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
