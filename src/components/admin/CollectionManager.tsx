import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { MediaField } from "@/components/site/inline-editor/MediaField";

export type FieldKind = "text" | "textarea" | "date" | "time" | "url" | "image" | "switch" | "number";

export type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  help?: string;
  full?: boolean;
};

export type CollectionRow = Record<string, unknown> & { id?: string };

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

export function CollectionManager<T extends CollectionRow>({
  queryKey,
  load,
  save,
  remove,
  reorder,
  fields,
  empty,
  titleKey = "name",
  subtitleKey,
  imageKey = "cover_image",
  hasStatus = true,
  addLabel = "Add item",
}: {
  queryKey: string;
  load: () => Promise<{ items: T[] }>;
  save: (row: T) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  reorder?: (items: { id: string; sort_order: number }[]) => Promise<unknown>;
  fields: FieldDef[];
  empty: T;
  titleKey?: string;
  subtitleKey?: string;
  imageKey?: string;
  hasStatus?: boolean;
  addLabel?: string;
}) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: [queryKey], queryFn: () => load() });
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<T | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (row: T) => save(row),
    onSuccess: () => {
      setDraft(null);
      qc.invalidateQueries({ queryKey: [queryKey] });
    },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });
  const reorderMut = useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) => reorder!(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

  const items = useMemo(() => list.data?.items ?? [], [list.data]);
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((it) =>
      Object.values(it).some((v) => typeof v === "string" && v.toLowerCase().includes(query)),
    );
  }, [items, q]);

  const onDrop = (targetId: string) => {
    if (!reorder || !dragId || dragId === targetId) return;
    const ordered = [...items];
    const from = ordered.findIndex((i) => i.id === dragId);
    const to = ordered.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    setDragId(null);
    reorderMut.mutate(
      ordered.map((i, index) => ({ id: String(i.id), sort_order: index })),
    );
  };

  const setField = (key: string, value: unknown) =>
    setDraft((d) => (d ? ({ ...d, [key]: value } as T) : d));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="button"
          onClick={() => setDraft({ ...empty })}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      </div>

      {list.isLoading ? (
        <div className="flex items-center gap-2 rounded-2xl border bg-background p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center">
          <p className="text-sm font-medium">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use “{addLabel}” to create your first entry.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((it) => {
            const img = String(it[imageKey] ?? "");
            return (
              <li
                key={String(it.id)}
                draggable={!!reorder}
                onDragStart={() => setDragId(String(it.id))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(String(it.id))}
                className="flex items-center gap-3 rounded-2xl border bg-background p-3 shadow-sm"
              >
                {reorder && (
                  <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                )}
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {String(it[titleKey] ?? "") || "Untitled"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {subtitleKey ? String(it[subtitleKey] ?? "") : String(it.slug ?? "")}
                  </p>
                </div>
                {hasStatus && (
                  <span
                    className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline ${
                      it.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {String(it.status ?? "draft")}
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Edit"
                  onClick={() => setDraft({ ...it })}
                  className="rounded-lg border p-2 hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => {
                    if (confirm("Delete this entry?")) delMut.mutate(String(it.id));
                  }}
                  className="rounded-lg border p-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {draft && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close editor"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setDraft(null)}
          />
          <div className="relative h-full w-full max-w-xl overflow-y-auto bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/90 px-5 py-4 backdrop-blur">
              <h2 className="text-base font-semibold">
                {draft.id ? "Edit entry" : addLabel}
              </h2>
              <button type="button" aria-label="Close" onClick={() => setDraft(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              className="grid gap-4 p-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const row = { ...draft } as T;
                if ("slug" in row && !String(row.slug ?? "").trim()) {
                  (row as CollectionRow).slug = slugify(String(row[titleKey] ?? ""));
                }
                saveMut.mutate(row);
              }}
            >
              {fields.map((f) => {
                const value = draft[f.key];
                const cls = f.full || f.kind === "textarea" ? "sm:col-span-2" : "";
                if (f.kind === "switch") {
                  return (
                    <label
                      key={f.key}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${cls}`}
                    >
                      <span>{f.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => setField(f.key, e.target.checked)}
                        className="h-4 w-4"
                      />
                    </label>
                  );
                }
                if (f.kind === "image") {
                  return (
                    <div key={f.key} className={`space-y-1.5 ${cls}`}>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {f.label}
                      </span>
                      <MediaField
                        value={String(value ?? "")}
                        accept="image"
                        onChange={(url) => setField(f.key, url)}
                      />
                      {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
                    </div>
                  );
                }
                return (
                  <div key={f.key} className={`space-y-1.5 ${cls}`}>
                    <label
                      htmlFor={`field-${f.key}`}
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {f.label}
                    </label>
                    {f.kind === "textarea" ? (
                      <textarea
                        id={`field-${f.key}`}
                        rows={4}
                        value={String(value ?? "")}
                        placeholder={f.placeholder}
                        onChange={(e) => setField(f.key, e.target.value)}
                        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    ) : (
                      <input
                        id={`field-${f.key}`}
                        type={
                          f.kind === "date"
                            ? "date"
                            : f.kind === "number"
                              ? "number"
                              : f.kind === "time"
                                ? "text"
                                : "text"
                        }
                        value={String(value ?? "")}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          setField(
                            f.key,
                            f.kind === "number" ? Number(e.target.value || 0) : e.target.value,
                          )
                        }
                        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    )}
                    {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
                  </div>
                );
              })}

              {hasStatus && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </label>
                  <div className="flex gap-2">
                    {(["draft", "published"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setField("status", s)}
                        className={`rounded-xl border px-4 py-2 text-sm capitalize ${
                          draft.status === s
                            ? "border-primary bg-primary/10 font-semibold text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="sticky bottom-0 -mx-5 mt-2 flex gap-2 border-t bg-background/95 px-5 py-4 backdrop-blur sm:col-span-2">
                <button
                  type="submit"
                  disabled={saveMut.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                {saveMut.isError && (
                  <span className="self-center text-xs text-destructive">
                    Could not save. Please check the fields.
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionManager;
