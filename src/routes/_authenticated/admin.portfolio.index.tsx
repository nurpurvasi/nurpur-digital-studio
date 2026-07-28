import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  deleteProject,
  duplicateProject,
  listAdminProjects,
  upsertProject,
  type PortfolioProject,
} from "@/lib/portfolio.functions";

export const Route = createFileRoute("/_authenticated/admin/portfolio/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPortfolioList,
});

function AdminPortfolioList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(listAdminProjects);
  const save = useServerFn(upsertProject);
  const del = useServerFn(deleteProject);
  const dup = useServerFn(duplicateProject);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const list = useQuery({
    queryKey: ["portfolio-admin"],
    queryFn: () => load(),
    enabled: !!admin.data?.isAdmin,
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");

  const filtered = useMemo(() => {
    const projects: PortfolioProject[] = list.data?.projects ?? [];
    return projects.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      const query = q.trim().toLowerCase();
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.client.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    });
  }, [list.data, q, status]);

  const toggleMut = useMutation({
    mutationFn: (p: PortfolioProject) =>
      save({
        data: {
          ...p,
          status: p.status === "published" ? "draft" : "published",
          publish_date: p.status === "published" ? p.publish_date : p.publish_date || new Date().toISOString(),
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio-admin"] }),
  });

  const dupMut = useMutation({
    mutationFn: (id: string) => dup({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio-admin"] }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio-admin"] }),
  });

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

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-6">
          <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Studio
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Portfolio</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Content Studio</div>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => navigate({ to: "/admin/portfolio/$id", params: { id: "new" } })}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              <Plus className="h-3 w-3" /> New project
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects…"
              className="w-full rounded-full border border-border bg-white px-11 py-2.5 text-sm outline-none focus:border-foreground/30"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "draft", "published"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full border px-4 py-2 text-xs font-medium capitalize transition ${
                  status === s ? "border-foreground bg-foreground text-white" : "border-border bg-white hover:-translate-y-0.5"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-16 text-center text-sm text-muted-foreground">
            No projects yet. Click <b>New project</b> to create your first one.
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((p) => (
              <div key={p.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" style={{ background: "var(--gradient-brand)" }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold">{p.title || "(Untitled)"}</div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.status}
                    </span>
                    {p.featured && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-700">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    /{p.slug} {p.category ? `· ${p.category}` : ""} {p.client ? `· ${p.client}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMut.mutate(p)}
                    className="rounded-full border border-border bg-white px-3 py-1.5 text-xs hover:-translate-y-0.5 hover:shadow"
                  >
                    {p.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => dupMut.mutate(p.id)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    to="/admin/portfolio/$id"
                    params={{ id: p.id }}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("Delete this project? This cannot be undone.")) delMut.mutate(p.id);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white text-red-600 hover:-translate-y-0.5 hover:shadow"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
