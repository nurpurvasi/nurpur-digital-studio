import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getLead, updateLead, deleteLead, type LeadStatus, type LeadPriority } from "@/lib/leads.functions";
import { getIsAdmin } from "@/lib/cms.functions";
import { statusLabel, statusTone, priorityTone } from "./admin.leads";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  Trash2,
  Save,
  Check,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/leads/$id")({
  head: () => ({
    meta: [
      { title: "Lead — NurpurVasi Digitals" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLeadDetail,
});

function AdminLeadDetail() {
  const { id } = useParams({ from: "/_authenticated/admin/leads/$id" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const fetchLead = useServerFn(getLead);
  const patch = useServerFn(updateLead);
  const del = useServerFn(deleteLead);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const q = useQuery({
    queryKey: ["admin-lead", id],
    queryFn: () => fetchLead({ data: { id } }),
    enabled: !!admin.data?.isAdmin,
  });

  const lead = q.data?.lead ?? null;

  const [status, setStatus] = useState<LeadStatus>("new");
  const [priority, setPriority] = useState<LeadPriority>("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!lead) return;
    setStatus(lead.status);
    setPriority(lead.priority);
    setAssignedTo(lead.assigned_to ?? "");
    setNotes(lead.notes ?? "");
  }, [lead]);

  const saveMut = useMutation({
    mutationFn: () =>
      patch({
        data: {
          id,
          status,
          priority,
          assigned_to: assignedTo.trim() ? assignedTo.trim() : null,
          notes: notes.trim() ? notes : null,
        },
      }),
    onSuccess: () => {
      setSavedAt(Date.now());
      qc.invalidateQueries({ queryKey: ["admin-lead", id] });
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    },
  });

  const delMut = useMutation({
    mutationFn: () => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      navigate({ to: "/admin/leads", replace: true });
    },
  });

  if (admin.isLoading || q.isLoading) {
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
          <Link to="/auth" className="mt-4 inline-block rounded-full border px-4 py-2 text-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }
  if (!lead) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Lead not found</h1>
          <Link to="/admin/leads" className="mt-4 inline-block rounded-full border px-4 py-2 text-sm">
            Back to leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Lead detail</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Content Studio</div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/admin/leads"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium"
            >
              <ArrowLeft className="h-3 w-3" /> All leads
            </Link>
            <button
              onClick={() => {
                if (confirm("Delete this lead? This cannot be undone.")) delMut.mutate();
              }}
              className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusTone(lead.status)}`}
              >
                {statusLabel(lead.status)}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${priorityTone(lead.priority)}`}
              >
                {lead.priority}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                <Calendar className="mr-1 inline h-3 w-3" />
                {new Date(lead.created_at).toLocaleString()}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight">{lead.name}</h1>
            {lead.company && <p className="mt-1 text-sm text-muted-foreground">{lead.company}</p>}

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info icon={<Mail className="h-3.5 w-3.5" />} label="Email">
                <a className="hover:underline" href={`mailto:${lead.email}`}>
                  {lead.email}
                </a>
              </Info>
              {lead.phone && (
                <Info icon={<Phone className="h-3.5 w-3.5" />} label="Phone">
                  <a className="hover:underline" href={`tel:${lead.phone}`}>
                    {lead.phone}
                  </a>
                </Info>
              )}
              {lead.company && (
                <Info icon={<Building2 className="h-3.5 w-3.5" />} label="Company">
                  {lead.company}
                </Info>
              )}
              {lead.source_page && (
                <Info icon={<Globe className="h-3.5 w-3.5" />} label="Source page">
                  <span className="truncate">{lead.source_page}</span>
                </Info>
              )}
              {lead.website_template && (
                <Info icon={<Globe className="h-3.5 w-3.5" />} label="Template">
                  {lead.website_template}
                </Info>
              )}
            </dl>

            {lead.subject && (
              <div className="mt-6">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subject</div>
                <div className="mt-1 text-sm">{lead.subject}</div>
              </div>
            )}

            <div className="mt-6">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Message</div>
              <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-border bg-accent/30 p-4 text-sm">
                {lead.message}
              </div>
            </div>

            {(lead.ip_address || lead.user_agent) && (
              <details className="mt-6 text-xs text-muted-foreground">
                <summary className="cursor-pointer select-none">Metadata</summary>
                <div className="mt-2 space-y-1">
                  {lead.ip_address && <div>IP: {lead.ip_address}</div>}
                  {lead.user_agent && <div className="break-all">User agent: {lead.user_agent}</div>}
                </div>
              </details>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-sm font-semibold">Manage</h2>

              <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="spam">Spam</option>
              </select>

              <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Assigned owner
              </label>
              <input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Name or email"
                className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-foreground/40"
              />

              <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Internal notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="Only visible to admins…"
                className="mt-1 w-full resize-none rounded-2xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-foreground/40"
              />

              <button
                onClick={() => saveMut.mutate()}
                disabled={saveMut.isPending}
                className="btn-primary mt-5 w-full !py-2 !text-sm"
              >
                {saveMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : savedAt && Date.now() - savedAt < 2500 ? (
                  <>
                    <Check className="h-4 w-4" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save changes
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Quick actions</div>
              <div className="mt-2 flex flex-col gap-2">
                <a
                  href={`mailto:${lead.email}?subject=${encodeURIComponent(
                    lead.subject || "Following up on your enquiry",
                  )}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-foreground hover:-translate-y-0.5 hover:shadow"
                >
                  <Mail className="h-3.5 w-3.5" /> Reply by email
                </a>
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-foreground hover:-translate-y-0.5 hover:shadow"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call {lead.phone}
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Info({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}
