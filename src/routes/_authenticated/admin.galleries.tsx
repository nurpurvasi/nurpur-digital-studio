import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionManager, type FieldDef } from "@/components/admin/CollectionManager";
import {
  deletePhotoGallery,
  listAdminGalleries,
  reorderPhotoGalleries,
  upsertPhotoGallery,
} from "@/lib/portal.functions";
import type { PhotoGallery } from "@/lib/portal-types";

export const Route = createFileRoute("/_authenticated/admin/galleries")({
  head: () => ({
    meta: [
      { title: "Photo Galleries — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminGalleriesPage,
});

const FIELDS: FieldDef[] = [
  { key: "name", label: "Gallery name", kind: "text", placeholder: "Nurpur Fort Winter Shoot" },
  { key: "slug", label: "URL slug", kind: "text", help: "Leave blank to auto-generate" },
  { key: "category", label: "Category", kind: "text", placeholder: "Culture, Mela, Nature" },
  { key: "location", label: "Location", kind: "text", placeholder: "Nurpur, Himachal Pradesh" },
  { key: "event_date", label: "Date", kind: "date" },
  { key: "cover_image", label: "Cover image URL", kind: "image", full: true, help: "Copy a URL from the Media Library" },
  { key: "description", label: "Description", kind: "textarea" },
  { key: "seo_title", label: "SEO title", kind: "text" },
  { key: "seo_description", label: "SEO description", kind: "textarea" },
  { key: "featured", label: "Featured gallery", kind: "switch" },
];

const EMPTY = {
  name: "",
  slug: "",
  category: "",
  cover_image: "",
  description: "",
  location: "",
  event_date: "",
  featured: false,
  status: "draft",
  sort_order: 0,
  seo_title: "",
  seo_description: "",
} as unknown as PhotoGallery;

function AdminGalleriesPage() {
  const load = useServerFn(listAdminGalleries);
  const save = useServerFn(upsertPhotoGallery);
  const del = useServerFn(deletePhotoGallery);
  const reorder = useServerFn(reorderPhotoGalleries);

  return (
    <AdminShell
      title="Photo Galleries"
      description="Group photos into albums — melas, festivals, landmarks and shoots."
    >
      <CollectionManager<PhotoGallery>
        queryKey="admin-photo-galleries"
        load={() => load()}
        save={(row) => save({ data: row as never })}
        remove={(id) => del({ data: { id } })}
        reorder={(items) => reorder({ data: { items } })}
        fields={FIELDS}
        empty={EMPTY}
        subtitleKey="category"
        addLabel="Add gallery"
      />
    </AdminShell>
  );
}
