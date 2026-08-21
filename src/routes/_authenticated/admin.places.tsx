import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionManager, type FieldDef } from "@/components/admin/CollectionManager";
import { deletePlace, listAdminPlaces, upsertPlace } from "@/lib/portal.functions";
import type { Place } from "@/lib/portal-types";

export const Route = createFileRoute("/_authenticated/admin/places")({
  head: () => ({
    meta: [
      { title: "Nurpur Places — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPlacesPage,
});

const FIELDS: FieldDef[] = [
  { key: "name", label: "Place name", kind: "text", placeholder: "Nurpur Fort" },
  { key: "slug", label: "URL slug", kind: "text", help: "Leave blank to auto-generate" },
  { key: "category", label: "Category", kind: "text", placeholder: "Heritage, Temple, Nature" },
  { key: "location", label: "Location", kind: "text", placeholder: "Nurpur, Kangra" },
  { key: "map_url", label: "Google Maps link", kind: "url", full: true },
  { key: "cover_image", label: "Cover image URL", kind: "image", full: true },
  { key: "description", label: "Description", kind: "textarea" },
  { key: "seo_title", label: "SEO title", kind: "text" },
  { key: "seo_description", label: "SEO description", kind: "textarea" },
  { key: "featured", label: "Featured place", kind: "switch" },
];

const EMPTY = {
  name: "",
  slug: "",
  category: "",
  cover_image: "",
  gallery: [],
  description: "",
  location: "",
  map_url: "",
  featured: false,
  status: "draft",
  sort_order: 0,
  seo_title: "",
  seo_description: "",
} as unknown as Place;

function AdminPlacesPage() {
  const load = useServerFn(listAdminPlaces);
  const save = useServerFn(upsertPlace);
  const del = useServerFn(deletePlace);

  return (
    <AdminShell
      title="Nurpur Places"
      description="Landmarks, temples and viewpoints featured in Explore Nurpur."
    >
      <CollectionManager<Place>
        queryKey="admin-places"
        load={() => load()}
        save={(row) => save({ data: row as never })}
        remove={(id) => del({ data: { id } })}
        fields={FIELDS}
        empty={EMPTY}
        subtitleKey="category"
        addLabel="Add place"
      />
    </AdminShell>
  );
}
