import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Bold,
  Check,
  HelpCircle,
  ImagePlus,
  Italic,
  Link2,
  List,
  Loader2,
} from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  FAQ_CATEGORIES,
  getAdminFaq,
  upsertFaq,
  type Faq,
} from "@/lib/faqs.functions";
import { MediaField } from "@/components/site/inline-editor/MediaField";
import { FaqRichText } from "@/components/site/Faqs";

export const Route = createFileRoute("/_authenticated/admin/faqs/$id")({
  head: () => ({
    meta: [
      { title: "FAQ editor" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminFaqEditor,
});

type Draft = {
  id?: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  featured: boolean;
  published: boolean;
  seo_title: string;
  seo_description: string;
};

const EMPTY: Draft = {
  question: "",
  answer: "",
  category: "Business",
  display_order: 0,
  featured: false,
  published: false,
  seo_title: "",
  seo_description: "",
};

function fromRow(f: Faq): Draft {
  return {
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category || "Business",
    display_order: f.display_order,
    featured: f.featured,
    published: f.published,
    seo_title: f.seo_title,
    seo_description: f.seo_description,
  };
}

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-foreground/30";

function AdminFaqEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(getAdminFaq);
  const save = useServerFn(upsertFaq);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const existing = useQuery({
    queryKey: ["faqs-admin", id],
    queryFn: () => load({ data: { id } }),
    enabled: !isNew && !!admin.data?.isAdmin,
  });

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const initialized = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const [mediaOpen, setMediaOpen] = useState(false);

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
    mutationFn: async (overrides?: Partial<Draft>) => save({ data: { ...draft, ...overrides } }),
    onSuccess: (res) => {
      if (res?.item) {
        setDraft(fromRow(res.item));
        setSavedAt(new Date());
        setDirty(false);
        if (isNew) {
          navigate({ to: "/admin/faqs/$id", params: { id: res.item.id }, replace: true });
        }
      }
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Save failed"),
  });

  /** Wrap the current textarea selection with rich-text markup. */
  const wrap = (before: string, after: string, fallback = "text") => {
    const el = answerRef.current;
    const value = draft.answer;
    if (!el) {
      patch("answer", `${value}${before}${fallback}${after}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    patch("answer", next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length + after.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const insert = (snippet: string) => {
    const el = answerRef.current;
    const value = draft.answer;
    if (!el) {
      patch("answer", value + snippet);
      return;
    }
    const start = el.selectionStart;
    patch("answer", `${value.slice(0, start)}${snippet}${value.slice(start)}`);
  };

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
    if (!draft.question.trim()) {
      setError("Question is required");
      return;
    }
    setError(null);
    saveMut.mutate(overrides);
  };

  const previewFaq: Faq = {
    id: draft.id ?? "preview",
    question: draft.question || "Your question appears here",
    answer: draft.answer,
    category: draft.category,
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
          <Link to="/admin/faqs" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <HelpCircle className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                {isNew ? "New FAQ" : "Edit FAQ"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                FAQs
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
          <Card title="Question">
            <Field label="Question">
              <input
                value={draft.question}
                onChange={(e) => patch("question", e.target.value)}
                placeholder="How long does a website project take?"
                className={inputCls}
              />
            </Field>
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => patch("category", e.target.value)}
                className={inputCls}
              >
                {FAQ_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </Card>

          <Card title="Answer">
            <div className="flex flex-wrap items-center gap-1.5">
              <ToolbarButton label="Bold" onClick={() => wrap("<strong>", "</strong>", "bold text")}>
                <Bold className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton label="Italic" onClick={() => wrap("<em>", "</em>", "italic text")}>
                <Italic className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton
                label="Bullet list"
                onClick={() => insert("\n<ul>\n  <li>First point</li>\n  <li>Second point</li>\n</ul>\n")}
              >
                <List className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton
                label="Link"
                onClick={() => {
                  const url = prompt("Link URL", "https://");
                  if (url) wrap(`<a href="${url}">`, "</a>", "link text");
                }}
              >
                <Link2 className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton label="Insert image" onClick={() => setMediaOpen((v) => !v)}>
                <ImagePlus className="h-3.5 w-3.5" />
              </ToolbarButton>
              <span className="ml-auto text-[11px] text-muted-foreground">
                Rich text · HTML supported
              </span>
            </div>

            {mediaOpen && (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
                <p className="mb-2 text-[11px] text-muted-foreground">
                  Upload or pick from the Media Library — the image is inserted into the answer.
                </p>
                <MediaField
                  value=""
                  onChange={(url) => {
                    if (!url) return;
                    insert(`\n<img src="${url}" alt="${draft.question || "FAQ image"}" loading="lazy" />\n`);
                    setMediaOpen(false);
                  }}
                  accept="image"
                />
              </div>
            )}

            <textarea
              ref={answerRef}
              value={draft.answer}
              onChange={(e) => patch("answer", e.target.value)}
              rows={12}
              placeholder="<p>Most projects ship in 3–5 weeks…</p>"
              className={`${inputCls} font-mono text-[13px]`}
            />
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
            <p className="text-[11px] text-muted-foreground">
              Published FAQs are automatically added to FAQPage structured data (JSON-LD) on the
              homepage and /faq.
            </p>
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
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-semibold">{previewFaq.question}</p>
              <div className="mt-2">
                <FaqRichText html={previewFaq.answer} />
              </div>
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground hover:shadow"
    >
      {children}
    </button>
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
