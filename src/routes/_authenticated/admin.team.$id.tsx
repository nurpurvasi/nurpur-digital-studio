import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Loader2, Sparkles, UserRound } from "lucide-react";
import { getIsAdmin } from "@/lib/cms.functions";
import {
  getAdminTeamMember,
  upsertTeamMember,
  type TeamMember,
  type TeamSocialLinks,
} from "@/lib/team.functions";
import { MediaField } from "@/components/site/inline-editor/MediaField";

export const Route = createFileRoute("/_authenticated/admin/team/$id")({
  head: () => ({
    meta: [
      { title: "Team editor" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminTeamEditor,
});

type Draft = {
  id?: string;
  name: string;
  designation: string;
  bio: string;
  profile_image: string;
  email: string;
  phone: string;
  social_links: Required<TeamSocialLinks>;
  featured: boolean;
  sort_order: number;
  status: "draft" | "published";
  publish_date: string | null;
  seo_title: string;
  seo_description: string;
};

const EMPTY: Draft = {
  name: "",
  designation: "",
  bio: "",
  profile_image: "",
  email: "",
  phone: "",
  social_links: { instagram: "", linkedin: "", facebook: "", x: "" },
  featured: false,
  sort_order: 0,
  status: "draft",
  publish_date: null,
  seo_title: "",
  seo_description: "",
};

function fromRow(t: TeamMember): Draft {
  const s = (t.social_links ?? {}) as TeamSocialLinks;
  return {
    id: t.id,
    name: t.name,
    designation: t.designation,
    bio: t.bio,
    profile_image: t.profile_image,
    email: t.email,
    phone: t.phone,
    social_links: {
      instagram: s.instagram ?? "",
      linkedin: s.linkedin ?? "",
      facebook: s.facebook ?? "",
      x: s.x ?? "",
    },
    featured: t.featured,
    sort_order: t.sort_order,
    status: t.status,
    publish_date: t.publish_date,
    seo_title: t.seo_title,
    seo_description: t.seo_description,
  };
}

function AdminTeamEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const checkAdmin = useServerFn(getIsAdmin);
  const load = useServerFn(getAdminTeamMember);
  const save = useServerFn(upsertTeamMember);

  const admin = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });
  const existing = useQuery({
    queryKey: ["team-admin", id],
    queryFn: () => load({ data: { id } }),
    enabled: !isNew && !!admin.data?.isAdmin,
  });

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const initialized = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew && !initialized.current) {
      setDraft(EMPTY);
      initialized.current = true;
      return;
    }
    if (existing.data?.item && !initialized.current) {
      setDraft(fromRow(existing.data.item));
      initialized.current = true;
    }
  }, [existing.data, isNew]);

  const patch = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };
  const patchSocial = (k: keyof TeamSocialLinks, v: string) => {
    setDraft((d) => ({ ...d, social_links: { ...d.social_links, [k]: v } }));
    setDirty(true);
  };

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!dirty || isNew) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      setError(null);
      try {
        await save({ data: draft });
        setSavedAt(new Date());
        setDirty(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    }, 1200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, dirty, isNew, save]);

  const saveMut = useMutation({
    mutationFn: async (overrides?: Partial<Draft>) => save({ data: { ...draft, ...overrides } }),
    onSuccess: (res) => {
      if (res?.item) {
        setDraft(fromRow(res.item));
        setSavedAt(new Date());
        setDirty(false);
        if (isNew) {
          navigate({ to: "/admin/team/$id", params: { id: res.item.id }, replace: true });
        }
      }
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Save failed"),
  });

  if (admin.isLoading)
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  if (!admin.data?.isAdmin)
    return <div className="grid min-h-screen place-items-center">Access denied</div>;
  if (!isNew && existing.isLoading)
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );

  const handleSave = (overrides?: Partial<Draft>) => {
    if (!draft.name.trim()) {
      setError("Name is required");
      return;
    }
    setError(null);
    saveMut.mutate(overrides);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link to="/admin/team" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                {isNew ? "New team member" : "Edit team member"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Team
              </div>
            </div>
          </Link>
          <div className="ml-4 hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground md:flex">
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
              </>
            ) : dirty ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Unsaved changes
              </>
            ) : savedAt ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" /> Saved
              </>
            ) : (
              <>Autosave on</>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => handleSave()}
              disabled={saveMut.isPending}
              className="rounded-full border border-border bg-white px-4 py-2 text-xs font-medium hover:-translate-y-0.5 hover:shadow-md"
            >
              Save draft
            </button>
            <button
              onClick={() =>
                handleSave({
                  status: "published",
                  publish_date: draft.publish_date || new Date().toISOString(),
                })
              }
              disabled={saveMut.isPending}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              {saveMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {draft.status === "published" ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card title="Profile">
            <Field label="Name">
              <input
                value={draft.name}
                onChange={(e) => patch("name", e.target.value)}
                placeholder="Gaurav Bharti"
                className="inp"
              />
            </Field>
            <Field label="Designation">
              <input
                value={draft.designation}
                onChange={(e) => patch("designation", e.target.value)}
                placeholder="Founder & Creative Director"
                className="inp"
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={draft.bio}
                onChange={(e) => patch("bio", e.target.value)}
                rows={6}
                placeholder="Short professional introduction…"
                className="inp"
              />
            </Field>
            <Field label="Profile image">
              <MediaField
                value={draft.profile_image}
                onChange={(v) => patch("profile_image", v)}
                accept="image"
              />
            </Field>
          </Card>

          <Card title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <input
                  value={draft.email}
                  onChange={(e) => patch("email", e.target.value)}
                  placeholder="name@example.com"
                  className="inp"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={draft.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="+91 00000 00000"
                  className="inp"
                />
              </Field>
            </div>
          </Card>

          <Card title="Social links">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram">
                <input
                  value={draft.social_links.instagram}
                  onChange={(e) => patchSocial("instagram", e.target.value)}
                  placeholder="https://instagram.com/…"
                  className="inp"
                />
              </Field>
              <Field label="LinkedIn">
                <input
                  value={draft.social_links.linkedin}
                  onChange={(e) => patchSocial("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/…"
                  className="inp"
                />
              </Field>
              <Field label="Facebook">
                <input
                  value={draft.social_links.facebook}
                  onChange={(e) => patchSocial("facebook", e.target.value)}
                  placeholder="https://facebook.com/…"
                  className="inp"
                />
              </Field>
              <Field label="X">
                <input
                  value={draft.social_links.x}
                  onChange={(e) => patchSocial("x", e.target.value)}
                  placeholder="https://x.com/…"
                  className="inp"
                />
              </Field>
            </div>
          </Card>

          <Card title="SEO">
            <Field label="SEO title">
              <input
                value={draft.seo_title}
                onChange={(e) => patch("seo_title", e.target.value)}
                className="inp"
              />
            </Field>
            <Field label="SEO description">
              <textarea
                value={draft.seo_description}
                onChange={(e) => patch("seo_description", e.target.value)}
                rows={3}
                className="inp"
              />
            </Field>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Publishing">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Featured</span>
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => patch("featured", e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <Field label="Sort order">
              <input
                type="number"
                value={draft.sort_order}
                onChange={(e) => patch("sort_order", Number(e.target.value) || 0)}
                className="inp"
              />
            </Field>
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(e) => patch("status", e.target.value as Draft["status"])}
                className="inp"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}
          </Card>

          <Card title="Live preview">
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="aspect-[4/5] bg-muted">
                {draft.profile_image ? (
                  <img
                    src={draft.profile_image}
                    alt={draft.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground">
                    <UserRound className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold">{draft.name || "Team member name"}</div>
                <div className="text-xs text-muted-foreground">
                  {draft.designation || "Designation"}
                </div>
                {draft.bio && (
                  <p className="mt-2 line-clamp-4 text-xs text-muted-foreground">{draft.bio}</p>
                )}
              </div>
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
