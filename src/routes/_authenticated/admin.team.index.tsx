import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Copy,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  deleteTeamMember,
  duplicateTeamMember,
  listAdminTeam,
  reorderTeam,
  upsertTeamMember,
  type TeamMember,
} from "@/lib/team.functions";

export const Route = createFileRoute("/_authenticated/admin/team/")({
  head: () => ({
    meta: [
      { title: "Team — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminTeamList,
});

type StatusFilter = "all" | "draft" | "published" | "featured";

const PAGE_SIZE = 12;

function AdminTeamList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(listAdminTeam);
  const save = useServerFn(upsertTeamMember);
  const del = useServerFn(deleteTeamMember);
  const dup = useServerFn(duplicateTeamMember);
  const reorder = useServerFn(reorderTeam);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const list = useQuery({
    queryKey: ["team-admin"],
    queryFn: () => load(),
    enabled: !!admin.data?.isAdmin,
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (list.data?.items) setItems(list.data.items);
  }, [list.data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((t) => {
      if (status === "draft" && t.status !== "draft") return false;
      if (status === "published" && t.status !== "published") return false;
      if (status === "featured" && !t.featured) return false;
      if (!query) return true;
      return (
        t.name.toLowerCase().includes(query) ||
        t.designation.toLowerCase().includes(query) ||
        t.bio.toLowerCase().includes(query) ||
        t.email.toLowerCase().includes(query)
      );
    });
  }, [items, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleMut = useMutation({
    mutationFn: (t: TeamMember) =>
      save({
        data: {
          ...t,
          status: t.status === "published" ? "draft" : "published",
          publish_date:
            t.status === "published" ? t.publish_date : t.publish_date || new Date().toISOString(),
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-admin"] }),
  });

  const featureMut = useMutation({
    mutationFn: (t: TeamMember) => save({ data: { ...t, featured: !t.featured } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-admin"] }),
  });

  const dupMut = useMutation({
    mutationFn: (id: string) => dup({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-admin"] }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-admin"] }),
  });

  const reorderMut = useMutation({
    mutationFn: (payload: { id: string; sort_order: number }[]) =>
      reorder({ data: { items: payload } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-admin"] }),
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
    const ids = filtered.map((t) => t.id);
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const nextIds = [...ids];
    nextIds.splice(from, 1);
    nextIds.splice(to, 0, fromId);
    const orderMap = new Map<string, number>();
    nextIds.forEach((id, i) => orderMap.set(id, i));
    const nextItems = [...items]
      .map((t) => (orderMap.has(t.id) ? { ...t, sort_order: orderMap.get(t.id)! } : t))
      .sort((a, b) => a.sort_order - b.sort_order);
    setItems(nextItems);
    reorderMut.mutate(nextIds.map((id, i) => ({ id, sort_order: i })));
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
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Team</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Content Studio
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => navigate({ to: "/admin/team/$id", params: { id: "new" } })}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              <Plus className="h-3 w-3" /> New member
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {isEmpty ? (
          <EmptyState onCreate={() => navigate({ to: "/admin/team/$id", params: { id: "new" } })} />
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
                  placeholder="Search team members…"
                  className="w-full rounded-full border border-border bg-white px-11 py-2.5 text-sm outline-none focus:border-foreground/30"
                />
              </div>
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
                No team members match your filters.
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paged.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={onDragStart(t.id)}
                      onDragOver={onDragOver}
                      onDrop={onDrop(t.id)}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {t.profile_image ? (
                          <img
                            src={t.profile_image}
                            alt={t.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-muted-foreground">
                            <UserRound className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute left-2 top-2">
                          <span
                            className="grid h-7 w-7 cursor-grab place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <div className="absolute right-2 top-2 flex flex-wrap items-center gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                              t.status === "published"
                                ? "bg-emerald-500/90 text-white"
                                : "bg-amber-500/90 text-white"
                            }`}
                          >
                            {t.status}
                          </span>
                          {t.featured && (
                            <span className="rounded-full bg-violet-500/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {t.name || "(Unnamed)"}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            {t.designation || "No designation"}
                          </div>
                        </div>
                        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                          <button
                            onClick={() => featureMut.mutate(t)}
                            className={`rounded-full border px-2.5 py-1 text-[11px] hover:-translate-y-0.5 hover:shadow ${
                              t.featured
                                ? "border-violet-300 bg-violet-50 text-violet-700"
                                : "border-border bg-white"
                            }`}
                          >
                            {t.featured ? "Unfeature" : "Feature"}
                          </button>
                          <button
                            onClick={() => toggleMut.mutate(t)}
                            className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] hover:-translate-y-0.5 hover:shadow"
                          >
                            {t.status === "published" ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={() => dupMut.mutate(t.id)}
                            className="grid h-7 w-7 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"
                            title="Duplicate"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <Link
                            to="/admin/team/$id"
                            params={{ id: t.id }}
                            className="grid h-7 w-7 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm("Delete this team member? This cannot be undone."))
                                delMut.mutate(t.id);
                            }}
                            className="grid h-7 w-7 place-items-center rounded-full border border-border bg-white text-red-600 hover:-translate-y-0.5 hover:shadow"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
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
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="relative mx-auto max-w-md">
        <div
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          <UserRound className="h-6 w-6" />
        </div>
        <h2
          className="mt-6 text-3xl font-normal tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Add your first team member
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Introduce the people behind your work. Add photos, roles, bios and social links, then
          feature the key faces on your homepage.
        </p>
        <button onClick={onCreate} className="btn-primary mt-8 !px-5 !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Add your first team member
        </button>
      </div>
    </div>
  );
}
