import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionManager, type FieldDef } from "@/components/admin/CollectionManager";
import { deleteEvent, listAdminEvents, upsertEvent } from "@/lib/portal.functions";
import type { PortalEvent } from "@/lib/portal-types";

export const Route = createFileRoute("/_authenticated/admin/events")({
  head: () => ({
    meta: [
      { title: "Events & Melas — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminEventsPage,
});

const FIELDS: FieldDef[] = [
  { key: "name", label: "Event name", kind: "text", placeholder: "Nurpur Mela 2026" },
  { key: "slug", label: "URL slug", kind: "text", help: "Leave blank to auto-generate" },
  { key: "event_date", label: "Date", kind: "date" },
  { key: "event_time", label: "Time", kind: "text", placeholder: "6:00 PM onwards" },
  { key: "location", label: "Location", kind: "text", placeholder: "Nurpur Fort Ground" },
  { key: "category", label: "Category", kind: "text", placeholder: "Mela, Festival, Sports" },
  { key: "map_url", label: "Google Maps link", kind: "url", full: true },
  { key: "cover_image", label: "Cover image URL", kind: "image", full: true },
  { key: "description", label: "Description", kind: "textarea" },
  { key: "seo_title", label: "SEO title", kind: "text" },
  { key: "seo_description", label: "SEO description", kind: "textarea" },
  { key: "featured", label: "Featured event", kind: "switch" },
];

const EMPTY = {
  name: "",
  slug: "",
  cover_image: "",
  event_date: "",
  event_time: "",
  location: "",
  map_url: "",
  description: "",
  category: "",
  featured: false,
  status: "draft",
  sort_order: 0,
  seo_title: "",
  seo_description: "",
} as unknown as PortalEvent;

function AdminEventsPage() {
  const load = useServerFn(listAdminEvents);
  const save = useServerFn(upsertEvent);
  const del = useServerFn(deleteEvent);

  return (
    <AdminShell title="Events & Melas" description="Local events, melas and cultural programmes.">
      <CollectionManager<PortalEvent>
        queryKey="admin-events"
        load={() => load()}
        save={(row) => save({ data: row as never })}
        remove={(id) => del({ data: { id } })}
        fields={FIELDS}
        empty={EMPTY}
        subtitleKey="location"
        addLabel="Add event"
      />
    </AdminShell>
  );
}
