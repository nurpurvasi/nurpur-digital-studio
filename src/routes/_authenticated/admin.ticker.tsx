import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionManager, type FieldDef } from "@/components/admin/CollectionManager";
import { deleteTickerItem, listAdminTicker, upsertTickerItem } from "@/lib/portal.functions";
import type { TickerItem } from "@/lib/portal-types";

export const Route = createFileRoute("/_authenticated/admin/ticker")({
  head: () => ({
    meta: [
      { title: "Breaking Ticker — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminTickerPage,
});

const FIELDS: FieldDef[] = [
  { key: "text", label: "Ticker text", kind: "textarea", placeholder: "Nurpur Mela starts this Friday" },
  { key: "link", label: "Optional link", kind: "url", full: true },
  { key: "start_date", label: "Show from", kind: "date" },
  { key: "end_date", label: "Show until", kind: "date" },
  { key: "active", label: "Active", kind: "switch", full: true },
];

const EMPTY = {
  text: "",
  link: "",
  start_date: "",
  end_date: "",
  active: true,
  sort_order: 0,
} as unknown as TickerItem;

function AdminTickerPage() {
  const load = useServerFn(listAdminTicker);
  const save = useServerFn(upsertTickerItem);
  const del = useServerFn(deleteTickerItem);

  return (
    <AdminShell
      title="Breaking Ticker"
      description="Short headlines that scroll across the top of the homepage."
    >
      <CollectionManager<TickerItem>
        queryKey="admin-ticker"
        load={() => load()}
        save={(row) => save({ data: row as never })}
        remove={(id) => del({ data: { id } })}
        fields={FIELDS}
        empty={EMPTY}
        titleKey="text"
        subtitleKey="link"
        imageKey="__none"
        hasStatus={false}
        addLabel="Add ticker item"
      />
    </AdminShell>
  );
}
