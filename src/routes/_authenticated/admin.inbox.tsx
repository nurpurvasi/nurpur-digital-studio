import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Archive,
  CornerUpLeft,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getIsAdmin } from "@/lib/cms.functions";
import { deleteLead, listLeads, updateLead, type Lead, type LeadStatus } from "@/lib/leads.functions";

export const Route = createFileRoute("/_authenticated/admin/inbox")({
  head: () => ({
    meta: [
      { title: "Contact Inbox — NurpurVasi Media Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminInbox,
});

/**
 * The inbox reuses the existing `leads` table + status enum.
 * Enum mapping (no database change needed):
 *   new -> Unread | contacted -> Read | in_progress -> Replied | closed -> Archived
 */
const UNREAD: LeadStatus = "new";
const READ: LeadStatus = "contacted";
const REPLIED: LeadStatus = "in_progress";
const ARCHIVED: LeadStatus = "closed";

const TABS: { key: LeadStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: UNREAD, label: "Unread" },
  { key: READ, label: "Read" },
  { key: REPLIED, label: "Replied" },
  { key: ARCHIVED, label: "Archived" },
];

function statusLabel(s: LeadStatus) {
  if (s === UNREAD) return "Unread";
  if (s === READ) return "Read";
  if (s === REPLIED) return "Replied";
  if (s === ARCHIVED) return "Archived";
  return "Spam";
}

function statusTone(s: LeadStatus) {
  if (s === UNREAD) return "bg-blue-100 text-blue-800";
  if (s === READ) return "bg-slate-100 text-slate-700";
  if (s === REPLIED) return "bg-emerald-100 text-emerald-800";
  if (s === ARCHIVED) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

function AdminInbox() {
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const fetchLeads = useServerFn(listLeads);
  const patch = useServerFn(updateLead);
  const remove = useServerFn(deleteLead);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const list = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => fetchLeads(),
    enabled: !!admin.data?.isAdmin,
  });

  const [tab, setTab] = useState<LeadStatus | "all">("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-leads"] });
    void qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: LeadStatus }) => patch({ data: v }),
    onSuccess: invalidate,
  });
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: invalidate,
  });

  const leads: Lead[] = list.data?.leads ?? [];
  const unreadCount = leads.filter((l) => l.status === UNREAD).length;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (tab !== "all" && l.status !== tab) return false;
      if (!needle) return true;
      return [l.name, l.email, l.phone, l.subject, l.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [leads, tab, q]);

  const openMessage = (l: Lead) => {
    const next = openId === l.id ? null : l.id;
    setOpenId(next);
    if (next && l.status === UNREAD) setStatus.mutate({ id: l.id, status: READ });
  };

  if (admin.isLoading) {
    return (
      <AdminShell title="Contact Inbox">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your access…
        </div>
      </AdminShell>
    );
  }
  if (!admin.data?.isAdmin) {
    return (
      <AdminShell title="Contact Inbox">
        <div className="rounded-2xl border bg-background p-8 text-sm">Admin access required.</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Contact Inbox"
      description={`${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => {
            const count =
              t.key === "all" ? leads.length : leads.filter((l) => l.status === t.key).length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  tab === t.key ? "bg-foreground text-background" : "bg-background hover:bg-muted"
                }`}
              >
                {t.label} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2 rounded-full border bg-background px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <label htmlFor="inbox-search" className="sr-only">
              Search messages
            </label>
            <input
              id="inbox-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, message…"
              className="w-44 bg-transparent text-xs outline-none sm:w-64"
            />
          </div>
        </div>

        {list.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading messages…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border bg-background p-10 text-center">
            <Inbox className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No messages here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Messages sent from the public contact form appear in this inbox.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((l) => {
              const open = openId === l.id;
              const isUnread = l.status === UNREAD;
              return (
                <li
                  key={l.id}
                  className={`overflow-hidden rounded-2xl border bg-background ${
                    isUnread ? "border-primary/40" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openMessage(l)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/50"
                  >
                    <span className="mt-0.5 shrink-0">
                      {isUnread ? (
                        <Mail className="h-4 w-4 text-primary" />
                      ) : (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm ${isUnread ? "font-semibold" : "font-medium"}`}>
                          {l.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(l.status)}`}
                        >
                          {statusLabel(l.status)}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {l.email}
                        {l.phone ? ` · ${l.phone}` : ""}
                      </span>
                      {!open && (
                        <span className="mt-1 block truncate text-xs text-foreground/70">
                          {l.message}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()}
                    </span>
                  </button>

                  {open && (
                    <div className="border-t bg-muted/20 px-4 py-4">
                      {l.subject && (
                        <p className="text-sm font-medium">{l.subject}</p>
                      )}
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{l.message}</p>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <a
                          href={`mailto:${l.email}`}
                          className="inline-flex items-center gap-1.5 hover:text-foreground"
                        >
                          <Mail className="h-3.5 w-3.5" /> {l.email}
                        </a>
                        {l.phone && (
                          <a
                            href={`tel:${l.phone}`}
                            className="inline-flex items-center gap-1.5 hover:text-foreground"
                          >
                            <Phone className="h-3.5 w-3.5" /> {l.phone}
                          </a>
                        )}
                        {l.source_page && <span>from {l.source_page}</span>}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={`mailto:${l.email}?subject=${encodeURIComponent(
                            `Re: ${l.subject || "Your message to NurpurVasi Media"}`,
                          )}&body=${encodeURIComponent(`Hi ${l.name},\n\n`)}`}
                          onClick={() => setStatus.mutate({ id: l.id, status: REPLIED })}
                          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                        >
                          <CornerUpLeft className="h-3.5 w-3.5" /> Reply by email
                        </a>
                        <ActionBtn
                          onClick={() =>
                            setStatus.mutate({ id: l.id, status: isUnread ? READ : UNREAD })
                          }
                        >
                          {isUnread ? "Mark read" : "Mark unread"}
                        </ActionBtn>
                        <ActionBtn onClick={() => setStatus.mutate({ id: l.id, status: REPLIED })}>
                          Mark replied
                        </ActionBtn>
                        <ActionBtn onClick={() => setStatus.mutate({ id: l.id, status: ARCHIVED })}>
                          <Archive className="h-3.5 w-3.5" /> Archive
                        </ActionBtn>
                        <ActionBtn
                          danger
                          onClick={() => {
                            if (confirm("Delete this message permanently?")) del.mutate(l.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </ActionBtn>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}

function ActionBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:bg-muted ${
        danger ? "border-red-200 text-red-700 hover:bg-red-50" : "bg-background"
      }`}
    >
      {children}
    </button>
  );
}
