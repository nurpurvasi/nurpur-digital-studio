import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Eyebrow, Section } from "./Layout";
import { services } from "./data";
import { siteContent } from "@/content/site";
import { AddPlaceholder } from "./AddPlaceholder";

export function ServicesGrid({ limit }: { limit?: number }) {
  const items = limit ? services.slice(0, limit) : services;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <article
          key={s.title}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(30,40,90,0.25)]"
        >
          <div
            className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            <s.icon className="h-5 w-5" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
        </article>
      ))}
    </div>
  );
}

export function ProjectsGrid({ limit }: { limit?: number }) {
  const all = siteContent.portfolio;
  const items = limit ? all.slice(0, limit) : all;

  if (items.length === 0) {
    const count = limit ?? 6;
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={i % 3 === 0 ? "md:col-span-2" : ""}>
            <AddPlaceholder label="Add Portfolio Project" minHeight="280px" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((p, i) => (
        <a
          key={p.title + i}
          href={p.href ?? "#"}
          className={`group relative overflow-hidden rounded-[28px] border border-border bg-card ${
            i % 3 === 0 ? "md:col-span-2" : ""
          }`}
        >
          <div className="aspect-[16/10] w-full overflow-hidden">
            {p.image ? (
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <div
                className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]"
                style={{ background: p.gradient ?? "var(--gradient-brand)" }}
              />
            )}
          </div>
          <div className="flex items-center justify-between gap-4 p-6">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {p.tag} · {p.year}
              </p>
              <h3 className="mt-1 truncate text-lg font-semibold">{p.title}</h3>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background transition-colors group-hover:bg-accent">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}

export function ContactCTA() {
  return (
    <Section>
      <div
        className="relative overflow-hidden rounded-[32px] p-10 sm:p-16"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Let's build</p>
            <h2
              className="mt-3 text-4xl font-semibold leading-[1.05] text-white sm:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Have a project in mind?
            </h2>
            <p className="mt-4 max-w-lg text-white/80">
              Tell us about your brand, timeline and ambition. We'll come back with a plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
            >
              Start a project <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              View portfolio
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
