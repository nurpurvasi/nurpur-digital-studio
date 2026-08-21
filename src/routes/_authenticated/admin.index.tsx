import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Film,
  Image as ImageIcon,
  Inbox,
  Images,
  Loader2,
  MapPin,
  Megaphone,
  Palette,
  Plus,
  Video,
  Eye,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getIsAdmin } from "@/lib/cms.functions";
import { getAdminOverview } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — NurpurVasi Media Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const checkAdmin = useServerFn(getIsAdmin);
  const loadOverview = useServerFn(getAdminOverview);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => loadOverview(),
    enabled: !!admin.data?.isAdmin,
  });

  if (admin.isLoading) {
    return (
      <AdminShell title="Dashboard">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your access…
        </div>
      </AdminShell>
    );
  }

  if (!admin.data?.isAdmin) {
    return (
      <AdminShell title="Dashboard">
        <div className="rounded-2xl border bg-background p-8">
          <p className="text-sm font-semibold">Admin access required</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This account does not have admin permissions.
          </p>
        </div>
      </AdminShell>
    );
  }

  const d = overview.data;
  const stats = [
    { label: "Photos", value: d?.photos, icon: ImageIcon, to: "/admin/gallery" },
    { label: "Videos", value: d?.videos, icon: Video, to: "/admin/gallery" },
    { label: "Reels", value: d?.reels, icon: Film, to: "/admin/gallery" },
    { label: "Galleries", value: d?.galleries, icon: Images, to: "/admin/galleries" },
    { label: "Places", value: d?.places, icon: MapPin, to: "/admin/places" },
    { label: "Upcoming events", value: d?.upcomingEvents, icon: CalendarDays, to: "/admin/events" },
    { label: "Businesses", value: d?.businesses, icon: Building2, to: "/admin/clients" },
    { label: "Unread messages", value: d?.unreadMessages, icon: Inbox, to: "/admin/leads" },
    { label: "Total views", value: d?.views, icon: Eye, to: "/admin/gallery" },
  ];

  const quick = [
    { label: "Upload photos & videos", to: "/admin/gallery", icon: Plus },
    { label: "Add a reel", to: "/admin/reels", icon: Film },
    { label: "New gallery", to: "/admin/galleries", icon: Images },
    { label: "New event", to: "/admin/events", icon: CalendarDays },
    { label: "Ticker headline", to: "/admin/ticker", icon: Megaphone },
    { label: "Homepage & branding", to: "/admin/studio", icon: Palette },
  ];

  return (
    <AdminShell
      title="Dashboard"
      description="Everything happening on NurpurVasi Media at a glance."
    >
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Quick actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quick.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="group flex items-center gap-3 rounded-2xl border bg-background p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Overview
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <Link
                key={s.label}
                to={s.to}
                className="rounded-2xl border bg-background p-4 shadow-sm transition hover:border-primary/40"
              >
                <s.icon className="h-4 w-4 text-primary" />
                <p className="mt-3 text-2xl font-semibold tabular-nums">
                  {overview.isLoading ? "—" : (s.value ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Recent messages
          </h2>
          <div className="rounded-2xl border bg-background">
            {overview.isLoading ? (
              <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : (d?.recentMessages?.length ?? 0) === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              <ul className="divide-y">
                {d!.recentMessages.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        m.status === "new"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m.status === "new" ? "unread" : m.status}
                    </span>
                    <Link
                      to="/admin/leads/$id"
                      params={{ id: m.id }}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
