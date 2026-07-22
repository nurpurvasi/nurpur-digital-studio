import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { saveInlineEdit } from "@/lib/cms.functions";
import { useSiteContent } from "@/content/SiteContentContext";
import { defaultSiteContent } from "@/content/site";
import { SECTION_SCHEMAS } from "./schemas";
import { MediaField } from "./MediaField";
import type { FieldDef, SectionKey } from "./types";

/* ----------------- helpers ----------------- */

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

function setPath<T>(obj: T, path: string, value: unknown): T {
  const clone: unknown = JSON.parse(JSON.stringify(obj ?? {}));
  const keys = path.split(".");
  let cur = clone as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof cur[k] !== "object" || cur[k] === null) cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return clone as T;
}

/* ----------------- field ----------------- */

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const common =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-[color:var(--royal)]";
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={common}
        />
      ) : field.type === "media" ? (
        <MediaField
          value={(value as string) ?? ""}
          onChange={onChange}
          accept={field.accept ?? "any"}
        />
      ) : field.type === "number" ? (
        <input
          type="number"
          value={(value as number) ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className={common}
        />
      ) : (
        <input
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={common}
        />
      )}
    </div>
  );
}

/* ----------------- object editor ----------------- */

function ObjectEditor({
  value,
  fields,
  onChange,
}: {
  value: Record<string, unknown>;
  fields: FieldDef[];
  onChange: (v: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <Field
          key={f.key}
          field={f}
          value={getPath(value, f.key)}
          onChange={(v) => onChange(setPath(value, f.key, v))}
        />
      ))}
    </div>
  );
}

/* ----------------- list editor ----------------- */

function ListEditor({
  items,
  onChange,
  schema,
}: {
  items: Record<string, unknown>[];
  onChange: (v: Record<string, unknown>[]) => void;
  schema: NonNullable<ReturnType<typeof getListSchema>>;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(items.length ? 0 : null);

  function update(i: number, next: Record<string, unknown>) {
    const copy = items.slice();
    copy[i] = next;
    onChange(copy);
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = items.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
    setOpenIdx(j);
  }
  function remove(i: number) {
    onChange(items.filter((_, k) => k !== i));
    setOpenIdx(null);
  }
  function add() {
    const next = items.concat([schema.item.newItem()]);
    onChange(next);
    setOpenIdx(next.length - 1);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
          No items yet. Add the first one below.
        </p>
      ) : (
        items.map((item, i) => {
          const open = openIdx === i;
          return (
            <div
              key={(item.id as string) ?? i}
              className="overflow-hidden rounded-2xl border border-border bg-background"
            >
              <div className="flex items-center gap-1 px-2 py-1.5">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  className="flex-1 truncate px-1 py-1 text-left text-sm font-medium"
                  onClick={() => setOpenIdx(open ? null : i)}
                >
                  {schema.item.itemLabel(item, i)}
                </button>
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-accent disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-accent disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this item?")) remove(i);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full text-red-600 transition hover:bg-red-50"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {open ? (
                <div className="space-y-4 border-t border-border p-4">
                  <ObjectEditor
                    value={item}
                    fields={schema.item.fields}
                    onChange={(v) => update(i, v)}
                  />
                </div>
              ) : null}
            </div>
          );
        })
      )}
      <button
        type="button"
        onClick={add}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-transparent hover:bg-accent"
      >
        <Plus className="h-4 w-4" />
        Add item
      </button>
    </div>
  );
}

function getListSchema(section: SectionKey) {
  const s = SECTION_SCHEMAS[section];
  return s && s.kind === "list" ? s : null;
}

/* ----------------- sheet ----------------- */

export function InlineEditorSheet({
  section,
  label,
  onClose,
}: {
  section: SectionKey;
  label?: string;
  onClose: () => void;
}) {
  const site = useSiteContent();
  const schema = SECTION_SCHEMAS[section];
  const initial = useMemo(() => {
    const current = (site as unknown as Record<string, unknown>)[section];
    if (current === undefined || current === null) {
      return (defaultSiteContent as unknown as Record<string, unknown>)[section];
    }
    return current;
  }, [site, section]);

  const [value, setValue] = useState<unknown>(() => JSON.parse(JSON.stringify(initial)));
  const [dirty, setDirty] = useState(false);
  const qc = useQueryClient();
  const saveFn = useServerFn(saveInlineEdit);
  const saveMut = useMutation({
    mutationFn: async (v: unknown) => saveFn({ data: { section, value: v as never } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-content"] });
      setDirty(false);
    },
  });

  useEffect(() => {
    setValue(JSON.parse(JSON.stringify(initial)));
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  function update(v: unknown) {
    setValue(v);
    setDirty(true);
  }

  if (!schema) {
    return (
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <p className="text-sm text-muted-foreground">This section is not editable inline.</p>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Editing
              </p>
              <SheetTitle className="text-lg">{label ?? schema.title}</SheetTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-accent"
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {schema.kind === "object" ? (
            <ObjectEditor
              value={(value as Record<string, unknown>) ?? {}}
              fields={schema.fields}
              onChange={update}
            />
          ) : (
            <ListEditor
              items={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
              onChange={update}
              schema={schema}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-background/95 px-5 py-3 backdrop-blur">
          <p className="text-[11px] text-muted-foreground">
            {saveMut.isPending
              ? "Saving…"
              : saveMut.isError
                ? "Save failed — try again"
                : dirty
                  ? "Unsaved changes"
                  : "All changes saved"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition hover:bg-accent"
            >
              Done
            </button>
            <button
              type="button"
              disabled={!dirty || saveMut.isPending}
              onClick={() => saveMut.mutate(value)}
              className="btn-primary !px-4 !py-2 text-xs disabled:opacity-50"
            >
              {saveMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save & publish
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
