import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, RotateCcw, Type, Undo2, Sparkles } from "lucide-react";
import {
  getAdminTypography,
  resetTypography,
  saveTypography,
} from "@/lib/typography.functions";
import {
  FONT_CATALOG,
  TYPOGRAPHY_PRESETS,
  WEIGHT_OPTIONS,
  defaultTypography,
  fontStack,
  type TypographySettings,
} from "@/lib/typography";
import { useGoogleFontLoader, useTypography } from "@/content/TypographyContext";

type Tab = "fonts" | "settings";

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-white px-3 py-2.5 text-sm"
        style={{ fontFamily: fontStack(value) }}
      >
        {FONT_CATALOG.map((f) => (
          <option key={f.name} value={f.name}>
            {f.name} — {f.category}
          </option>
        ))}
      </select>
    </label>
  );
}

function WeightSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-2xl border border-border bg-white px-3 py-2.5 text-sm"
      >
        {WEIGHT_OPTIONS.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--royal)]"
      />
    </label>
  );
}

function PreviewCard({ t }: { t: TypographySettings }) {
  useGoogleFontLoader(t, "nvd-google-fonts-preview");
  return (
    <div
      className="rounded-3xl border border-border bg-white p-6"
      style={{
        fontFamily: fontStack(t.body_font),
        fontSize: `${t.base_font_size}px`,
        lineHeight: t.body_line_height,
        letterSpacing: `${t.body_letter_spacing}em`,
        fontWeight: t.body_weight,
      }}
    >
      <div
        className="mb-4 flex flex-wrap gap-2 text-xs"
        style={{ fontFamily: fontStack(t.navigation_font), fontWeight: t.navigation_weight }}
      >
        {["Home", "Services", "Portfolio", "Pricing", "Contact"].map((n) => (
          <span key={n} className="rounded-full border border-border px-3 py-1">
            {n}
          </span>
        ))}
      </div>
      <h2
        className="text-3xl md:text-4xl"
        style={{
          fontFamily: fontStack(t.heading_font),
          fontWeight: t.heading_weight,
          letterSpacing: `${t.heading_letter_spacing}em`,
          lineHeight: t.heading_line_height,
          textTransform: t.text_transform,
        }}
      >
        Crafting digital experiences
      </h2>
      <p className="mt-3 text-muted-foreground">
        Premium website design, development, SEO and digital solutions for ambitious brands. This
        paragraph previews your body typography exactly as visitors will read it.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <span
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm text-white"
          style={{
            background: "var(--gradient-brand)",
            fontFamily: fontStack(t.button_font),
            fontWeight: t.button_weight,
          }}
        >
          View portfolio
        </span>
        <span
          className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm"
          style={{ fontFamily: fontStack(t.button_font), fontWeight: t.button_weight }}
        >
          Get free consultation
        </span>
      </div>
    </div>
  );
}

export function TypographyStudio({ tab }: { tab: Tab }) {
  const load = useServerFn(getAdminTypography);
  const save = useServerFn(saveTypography);
  const reset = useServerFn(resetTypography);
  const qc = useQueryClient();
  const { setPreview } = useTypography();

  const query = useQuery({
    queryKey: ["admin-typography"],
    queryFn: () => load(),
    staleTime: 30_000,
  });

  const [draft, setDraft] = useState<TypographySettings | null>(null);
  const [history, setHistory] = useState<TypographySettings[]>([]);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const skipAutosave = useRef(true);

  useEffect(() => {
    if (query.data?.settings && draft === null) {
      setDraft(query.data.settings);
    }
  }, [query.data, draft]);

  // Live preview across the whole app while editing.
  useEffect(() => {
    setPreview(draft);
    return () => setPreview(null);
  }, [draft, setPreview]);

  const saveMut = useMutation({
    mutationFn: (values: TypographySettings) => save({ data: values }),
    onSuccess: (res) => {
      setSavedAt(new Date());
      qc.setQueryData(["admin-typography"], res);
      qc.invalidateQueries({ queryKey: ["typography-settings"] });
    },
  });

  // Autosave (debounced).
  useEffect(() => {
    if (!draft) return;
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    const id = setTimeout(() => saveMut.mutate(draft), 800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  function patch(p: Partial<TypographySettings>) {
    setDraft((cur) => {
      if (!cur) return cur;
      setHistory((h) => [...h.slice(-24), cur]);
      return { ...cur, ...p };
    });
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1]!;
      setDraft(prev);
      return h.slice(0, -1);
    });
  }

  const resetMut = useMutation({
    mutationFn: () => reset(),
    onSuccess: (res) => {
      setHistory((h) => (draft ? [...h.slice(-24), draft] : h));
      skipAutosave.current = true;
      setDraft(res.settings);
      setSavedAt(new Date());
      qc.setQueryData(["admin-typography"], res);
      qc.invalidateQueries({ queryKey: ["typography-settings"] });
    },
  });

  const status = useMemo(() => {
    if (saveMut.isPending) return "saving";
    if (saveMut.isError) return "error";
    if (savedAt) return "saved";
    return "idle";
  }, [saveMut.isPending, saveMut.isError, savedAt]);

  if (query.isLoading || !draft) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading typography…
        </span>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center text-sm text-muted-foreground">
        You don't have permission to manage typography.
      </div>
    );
  }

  const t = draft;

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Type className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Typography</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Global font manager
              </div>
            </div>
          </Link>

          <div className="ml-4 hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground md:flex">
            {status === "saving" ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
              </>
            ) : status === "error" ? (
              <>Could not save — retrying on next change</>
            ) : status === "saved" ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" /> Saved
              </>
            ) : (
              <>Autosave on</>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/admin/typography"
              className={`rounded-full border border-border px-3 py-2 text-xs font-medium ${tab === "fonts" ? "bg-foreground text-background" : "bg-white"}`}
            >
              Fonts
            </Link>
            <Link
              to="/admin/typography/settings"
              className={`rounded-full border border-border px-3 py-2 text-xs font-medium ${tab === "settings" ? "bg-foreground text-background" : "bg-white"}`}
            >
              Settings
            </Link>
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium disabled:opacity-40"
            >
              <Undo2 className="h-3 w-3" /> Undo
            </button>
            <button
              onClick={() => resetMut.mutate()}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium hover:-translate-y-0.5 hover:shadow-md"
            >
              <RotateCcw className="h-3 w-3" /> Reset to default
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <main className="space-y-6">
          {tab === "fonts" ? (
            <>
              <section className="rounded-3xl border border-border bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--royal)]" />
                  <h2 className="text-sm font-semibold">Presets</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TYPOGRAPHY_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => patch(p.values)}
                      className="rounded-2xl border border-border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div
                        className="text-lg"
                        style={{
                          fontFamily: fontStack(p.values.heading_font),
                          fontWeight: p.values.heading_weight,
                        }}
                      >
                        {p.label}
                      </div>
                      <div
                        className="mt-1 text-xs text-muted-foreground"
                        style={{ fontFamily: fontStack(p.values.body_font) }}
                      >
                        {p.description}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-white p-6">
                <h2 className="mb-4 text-sm font-semibold">Font families</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FontSelect
                    label="Heading font"
                    value={t.heading_font}
                    onChange={(v) => patch({ heading_font: v })}
                  />
                  <FontSelect
                    label="Body font"
                    value={t.body_font}
                    onChange={(v) => patch({ body_font: v })}
                  />
                  <FontSelect
                    label="Navigation font"
                    value={t.navigation_font}
                    onChange={(v) => patch({ navigation_font: v })}
                  />
                  <FontSelect
                    label="Button font"
                    value={t.button_font}
                    onChange={(v) => patch({ button_font: v })}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-white p-6">
                <h2 className="mb-4 text-sm font-semibold">Weights</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <WeightSelect
                    label="Heading weight"
                    value={t.heading_weight}
                    onChange={(v) => patch({ heading_weight: v })}
                  />
                  <WeightSelect
                    label="Body weight"
                    value={t.body_weight}
                    onChange={(v) => patch({ body_weight: v })}
                  />
                  <WeightSelect
                    label="Navigation weight"
                    value={t.navigation_weight}
                    onChange={(v) => patch({ navigation_weight: v })}
                  />
                  <WeightSelect
                    label="Button weight"
                    value={t.button_weight}
                    onChange={(v) => patch({ button_weight: v })}
                  />
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="rounded-3xl border border-border bg-white p-6">
                <h2 className="mb-4 text-sm font-semibold">Spacing &amp; rhythm</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Slider
                    label="Heading letter spacing"
                    value={t.heading_letter_spacing}
                    min={-0.08}
                    max={0.2}
                    step={0.005}
                    suffix="em"
                    onChange={(v) => patch({ heading_letter_spacing: v })}
                  />
                  <Slider
                    label="Body letter spacing"
                    value={t.body_letter_spacing}
                    min={-0.05}
                    max={0.2}
                    step={0.005}
                    suffix="em"
                    onChange={(v) => patch({ body_letter_spacing: v })}
                  />
                  <Slider
                    label="Heading line height"
                    value={t.heading_line_height}
                    min={0.9}
                    max={2}
                    step={0.01}
                    onChange={(v) => patch({ heading_line_height: v })}
                  />
                  <Slider
                    label="Body line height"
                    value={t.body_line_height}
                    min={1.2}
                    max={2.4}
                    step={0.01}
                    onChange={(v) => patch({ body_line_height: v })}
                  />
                  <Slider
                    label="Base font size"
                    value={t.base_font_size}
                    min={13}
                    max={22}
                    step={0.5}
                    suffix="px"
                    onChange={(v) => patch({ base_font_size: v })}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-white p-6">
                <h2 className="mb-4 text-sm font-semibold">Heading text transform</h2>
                <div className="flex flex-wrap gap-2">
                  {(["none", "uppercase", "capitalize"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => patch({ text_transform: v })}
                      className={`rounded-full border border-border px-4 py-2 text-xs font-medium capitalize ${
                        t.text_transform === v ? "bg-foreground text-background" : "bg-white"
                      }`}
                    >
                      {v === "none" ? "Normal" : v}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-white p-6 text-xs text-muted-foreground">
                Current defaults: {defaultTypography.heading_font} headings ·{" "}
                {defaultTypography.body_font} body. Changes apply site-wide instantly — homepage,
                about, services, portfolio, gallery, blog, testimonials, pricing, contact, header,
                footer, buttons, forms and cards.
              </section>
            </>
          )}
        </main>

        <aside className="h-fit space-y-3 lg:sticky lg:top-24">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Live preview</div>
          <PreviewCard t={t} />
        </aside>
      </div>
    </div>
  );
}
