import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Copy,
  GripVertical,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  FAQ_CATEGORIES,
  deleteFaq,
  duplicateFaq,
  faqPlainText,
  listAdminFaqs,
  reorderFaqs,
  upsertFaq,
  type Faq,
} from "@/lib/faqs.functions";

export const Route = createFileRoute("/_authenticated/admin/faqs/")({
  head: () => ({
    meta: [
      { title: "FAQs — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminFaqsList,
});

type StatusFilter = "all" | "draft" | "published" | "featured";

const PAGE_SIZE = 12;

function AdminFaqsList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(listAdminFaqs);
  const save = useServerFn(upsertFaq);
  const del = useServerFn(deleteFaq);
  const dup = useServerFn(duplicateFaq);
  const reorder = useServerFn(reorderFaqs);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const list = useQuery({
    queryKey: ["faqs-admin"],
    queryFn: () => load(),
    enabled: !!admin.data?.isAdmin,
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Faq[]>([]);

  useEffect(() => {
    if (list.data?.items) setItems(list.data.items);
  }, [list.data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((f) => {
      if (status === "draft" && f.published) return false;
      if (status === "published" && !f.published) return false;
      if (status === "featured" && !f.featured) return false;
      if (category !== "all" && f.category !== category) return false;
      if (!query) return true;
      return (
        f.question.toLowerCase().includes(query) ||
        faqPlainText(f.answer).toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query)
      );
    });
  }, [items, q, status, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["faqs-admin"] });
    qc.invalidateQueries({ queryKey: ["faqs-public"] });
    qc.invalidateQueries({ queryKey: ["faqs-featured"] });
  };

  const toPayload = (f: Faq) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category,
    display_order: f.display_order,
    featured: f.featured,
    published: f.published,
    seo_title: f.seo_title,
    seo_description: f.seo_description,
  });

  const publishMut = useMutation({
    mutationFn: (f: Faq) => save({ data: { ...toPayload(f), published: !f.published } }),
    onSuccess: invalidate,
  });
  const featureMut = useMutation({
    mutationFn: (f: Faq) => save({ data: { ...toPayload(f), featured: !f.featured } }),
    onSuccess: invalidate,
  });
  const dupMut = useMutation({
    mutationFn: (id: string) => dup({ data: { id } }),
    onSuccess: invalidate,
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: invalidate,
  });
  const reorderMut = useMutation({
    mutationFn: (payload: { id: string; display_order: number }[]) =>
      reorder({ data: { items: payload } }),
    onSuccess: invalidate,
  });

  const dragId = useRef<string | null>(null);
  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const fromId = dragId.current;
    dragId.current = null;
    if (!fromId || fromId === targetId) return;
    const ids = filtered.map((f) => f.id);
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const nextIds = [...ids];
    nextIds.splice(from, 1);
    nextIds.splice(to, 0, fromId);
    const orderMap = new Map<string, number>();
    nextIds.forEach((id, i) => orderMap.set(id, i));
    const nextItems = [...items]
      .map((f) => (orderMap.has(f.id) ? { ...f, display_order: orderMap.get(f.id)! } : f))
      .sort((a, b) => a.display_order - b.display_order);
    setItems(nextItems);
    reorderMut.mutate(nextIds.map((id, i) => ({ id, display_order: i })));
  };

  if (admin.isLoading || list.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!admin.data?.isAdmin) {
    return <div className="grid min-h-screen place-items-center">Access denied</div>;
  }

  const isEmpty = (list.data?.items ?? []).length === 0;

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Studio
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <HelpCircle className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">FAQs</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Content Studio
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => navigate({ to: "/admin/faqs/$id", params: { id: "new" } })}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              <Plus className="h-3 w-3" /> New FAQ
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {isEmpty ? (
          <EmptyState onCreate={() => navigate({ to: "/admin/faqs/$id", params: { id: "new" } })} />
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search questions…"
                  className="w-full rounded-full border border-border bg-white px-11 py-2.5 text-sm outline-none focus:border-foreground/30"
                />
              </div>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="rounded-full border border-border bg-white px-4 py-2.5 text-xs outline-none"
              >
                <option value="all">All categories</option>
                {FAQ_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                {(["all", "draft", "published", "featured"] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatus(s);
                      setPage(1);
                    }}
                    className={`rounded-full border px-3.5 py-2 text-xs font-medium capitalize transition ${
                      status === s
                        ? "border-foreground bg-foreground text-white"
                        : "border-border bg-white hover:-translate-y-0.5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white p-16 text-center text-sm text-muted-foreground">
                No FAQs match your filters.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paged.map((f) => (
                    <div
                      key={f.id}
                      draggable
                      onDragStart={onDragStart(f.id)}
                      onDragOver={onDragOver}
                      onDrop={onDrop(f.id)}
                      className="group flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center"
                    >
                      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground opacity-40 transition group-hover:opacity-100" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold tracking-tight">
                            {f.question || "Untitled question"}
                          </span>
                          {f.featured && (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                              Featured
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              f.published
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {f.published ? "Live" : "Draft"}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {f.category}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {faqPlainText(f.answer) || "No answer yet"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => featureMut.mutate(f)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] hover:-translate-y-0.5 hover:shadow ${
                            f.featured
                              ? "border-violet-300 bg-violet-50 text-violet-700"
                              : "border-border bg-white"
                          }`}
                        >
                          {f.featured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          onClick={() => publishMut.mutate(f)}
                          className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] hover:-translate-y-0.5 hover:shadow"
                        >
                          {f.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => dupMut.mutate(f.id)}
                          className="grid h-7 w-7 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"
                          title="Duplicate"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <Link
                          to="/admin/faqs/$id"
                          params={{ id: f.id }}
                          className="grid h-7 w-7 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm("Delete this FAQ? This cannot be undone."))
                              delMut.mutate(f.id);
                          }}
                          className="grid h-7 w-7 place-items-center rounded-full border border-border bg-white text-red-600 hover:-translate-y-0.5 hover:shadow"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-white p-10 text-center sm:p-16">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="relative mx-auto max-w-md">
        <div
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          <HelpCircle className="h-6 w-6" />
        </div>
        <h2
          className="mt-6 text-3xl font-normal tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Add your first FAQ
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Write a question and a rich-text answer. Featured FAQs appear on the homepage, and every
          published FAQ powers the /faq page plus Google FAQ rich results.
        </p>
        <button onClick={onCreate} className="btn-primary mt-8 !px-5 !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Add your first FAQ
        </button>
      </div>
    </div>
  );
}
