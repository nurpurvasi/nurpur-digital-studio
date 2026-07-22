import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Eyebrow, Section } from "./Layout";
import { projects, services } from "./data";

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

export function ServicesPreview() {
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <Eyebrow>What we do</Eyebrow>
          <h2
            className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Services engineered for <span className="text-gradient">premium brands</span>.
          </h2>
        </div>
        <Link to="/services" className="btn-ghost">
          All services <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-12">
        <ServicesGrid limit={6} />
      </div>
    </Section>
  );
}

export function ProjectsGrid({ limit }: { limit?: number }) {
  const items = limit ? projects.slice(0, limit) : projects;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((p, i) => (
        <a
          key={p.title}
          href="#"
          className={`group relative overflow-hidden rounded-[28px] border border-border bg-card ${
            i % 3 === 0 ? "md:col-span-2" : ""
          }`}
        >
          <div
            className="aspect-[16/10] w-full transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ background: p.gradient }}
          >
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
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

export function PortfolioPreview() {
  return (
    <Section className="bg-surface/60 !max-w-none">
      <div className="container-x !px-0">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow>Selected work</Eyebrow>
            <h2
              className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Crafted with <span className="text-gradient">obsessive care</span>.
            </h2>
          </div>
          <Link to="/portfolio" className="btn-ghost">
            All work <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12">
          <ProjectsGrid limit={3} />
        </div>
      </div>
    </Section>
  );
}

export function AboutPreview() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>About</Eyebrow>
          <h2
            className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Led by <span className="text-gradient">Gaurav Bharti</span>.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            A decade of designing and shipping premium digital experiences for brands that
            care about detail. NurpurVasi Digitals is a small studio with a big standard:
            beautiful, fast, and quietly powerful work.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            {[
              { k: "10+", v: "Years crafting" },
              { k: "80+", v: "Projects shipped" },
              { k: "24", v: "Countries reached" },
            ].map((s) => (
              <div key={s.v}>
                <p
                  className="text-3xl font-semibold text-gradient"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.k}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/about" className="btn-ghost">
              Read the story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            className="aspect-square w-full rounded-[32px]"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div className="glass absolute -bottom-6 left-6 right-6 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Founder</p>
            <p className="mt-1 text-base font-semibold">Gaurav Bharti</p>
            <p className="text-sm text-muted-foreground">Designer · Developer · Strategist</p>
          </div>
        </div>
      </div>
    </Section>
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
