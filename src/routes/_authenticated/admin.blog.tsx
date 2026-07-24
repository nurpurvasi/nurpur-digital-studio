import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listAdminPosts, deletePost, duplicatePost, upsertPost, type BlogPost } from "@/lib/blog.functions";
import { getIsAdmin } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Copy, Trash2, Pencil, ExternalLink, LogOut, Sparkles, ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: AdminBlogList,
});

function AdminBlogList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const fetchPosts = useServerFn(listAdminPosts);
  const del = useServerFn(deletePost);
  const dup = useServerFn(duplicatePost);
  const save = useServerFn(upsertPost);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const list = useQuery({
    queryKey: ["blog-admin-posts"],
    queryFn: () => fetchPosts(),
    enabled: !!admin.data?.isAdmin,
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");

  const posts: BlogPost[] = list.data?.posts ?? [];
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!term) return true;
      return p.title.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term);
    });
  }, [posts, q, status]);

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog-admin-posts"] }),
  });
  const dupMut = useMutation({
    mutationFn: (id: string) => dup({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog-admin-posts"] }),
  });
  const toggleMut = useMutation({
    mutationFn: (p: BlogPost) =>
      save({
        data: {
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          featured_image: p.featured_image,
          gallery: p.gallery,
          category: p.category,
          tags: p.tags,
          author: p.author,
          status: p.status === "published" ? "draft" : "published",
          publish_date: p.publish_date ?? new Date().toISOString(),
          seo_title: p.seo_title,
          seo_description: p.seo_description,
          og_image: p.og_image,
          canonical_url: p.canonical_url,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog-admin-posts"] }),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (admin.isLoading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!admin.data?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <button onClick={signOut} className="mt-4 rounded-full border px-4 py-2 text-sm">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-6">
          <Link to="/_authenticated/admin" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Blog</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Content Studio</div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/_authenticated/admin" className="hidden items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium hover:-translate-y-0.5 hover:shadow-md sm:inline-flex">
              <ArrowLeft className="h-3 w-3" /> Studio
            </Link>
            <Link to="/blog" className="hidden items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium sm:inline-flex">
              <ExternalLink className="h-3 w-3" /> View blog
            </Link>
            <button onClick={signOut} title="Sign out" className="rounded-full border border-border bg-white p-2">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Blog posts</h2>
            <p className="text-sm text-muted-foreground">Create, schedule and publish articles.</p>
          </div>
          <Link
            to="/_authenticated/admin/blog/$id"
            params={{ id: "new" }}
            className="btn-primary inline-flex items-center gap-2 !py-2 !px-4 !text-sm"
          >
            <Plus className="h-4 w-4" /> New post
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-full border border-border bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-foreground/40"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "published", "draft"] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs capitalize ${status === s ? "bg-foreground text-background" : "bg-accent"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
          {list.isLoading && <div className="p-8 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>}
          {!list.isLoading && filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">No posts yet. Create your first article.</div>
          )}
          {filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border p-4 last:border-b-0 md:grid-cols-[80px_1fr_auto_auto]">
              <div className="h-14 w-20 overflow-hidden rounded-lg bg-accent">
                {p.featured_image ? (
                  <img src={p.featured_image} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: "var(--gradient-brand)" }} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${p.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <div className="truncate font-medium">{p.title || "(untitled)"}</div>
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">/{p.slug} · {p.category || "Uncategorized"} · updated {new Date(p.updated_at).toLocaleDateString()}</div>
              </div>
              <div className="hidden gap-2 md:flex">
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
              </div>
              <div className="flex gap-2">
                <Link
                  to="/_authenticated/admin/blog/$id"
                  params={{ id: p.id }}
                  className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white hover:-translate-y-0.5 hover:shadow"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => { if (confirm("Delete this post?")) delMut.mutate(p.id); }}
                  className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white text-red-600 hover:-translate-y-0.5 hover:shadow"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
