import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listLeads, deleteLead, updateLead, type Lead, type LeadStatus, type LeadPriority } from "@/lib/leads.functions";
import { getIsAdmin } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Trash2,
  ExternalLink,
  LogOut,
  Sparkles,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({
    meta: [
      { title: "Leads — NurpurVasi Digitals" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLeadsList,
});

const STATUS_OPTIONS: { key: LeadStatus | "all"; label: string; tone: string }[] = [
  { key: "all", label: "All", tone: "bg-foreground text-background" },
  { key: "new", label: "New", tone: "bg-blue-100 text-blue-800" },
  { key: "contacted", label: "Contacted", tone: "bg-violet-100 text-violet-800" },
  { key: "in_progress", label: "In Progress", tone: "bg-amber-100 text-amber-800" },
  { key: "closed", label: "Closed", tone: "bg-emerald-100 text-emerald-800" },
  { key: "spam", label: "Spam", tone: "bg-red-100 text-red-800" },
];

const PRIORITY_OPTIONS: { key: LeadPriority | "all"; label: string; tone: string }[] = [
  { key: "all", label: "All priority", tone: "" },
  { key: "high", label: "High", tone: "bg-red-100 text-red-800" },
  { key: "medium", label: "Medium", tone: "bg-amber-100 text-amber-800" },
  { key: "low", label: "Low", tone: "bg-slate-100 text-slate-700" },
];

const PAGE_SIZE = 20;

export function statusTone(s: LeadStatus): string {
  return STATUS_OPTIONS.find((o) => o.key === s)?.tone ?? "bg-slate-100 text-slate-700";
}
export function priorityTone(p: LeadPriority): string {
  return PRIORITY_OPTIONS.find((o) => o.key === p)?.tone ?? "bg-slate-100 text-slate-700";
}
export function statusLabel(s: LeadStatus): string {
  return STATUS_OPTIONS.find((o) => o.key === s)?.label ?? s;
}

function AdminLeadsList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const fetchLeads = useServerFn(listLeads);
  const del = useServerFn(deleteLead);
  const patch = useServerFn(updateLead);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const list = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => fetchLeads(),
    enabled: !!admin.data?.isAdmin,
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [priority, setPriority] = useState<LeadPriority | "all">("all");
  const [page, setPage] = useState(1);

  const leads: Lead[] = list.data?.leads ?? [];
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (priority !== "all" && l.priority !== priority) return false;
      if (!term) return true;
      return (
        l.name.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term) ||
        (l.company ?? "").toLowerCase().includes(term) ||
        (l.subject ?? "").toLowerCase().includes(term) ||
        l.message.toLowerCase().includes(term)
      );
    });
  }, [leads, q, status, priority]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
  });
  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: LeadStatus }) => patch({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length, new: 0, contacted: 0, in_progress: 0, closed: 0, spam: 0 };
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (admin.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!admin.data?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <button onClick={signOut} className="mt-4 rounded-full border px-4 py-2 text-sm">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Leads</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Content Studio</div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/admin"
              className="hidden items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
            >
              <ArrowLeft className="h-3 w-3" /> Studio
            </Link>
            <Link
              to="/contact"
              className="hidden items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium sm:inline-flex"
            >
              <ExternalLink className="h-3 w-3" /> Contact form
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
            <h2 className="text-2xl font-semibold tracking-tight">Lead inbox</h2>
            <p className="text-sm text-muted-foreground">
              {leads.length} total · {counts.new ?? 0} new
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, message…"
              className="w-full rounded-full border border-border bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-foreground/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setStatus(s.key);
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  status === s.key ? "bg-foreground text-background" : "bg-white border border-border"
                }`}
              >
                {s.label}
                {s.key !== "all" && counts[s.key] ? (
                  <span className="ml-1.5 opacity-70">({counts[s.key]})</span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex gap-2 md:ml-auto">
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as LeadPriority | "all");
                setPage(1);
              }}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
          {list.isLoading && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            </div>
          )}
          {!list.isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 p-14 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 opacity-40" />
              <div>No leads match these filters yet.</div>
            </div>
          )}
          {pageItems.map((l) => (
            <div
              key={l.id}
              className="grid grid-cols-[1fr_auto] items-start gap-4 border-b border-border p-4 last:border-b-0 md:grid-cols-[1.4fr_1fr_auto_auto_auto]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusTone(l.status)}`}>
                    {statusLabel(l.status)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${priorityTone(l.priority)}`}>
                    {l.priority}
                  </span>
                </div>
                <Link
                  to="/admin/leads/$id"
                  params={{ id: l.id }}
                  className="mt-1 block truncate font-medium hover:underline"
                >
                  {l.name} {l.company ? <span className="text-muted-foreground">· {l.company}</span> : null}
                </Link>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {l.subject || l.message.slice(0, 120)}
                </div>
              </div>
              <div className="hidden min-w-0 flex-col gap-1 text-xs text-muted-foreground md:flex">
                <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 truncate hover:text-foreground">
                  <Mail className="h-3 w-3" /> {l.email}
                </a>
                {l.phone && (
                  <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 truncate hover:text-foreground">
                    <Phone className="h-3 w-3" /> {l.phone}
                  </a>
                )}
              </div>
              <div className="hidden text-xs text-muted-foreground md:block">
                {new Date(l.created_at).toLocaleDateString()}
                <div className="opacity-60">{l.website_template || "—"}</div>
              </div>
              <div className="hidden md:block">
                <select
                  value={l.status}
                  onChange={(e) => statusMut.mutate({ id: l.id, status: e.target.value as LeadStatus })}
                  className="rounded-full border border-border bg-white px-2 py-1 text-xs"
                >
                  {STATUS_OPTIONS.filter((o) => o.key !== "all").map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/admin/leads/$id"
                  params={{ id: l.id }}
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-xs hover:-translate-y-0.5 hover:shadow"
                >
                  Open
                </Link>
                <button
                  onClick={() => {
                    if (confirm("Delete this lead? This cannot be undone.")) delMut.mutate(l.id);
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

        {filtered.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Page {currentPage} of {totalPages} · {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
