import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  CloudSun,
  Film,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  Newspaper,
  Palette,
  Settings,
  Type as TypeIcon,
  Video,
  X,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
type Group = { title: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/studio", label: "Home page & branding", icon: Palette },
    ],
  },
  {
    title: "Photos",
    items: [
      { to: "/admin/galleries", label: "Photo galleries", icon: Images },
      { to: "/admin/gallery", label: "Photos & videos", icon: Video },
    ],
  },
  {
    title: "Videos & reels",
    items: [{ to: "/admin/reels", label: "Reels", icon: Film }],
  },
  {
    title: "Places & business",
    items: [
      { to: "/admin/places", label: "Nurpur places", icon: MapPin },
      { to: "/admin/clients", label: "Business promotions", icon: Building2 },
    ],
  },
  {
    title: "News & events",
    items: [
      { to: "/admin/blog", label: "Blog & news", icon: Newspaper },
      { to: "/admin/events", label: "Events & melas", icon: CalendarDays },
      { to: "/admin/ticker", label: "Breaking ticker", icon: Megaphone },
    ],
  },
  {
    title: "Messages",
    items: [{ to: "/admin/inbox", label: "Contact messages", icon: Inbox }],
  },
  {
    title: "Site settings",
    items: [
      { to: "/admin/typography", label: "Fonts & typography", icon: TypeIcon },
      { to: "/weather", label: "Weather page", icon: CloudSun },
    ],
  },
];

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const nav = (
    <nav className="flex flex-col gap-6 p-4">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active =
                item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
              return (
                <Link
                  key={`${group.title}-${item.to}-${item.label}`}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground/75 hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
      <div className="mt-2 space-y-1 border-t pt-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" /> View website
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r bg-background lg:block">
          <div className="flex items-center gap-2 px-6 py-5">
            <Settings className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold tracking-tight">NurpurVasi Admin</span>
          </div>
          {nav}
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="relative h-full w-72 overflow-y-auto bg-background shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-semibold">NurpurVasi Admin</span>
                <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
              <button
                type="button"
                aria-label="Open menu"
                className="rounded-lg border p-2 lg:hidden"
                onClick={() => setOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
                {description && (
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>
                )}
              </div>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
          </header>
          <div className="px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
