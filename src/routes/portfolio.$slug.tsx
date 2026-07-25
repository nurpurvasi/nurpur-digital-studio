import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { getPublicProject, listPublicProjects, type PortfolioProject } from "@/lib/portfolio.functions";

export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ params }) => {
    const { project } = await getPublicProject({ data: { slug: params.slug } });
    if (!project) throw notFound();
    const { projects } = await listPublicProjects();
    const related = projects
      .filter((p) => p.id !== project.id && (p.category === project.category || project.category === ""))
      .slice(0, 3);
    return { project, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Project not found" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.project;
    const title = p.seo_title || `${p.title} — NurpurVasi Digitals`;
    const desc = p.seo_description || p.short_description || `${p.title} — portfolio project.`;
    const meta: Array<{ title?: string; name?: string; property?: string; content?: string }> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    const img = p.og_image || p.cover_image;
    if (img && /^https?:\/\//.test(img)) {
      meta.push({ property: "og:image", content: img });
      meta.push({ name: "twitter:image", content: img });
    }
    return {
      meta,
      links: p.canonical_url ? [{ rel: "canonical", href: p.canonical_url }] : undefined,
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <Section className="pt-16 text-center">
        <h1 className="text-4xl font-semibold">Project not found</h1>
        <Link to="/portfolio" className="btn-ghost mt-6 inline-flex">Back to portfolio</Link>
      </Section>
    </SiteLayout>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project, related } = Route.useLoaderData() as {
    project: PortfolioProject;
    related: PortfolioProject[];
  };

  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <Reveal variant="up">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All work
          </Link>
          <div className="mt-6 max-w-3xl">
            <Eyebrow>{[project.category, project.client].filter(Boolean).join(" · ") || "Project"}</Eyebrow>
            <h1
              className="mt-5 text-4xl font-normal tracking-tight sm:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {project.title}
            </h1>
            {project.short_description && (
              <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {project.short_description}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {project.website_url && (
                <a
                  href={project.website_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-primary !px-5 !py-2.5 text-sm"
                >
                  Visit site <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {project.completion_date && (
                <span className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-muted-foreground">
                  Completed {new Date(project.completion_date).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                </span>
              )}
            </div>
          </div>
        </Reveal>

        {project.cover_image && (
          <Reveal variant="up" delay={100} className="mt-12 block">
            <div className="overflow-hidden rounded-[28px] border border-border">
              <img src={project.cover_image} alt={project.title} className="w-full object-cover" />
            </div>
          </Reveal>
        )}

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_280px]">
          <Reveal variant="up" className="block">
            {project.full_description ? (
              <div className="prose prose-neutral max-w-none whitespace-pre-wrap text-base leading-relaxed">
                {project.full_description}
              </div>
            ) : (
              <p className="text-muted-foreground">Project details coming soon.</p>
            )}
          </Reveal>
          <aside className="space-y-5">
            {project.technologies.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Technologies</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <span key={t} className="rounded-full border border-border bg-background px-3 py-1 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.client && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Client</div>
                <div className="mt-2 text-sm font-medium">{project.client}</div>
              </div>
            )}
          </aside>
        </div>

        {project.gallery.length > 0 && (
          <div className="mt-16">
            <Eyebrow>Gallery</Eyebrow>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {project.gallery.map((src, i) => (
                <Reveal key={i} variant="up" delay={i * 60}>
                  <div className="overflow-hidden rounded-[24px] border border-border">
                    <img src={src} alt="" className="w-full object-cover" loading="lazy" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-24">
            <Eyebrow>Related work</Eyebrow>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/portfolio/$slug"
                  params={{ slug: p.slug }}
                  className="group overflow-hidden rounded-[24px] border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(30,40,90,0.25)]"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="h-full w-full" style={{ background: "var(--gradient-brand)" }} />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.category}</p>
                      <h3 className="mt-1 truncate text-sm font-semibold">{p.title}</h3>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
