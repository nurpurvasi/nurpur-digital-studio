import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMediaUploadUrl,
  discardDraft,
  getDraftContent,
  getIsAdmin,
  publishDraft,
  saveDraft,
} from "@/lib/cms.functions";
import { defaultSiteContent, mergeSiteContent, type SiteContent } from "@/content/site";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowUpFromLine,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — NurpurVasi Digitals" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type Section =
  | "brand"
  | "seo"
  | "hero"
  | "contact"
  | "services"
  | "portfolio"
  | "testimonials"
  | "stats"
  | "faqs"
  | "footer";

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "brand", label: "Brand", icon: Sparkles },
  { id: "hero", label: "Hero", icon: Star },
  { id: "services", label: "Services", icon: Palette },
  { id: "portfolio", label: "Portfolio", icon: ImageIcon },
  { id: "testimonials", label: "Testimonials", icon: Users },
  { id: "stats", label: "Statistics", icon: ArrowUpFromLine },
  { id: "faqs", label: "FAQ", icon: ChevronDown },
  { id: "contact", label: "Contact & Social", icon: Users },
  { id: "seo", label: "SEO & Meta", icon: Search },
  { id: "footer", label: "Footer", icon: Sparkles },
];

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const loadDraft = useServerFn(getDraftContent);
  const saveDraftFn = useServerFn(saveDraft);
  const publishFn = useServerFn(publishDraft);
  const discardFn = useServerFn(discardDraft);

  const adminCheck = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const draftQuery = useQuery({
    queryKey: ["cms-draft"],
    queryFn: () => loadDraft(),
    enabled: !!adminCheck.data?.isAdmin,
  });

  // Local editable state — merged over defaults for a stable UI
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [section, setSection] = useState<Section>("brand");
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (draftQuery.data && !initialized.current) {
      setContent(mergeSiteContent(draftQuery.data.draft as Partial<SiteContent>));
      initialized.current = true;
    }
  }, [draftQuery.data]);

  // Autosave debounce
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveDraftFn({ data: { draft: content as unknown as import("@/integrations/supabase/types").Json } });
        setSavedAt(new Date());
        setDirty(false);
      } finally {
        setSaving(false);
      }
    }, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, dirty, saveDraftFn]);

  const patch = (updater: (c: SiteContent) => SiteContent) => {
    setContent(updater);
    setDirty(true);
  };

  const publishMut = useMutation({
    mutationFn: async () => {
      // Ensure latest draft saved first
      if (dirty) {
        await saveDraftFn({ data: { draft: content as unknown as import("@/integrations/supabase/types").Json } });
        setDirty(false);
      }
      await publishFn();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-content"] });
      setSavedAt(new Date());
    },
  });

  const discardMut = useMutation({
    mutationFn: () => discardFn(),
    onSuccess: async () => {
      const fresh = await loadDraft();
      setContent(mergeSiteContent(fresh.draft as Partial<SiteContent>));
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["cms-draft"] });
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (adminCheck.isLoading) return <FullScreenLoader label="Verifying access…" />;
  if (!adminCheck.data?.isAdmin) return <NotAdmin onSignOut={signOut} />;
  if (draftQuery.isLoading) return <FullScreenLoader label="Loading content…" />;

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Content Studio</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">NurpurVasi Digitals</div>
            </div>
          </Link>
          <div className="ml-4 hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground md:flex">
            {saving ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
            ) : dirty ? (
              <><span className="h-2 w-2 rounded-full bg-amber-500" /> Unsaved changes</>
            ) : savedAt ? (
              <><Check className="h-3 w-3 text-emerald-600" /> Saved {formatTime(savedAt)}</>
            ) : (
              <>All changes saved</>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className="hidden items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium hover:-translate-y-0.5 hover:shadow-md sm:inline-flex">
              <Eye className="h-3 w-3" /> View site
            </Link>
            <button
              onClick={() => discardMut.mutate()}
              disabled={discardMut.isPending}
              className="hidden items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
            >
              <RotateCcw className="h-3 w-3" /> Discard
            </button>
            <button
              onClick={() => publishMut.mutate()}
              disabled={publishMut.isPending}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              {publishMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
              Publish
            </button>
            <button onClick={signOut} title="Sign out" className="rounded-full border border-border bg-white p-2 hover:-translate-y-0.5 hover:shadow-md">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="h-fit rounded-3xl border border-border bg-white p-2 lg:sticky lg:top-24">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition ${
                  section === s.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <s.icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor panel */}
        <main className="rounded-3xl border border-border bg-white p-6 md:p-8">
          {publishMut.isSuccess && !publishMut.isPending && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800">
              Published successfully — live site updated.
            </div>
          )}
          {section === "brand" && <BrandEditor content={content} patch={patch} />}
          {section === "hero" && <HeroEditor content={content} patch={patch} />}
          {section === "services" && <ServicesEditor content={content} patch={patch} />}
          {section === "portfolio" && <PortfolioEditor content={content} patch={patch} />}
          {section === "testimonials" && <TestimonialsEditor content={content} patch={patch} />}
          {section === "stats" && <StatsEditor content={content} patch={patch} />}
          {section === "faqs" && <FAQEditor content={content} patch={patch} />}
          {section === "contact" && <ContactEditor content={content} patch={patch} />}
          {section === "seo" && <SEOEditor content={content} patch={patch} />}
          {section === "footer" && <FooterEditor content={content} patch={patch} />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Shared inputs ---------------- */

type Patch = (updater: (c: SiteContent) => SiteContent) => void;
type EditorProps = { content: SiteContent; patch: Patch };

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-ring ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-ring ${props.className ?? ""}`}
    />
  );
}

function SectionHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function MediaUploader({
  value,
  onChange,
  accept = "image/*",
  label = "Upload image",
}: {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const createUpload = useServerFn(createMediaUploadUrl);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const { path, token, publicUrl } = await createUpload({
        data: { filename: file.name, contentType: file.type || "application/octet-stream" },
      });
      const { error } = await supabase.storage
        .from("site-media")
        .uploadToSignedUrl(path, token, file, { contentType: file.type });
      if (error) throw error;
      onChange(publicUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
          <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-muted-foreground">{value}</div>
            <div className="mt-1 flex gap-2">
              <button onClick={() => inputRef.current?.click()} className="text-xs font-medium text-primary hover:underline">Replace</button>
              <button onClick={() => onChange("")} className="text-xs font-medium text-red-600 hover:underline">Remove</button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background/50 px-4 py-6 text-xs text-muted-foreground transition hover:border-ring hover:bg-background"
          disabled={busy}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
          {busy ? "Uploading…" : label}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="text-[10px] text-muted-foreground/70">Or paste URL:</div>
      <TextInput value={value ?? ""} placeholder="https://…" onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ListReorder<T>({
  items,
  onChange,
  renderItem,
  emptyLabel,
  onAdd,
  addLabel,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  renderItem: (item: T, i: number, update: (patch: Partial<T>) => void) => ReactNode;
  emptyLabel: string;
  onAdd: () => void;
  addLabel: string;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => {
    if (!confirm("Delete this item?")) return;
    onChange(items.filter((_, k) => k !== i));
  };
  const update = (i: number, p: Partial<T>) => {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-background/50 p-8 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        items.map((it, i) => (
          <div key={i} className="group rounded-2xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(i)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {renderItem(it, i, (p) => update(i, p))}
          </div>
        ))
      )}
      <button onClick={onAdd} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/50 py-3 text-sm font-medium text-muted-foreground transition hover:border-ring hover:text-foreground">
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}

/* ---------------- Editors ---------------- */

function BrandEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="Brand identity" desc="Name, initials, logo, and tagline shown across the site." />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Brand name">
          <TextInput value={content.brand.name} onChange={(e) => patch((c) => ({ ...c, brand: { ...c.brand, name: e.target.value } }))} />
        </Field>
        <Field label="Initial" hint="Shown in the logo mark">
          <TextInput maxLength={2} value={content.brand.initial} onChange={(e) => patch((c) => ({ ...c, brand: { ...c.brand, initial: e.target.value } }))} />
        </Field>
        <Field label="Tagline">
          <TextInput value={content.brand.tagline} onChange={(e) => patch((c) => ({ ...c, brand: { ...c.brand, tagline: e.target.value } }))} />
        </Field>
        <div />
        <div className="md:col-span-2">
          <Field label="Logo image" hint="PNG or SVG on transparent background">
            <MediaUploader value={content.brand.logo} onChange={(url) => patch((c) => ({ ...c, brand: { ...c.brand, logo: url } }))} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function HeroEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="Hero section" desc="The cinematic first impression on your homepage." />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Eyebrow">
          <TextInput value={content.hero.eyebrow} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, eyebrow: e.target.value } }))} />
        </Field>
        <div />
        <div className="md:col-span-2">
          <Field label="Headline">
            <TextArea rows={2} value={content.hero.headline} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, headline: e.target.value } }))} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Subheading">
            <TextArea rows={3} value={content.hero.subheading} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, subheading: e.target.value } }))} />
          </Field>
        </div>
        <Field label="Primary CTA label">
          <TextInput value={content.hero.primaryCta.label} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, primaryCta: { ...c.hero.primaryCta, label: e.target.value } } }))} />
        </Field>
        <Field label="Primary CTA link">
          <TextInput value={content.hero.primaryCta.href} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, primaryCta: { ...c.hero.primaryCta, href: e.target.value } } }))} />
        </Field>
        <Field label="Secondary CTA label">
          <TextInput value={content.hero.secondaryCta.label} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, secondaryCta: { ...c.hero.secondaryCta, label: e.target.value } } }))} />
        </Field>
        <Field label="Secondary CTA link">
          <TextInput value={content.hero.secondaryCta.href} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, secondaryCta: { ...c.hero.secondaryCta, href: e.target.value } } }))} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Hero image / video URL">
            <MediaUploader
              value={content.hero.media.src}
              onChange={(url) => patch((c) => ({ ...c, hero: { ...c.hero, media: { ...c.hero.media, src: url } } }))}
              accept="image/*,video/*"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function ServicesEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="Services" desc="Cards showcased on the homepage and services page." />
      <ListReorder
        items={content.services}
        emptyLabel="No services yet. Add your first offering."
        addLabel="Add service"
        onAdd={() => patch((c) => ({ ...c, services: [...c.services, { title: "New service", desc: "", icon: "Palette", tag: "" }] }))}
        onChange={(next) => patch((c) => ({ ...c, services: next }))}
        renderItem={(s, _i, u) => (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Title"><TextInput value={s.title} onChange={(e) => u({ title: e.target.value })} /></Field>
            <Field label="Icon name" hint="lucide icon"><TextInput value={s.icon ?? ""} onChange={(e) => u({ icon: e.target.value })} placeholder="Palette" /></Field>
            <div className="md:col-span-2"><Field label="Description"><TextArea rows={2} value={s.desc} onChange={(e) => u({ desc: e.target.value })} /></Field></div>
            <Field label="Tag"><TextInput value={s.tag ?? ""} onChange={(e) => u({ tag: e.target.value })} placeholder="e.g. Design" /></Field>
          </div>
        )}
      />
    </div>
  );
}

function PortfolioEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="Portfolio" desc="Featured projects with images and links." />
      <ListReorder
        items={content.portfolio}
        emptyLabel="No projects yet. Add your first case study."
        addLabel="Add project"
        onAdd={() => patch((c) => ({ ...c, portfolio: [...c.portfolio, { title: "New project", tag: "Web", year: String(new Date().getFullYear()), image: "", href: "" }] }))}
        onChange={(next) => patch((c) => ({ ...c, portfolio: next }))}
        renderItem={(p, _i, u) => (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
              <Field label="Title"><TextInput value={p.title} onChange={(e) => u({ title: e.target.value })} /></Field>
              <Field label="Category"><TextInput value={p.tag} onChange={(e) => u({ tag: e.target.value })} /></Field>
              <Field label="Year"><TextInput value={p.year} onChange={(e) => u({ year: e.target.value })} /></Field>
              <Field label="Link"><TextInput value={p.href ?? ""} onChange={(e) => u({ href: e.target.value })} placeholder="https://…" /></Field>
            </div>
            <Field label="Cover image"><MediaUploader value={p.image} onChange={(url) => u({ image: url } as Partial<typeof p>)} /></Field>
          </div>
        )}
      />
    </div>
  );
}

function TestimonialsEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="Testimonials" desc="Real quotes from your happy clients." />
      <ListReorder
        items={content.testimonials}
        emptyLabel="No testimonials yet."
        addLabel="Add testimonial"
        onAdd={() => patch((c) => ({ ...c, testimonials: [...c.testimonials, { quote: "", name: "", role: "", avatar: "" }] }))}
        onChange={(next) => patch((c) => ({ ...c, testimonials: next }))}
        renderItem={(t, _i, u) => (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2 grid gap-3">
              <Field label="Quote"><TextArea rows={3} value={t.quote} onChange={(e) => u({ quote: e.target.value })} /></Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Name"><TextInput value={t.name} onChange={(e) => u({ name: e.target.value })} /></Field>
                <Field label="Role / Company"><TextInput value={t.role} onChange={(e) => u({ role: e.target.value })} /></Field>
              </div>
            </div>
            <Field label="Avatar"><MediaUploader value={t.avatar} onChange={(url) => u({ avatar: url } as Partial<typeof t>)} /></Field>
          </div>
        )}
      />
    </div>
  );
}

function StatsEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="Statistics" desc="Numbers that animate on scroll." />
      <ListReorder
        items={content.stats}
        emptyLabel="No stats yet."
        addLabel="Add statistic"
        onAdd={() => patch((c) => ({ ...c, stats: [...c.stats, { value: 100, suffix: "+", label: "Metric" }] }))}
        onChange={(next) => patch((c) => ({ ...c, stats: next }))}
        renderItem={(s, _i, u) => (
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Value"><TextInput type="number" value={s.value} onChange={(e) => u({ value: Number(e.target.value) || 0 })} /></Field>
            <Field label="Suffix"><TextInput value={s.suffix ?? ""} onChange={(e) => u({ suffix: e.target.value })} placeholder="+ / %" /></Field>
            <Field label="Label"><TextInput value={s.label} onChange={(e) => u({ label: e.target.value })} /></Field>
          </div>
        )}
      />
    </div>
  );
}

function FAQEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="Frequently asked questions" />
      <ListReorder
        items={content.faqs}
        emptyLabel="No FAQs yet."
        addLabel="Add FAQ"
        onAdd={() => patch((c) => ({ ...c, faqs: [...c.faqs, { q: "", a: "" }] }))}
        onChange={(next) => patch((c) => ({ ...c, faqs: next }))}
        renderItem={(f, _i, u) => (
          <div className="grid gap-3">
            <Field label="Question"><TextInput value={f.q} onChange={(e) => u({ q: e.target.value })} /></Field>
            <Field label="Answer"><TextArea rows={3} value={f.a} onChange={(e) => u({ a: e.target.value })} /></Field>
          </div>
        )}
      />
    </div>
  );
}

function ContactEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="Contact & social" desc="How visitors can reach you and where they can find you." />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Email"><TextInput type="email" value={content.contact.email} onChange={(e) => patch((c) => ({ ...c, contact: { ...c.contact, email: e.target.value } }))} /></Field>
        <Field label="Phone (dial format)" hint="Used for click-to-call"><TextInput value={content.contact.phone} onChange={(e) => patch((c) => ({ ...c, contact: { ...c.contact, phone: e.target.value } }))} placeholder="+919999999999" /></Field>
        <Field label="Phone (display)"><TextInput value={content.contact.phoneDisplay} onChange={(e) => patch((c) => ({ ...c, contact: { ...c.contact, phoneDisplay: e.target.value } }))} placeholder="+91 99999 99999" /></Field>
        <Field label="WhatsApp (dial format)"><TextInput value={content.contact.whatsapp} onChange={(e) => patch((c) => ({ ...c, contact: { ...c.contact, whatsapp: e.target.value } }))} /></Field>
        <div className="md:col-span-2"><Field label="Location"><TextInput value={content.contact.location} onChange={(e) => patch((c) => ({ ...c, contact: { ...c.contact, location: e.target.value } }))} /></Field></div>
        <Field label="Response time"><TextInput value={content.contact.responseTime} onChange={(e) => patch((c) => ({ ...c, contact: { ...c.contact, responseTime: e.target.value } }))} /></Field>
        <Field label="Google Maps embed URL"><TextInput value={content.contact.mapEmbed} onChange={(e) => patch((c) => ({ ...c, contact: { ...c.contact, mapEmbed: e.target.value } }))} placeholder="https://www.google.com/maps/embed?…" /></Field>
        <div className="md:col-span-2 mt-2 border-t border-border pt-5">
          <h3 className="mb-4 text-sm font-semibold">Social links</h3>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Instagram"><TextInput value={content.socials.instagram} onChange={(e) => patch((c) => ({ ...c, socials: { ...c.socials, instagram: e.target.value } }))} /></Field>
            <Field label="Facebook"><TextInput value={content.socials.facebook} onChange={(e) => patch((c) => ({ ...c, socials: { ...c.socials, facebook: e.target.value } }))} /></Field>
            <Field label="YouTube"><TextInput value={content.socials.youtube} onChange={(e) => patch((c) => ({ ...c, socials: { ...c.socials, youtube: e.target.value } }))} /></Field>
            <Field label="Email link"><TextInput value={content.socials.email} onChange={(e) => patch((c) => ({ ...c, socials: { ...c.socials, email: e.target.value } }))} placeholder="mailto:hello@…" /></Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function SEOEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="SEO & analytics" desc="Meta tags, Open Graph, and tracking codes." />
      <div className="grid gap-5">
        <Field label="Meta title" hint="< 60 characters"><TextInput value={content.seo.title} onChange={(e) => patch((c) => ({ ...c, seo: { ...c.seo, title: e.target.value } }))} /></Field>
        <Field label="Meta description" hint="< 160 characters"><TextArea rows={3} value={content.seo.description} onChange={(e) => patch((c) => ({ ...c, seo: { ...c.seo, description: e.target.value } }))} /></Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Open Graph image"><MediaUploader value={content.seo.ogImage} onChange={(url) => patch((c) => ({ ...c, seo: { ...c.seo, ogImage: url } }))} /></Field>
          <Field label="Favicon"><MediaUploader value={content.seo.favicon} onChange={(url) => patch((c) => ({ ...c, seo: { ...c.seo, favicon: url } }))} accept="image/*" /></Field>
        </div>
        <Field label="Google Analytics / GTM snippet" hint="Full <script> tag"><TextArea rows={4} value={content.seo.analyticsCode} onChange={(e) => patch((c) => ({ ...c, seo: { ...c.seo, analyticsCode: e.target.value } }))} /></Field>
        <Field label="Google Search Console verification"><TextInput value={content.seo.gscVerification} onChange={(e) => patch((c) => ({ ...c, seo: { ...c.seo, gscVerification: e.target.value } }))} placeholder="google-site-verification=…" /></Field>
      </div>
    </div>
  );
}

function FooterEditor({ content, patch }: EditorProps) {
  return (
    <div>
      <SectionHeader title="Footer" />
      <div className="grid gap-5">
        <Field label="Copyright" hint="Use {year} for current year"><TextInput value={content.footer.copyright} onChange={(e) => patch((c) => ({ ...c, footer: { ...c.footer, copyright: e.target.value } }))} /></Field>
        <Field label="Footer tagline"><TextInput value={content.footer.tagline} onChange={(e) => patch((c) => ({ ...c, footer: { ...c.footer, tagline: e.target.value } }))} /></Field>
      </div>
    </div>
  );
}

/* ---------------- Guards ---------------- */

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </div>
    </div>
  );
}

function NotAdmin({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-3xl border border-border bg-white p-8 text-center">
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is signed in but does not have admin permissions.
        </p>
        <button onClick={onSignOut} className="btn-primary mt-6">Sign out</button>
      </div>
    </div>
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
