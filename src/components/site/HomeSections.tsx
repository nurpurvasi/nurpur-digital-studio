import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  LineChart,
  Palette,
  Rocket,
  Search,
  Smartphone,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import { Eyebrow, Section } from "./Layout";
import { Reveal } from "./Reveal";
import { AddPlaceholder } from "./AddPlaceholder";
import { useSiteContent } from "@/content/SiteContentContext";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicProjects, type PortfolioProject } from "@/lib/portfolio.functions";
import { listFeaturedTestimonials, type Testimonial } from "@/lib/testimonials.functions";

/* ---------------- Stats ---------------- */

function useCountUp(target: number, run: boolean, duration = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return n;
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.3 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const siteContent = useSiteContent();
  const stats = siteContent.stats;
  const showPlaceholders = stats.length === 0;
  const placeholderCount = 4;

  return (
    <Section className="!py-16 sm:!py-20">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-[32px] border border-border bg-white/70 p-8 backdrop-blur-xl sm:p-12"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(600px 200px at 10% 0%, color-mix(in oklab, var(--royal) 14%, transparent), transparent 60%), radial-gradient(600px 200px at 90% 100%, color-mix(in oklab, var(--purple) 14%, transparent), transparent 60%)",
          }}
        />
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {showPlaceholders
            ? Array.from({ length: placeholderCount }).map((_, i) => (
                <AddPlaceholder key={i} label="Add Statistic" minHeight="140px" />
              ))
            : stats.map((s) => (
                <StatItem
                  key={s.label}
                  run={inView}
                  value={s.value}
                  suffix={s.suffix ?? ""}
                  label={s.label}
                />
              ))}
        </div>
      </div>
    </Section>
  );
}

function StatItem({ value, suffix, label, run }: { value: number; suffix: string; label: string; run: boolean }) {
  const n = useCountUp(value, run);
  return (
    <div className="text-center sm:text-left">
      <p
        className="text-5xl font-normal tracking-tight sm:text-6xl text-gradient"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {n}
        {suffix}
      </p>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---------------- Services ---------------- */

const services = [
  { icon: Palette, title: "Website Design", desc: "Cinematic, brand-first interfaces designed to feel unmistakably premium.", tag: "Design" },
  { icon: Code2, title: "Development", desc: "Production-grade builds with buttery motion, blazing performance and clean code.", tag: "Engineering" },
  { icon: Search, title: "SEO Growth", desc: "Technical SEO, content strategy and Core Web Vitals tuned for organic growth.", tag: "Growth" },
  { icon: Smartphone, title: "Mobile Experiences", desc: "Mobile-first, fluid layouts and gestures that feel native on every device.", tag: "Mobile" },
  { icon: LineChart, title: "Analytics & CRO", desc: "Instrumented insights and conversion experiments that compound over time.", tag: "Insights" },
  { icon: Rocket, title: "Digital Solutions", desc: "End-to-end brand, marketing sites, dashboards and bespoke digital products.", tag: "Product" },
];

export function ServicesSection() {
  return (
    <Section id="services">
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>What we do</Eyebrow>
        <h2
          className="mt-5 text-4xl font-normal tracking-tight sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Services engineered for <span className="text-gradient italic">premium brands</span>.
        </h2>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          A focused studio offering the full stack of digital craft — from brand to shipped product.
        </p>
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 80}>
            <article
              className="group relative h-full overflow-hidden rounded-3xl border border-border bg-white p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_40px_80px_-30px_color-mix(in_oklab,var(--navy)_30%,transparent)]"
              style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset" }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(400px 200px at 50% 0%, color-mix(in oklab, var(--royal) 10%, transparent), transparent 70%)",
                }}
              />
              <div
                className="absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "var(--gradient-brand)" }}
              />
              <div className="relative flex items-start justify-between">
                <div
                  className="grid h-14 w-14 place-items-center rounded-2xl text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-elegant)" }}
                >
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {s.tag}
                </span>
              </div>
              <h3 className="relative mt-7 text-xl font-semibold">{s.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span className="relative">
                  Learn more
                  <span
                    className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                    style={{ background: "var(--gradient-brand)" }}
                  />
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Featured Portfolio ---------------- */

export function FeaturedPortfolio() {
  const load = useServerFn(listPublicProjects);
  const { data } = useQuery<{ projects: PortfolioProject[] }>({
    queryKey: ["public-portfolio"],
    queryFn: () => load(),
    initialData: { projects: [] },
    staleTime: 60_000,
  });
  const all: PortfolioProject[] = data?.projects ?? [];
  const featured = all.filter((p) => p.featured);
  const projects = (featured.length > 0 ? featured : all).slice(0, 4);
  const showPlaceholders = projects.length === 0;
  const spanFor = (i: number) =>
    i === 0 ? "md:col-span-4" : i === 1 ? "md:col-span-2" : i === 2 ? "md:col-span-2" : "md:col-span-4";

  return (
    <Section className="!max-w-none bg-surface/70">
      <div className="container-x !px-0">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow>Featured work</Eyebrow>
            <h2
              className="mt-5 text-4xl font-normal tracking-tight sm:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Crafted with <span className="text-gradient italic">obsessive care</span>.
            </h2>
          </div>
          <Link to="/portfolio" className="btn-ghost">
            View all work <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-6">
          {showPlaceholders
            ? Array.from({ length: 4 }).map((_, i) => (
                <Reveal key={i} delay={i * 100} className={spanFor(i)}>
                  <AddPlaceholder label="Add Portfolio Project" minHeight="320px" />
                </Reveal>
              ))
            : projects.map((p, i) => (
                <Reveal key={p.id} delay={i * 100} className={spanFor(i)}>
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: p.slug }}
                    className="group relative block overflow-hidden rounded-[28px] border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_40px_80px_-30px_color-mix(in_oklab,var(--navy)_35%,transparent)]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      {p.cover_image ? (
                        <img
                          src={p.cover_image}
                          alt={p.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]"
                          style={{ background: "var(--gradient-brand)" }}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4 bg-white p-6">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {[p.category, p.client].filter(Boolean).join(" · ")}
                        </p>
                        <h3 className="mt-1.5 truncate text-lg font-semibold">{p.title}</h3>
                      </div>
                      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-background transition-all duration-500 group-hover:border-transparent group-hover:text-white">
                        <span
                          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          style={{ background: "var(--gradient-brand)" }}
                        />
                        <ArrowUpRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Process Timeline ---------------- */

const steps = [
  { n: "01", title: "Discover", desc: "We deep-dive into your brand, audience and goals to uncover the real problem worth solving." },
  { n: "02", title: "Design", desc: "Cinematic concepts, typography systems and pixel-precise interfaces designed to feel premium." },
  { n: "03", title: "Develop", desc: "Production-grade builds with buttery motion, blazing performance and clean, scalable code." },
  { n: "04", title: "Launch & Grow", desc: "Ship confidently, then compound results through SEO, analytics and conversion experiments." },
];

export function ProcessSection() {
  return (
    <Section id="process">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <Eyebrow>Our process</Eyebrow>
          <h2
            className="mt-5 text-4xl font-normal tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A calm, deliberate <span className="text-gradient italic">craft process</span>.
          </h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            Four focused phases. No fluff, no busywork — just deep work that ships beautifully.
          </p>
        </div>

        <ol className="relative space-y-8">
          <span
            aria-hidden
            className="absolute left-[27px] top-2 bottom-2 w-px"
            style={{ background: "linear-gradient(180deg, var(--royal), var(--purple), transparent)" }}
          />
          {steps.map((s) => (
            <li key={s.n} className="group relative flex gap-6">
              <span
                className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white text-sm font-semibold transition-transform duration-500 group-hover:scale-110"
                style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-elegant)", fontFamily: "var(--font-display)" }}
              >
                {s.n}
              </span>
              <div className="pt-1">
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 max-w-xl text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ---------------- Testimonials ---------------- */

export function TestimonialsSection() {
  const siteContent = useSiteContent();
  const load = useServerFn(listFeaturedTestimonials);
  const { data } = useQuery({
    queryKey: ["testimonials-featured"],
    queryFn: () => load(),
    staleTime: 60_000,
  });

  type Item = {
    key: string;
    quote: string;
    name: string;
    role: string;
    avatar?: string;
    rating: number;
    logo?: string;
  };

  const fromDb: Item[] = (data?.testimonials ?? []).map((t: Testimonial) => ({
    key: t.id,
    quote: t.testimonial,
    name: t.client_name,
    role: [t.designation, t.company].filter(Boolean).join(" · "),
    avatar: t.client_photo || undefined,
    rating: t.rating,
    logo: t.company_logo || undefined,
  }));
  const fromSite: Item[] = siteContent.testimonials.map((t, i) => ({
    key: (t.id ?? "s") + i,
    quote: t.quote,
    name: t.name,
    role: t.role,
    avatar: t.avatar,
    rating: 5,
  }));
  const items: Item[] = fromDb.length ? fromDb : fromSite;
  const showPlaceholders = items.length === 0;

  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>Client love</Eyebrow>
        <h2
          className="mt-5 text-4xl font-normal tracking-tight sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Kind words from <span className="text-gradient italic">brilliant people</span>.
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {showPlaceholders
          ? Array.from({ length: 3 }).map((_, i) => (
              <Reveal key={i} delay={i * 120}>
                <AddPlaceholder label="Add Testimonial" minHeight="280px" />
              </Reveal>
            ))
          : items.map((t, i) => {
              const initials = t.name
                .split(" ")
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <Reveal key={t.key} delay={i * 120}>
                  <figure
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_40px_80px_-30px_color-mix(in_oklab,var(--navy)_30%,transparent)]"
                    style={{
                      boxShadow:
                        "0 1px 0 rgba(255,255,255,0.7) inset, 0 20px 40px -30px color-mix(in oklab, var(--navy) 25%, transparent)",
                    }}
                  >
                    <div
                      className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl transition-opacity duration-700 group-hover:opacity-50"
                      style={{ background: "var(--gradient-brand)" }}
                    />
                    <span
                      aria-hidden
                      className="absolute right-6 top-4 select-none text-[80px] leading-none opacity-10"
                      style={{ fontFamily: "var(--font-display)", color: "var(--royal)" }}
                    >
                      &ldquo;
                    </span>
                    <div className="flex gap-1 text-[color:var(--royal)]">
                      {Array.from({ length: t.rating }).map((_, k) => (
                        <Star key={k} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <blockquote className="relative mt-5 text-[15px] leading-relaxed text-foreground/90">
                      "{t.quote}"
                    </blockquote>
                    <figcaption className="relative mt-7 flex items-center gap-4 border-t border-border pt-5">
                      <span className="relative">
                        <span
                          aria-hidden
                          className="absolute -inset-[3px] rounded-full opacity-70 blur-[2px]"
                          style={{ background: "var(--gradient-brand)" }}
                        />
                        {t.avatar ? (
                          <img
                            src={t.avatar}
                            alt={t.name}
                            loading="lazy"
                            className="relative h-12 w-12 rounded-full object-cover ring-2 ring-white"
                          />
                        ) : (
                          <span
                            className="relative grid h-12 w-12 place-items-center rounded-full text-sm font-semibold text-white ring-2 ring-white"
                            style={{ background: "var(--gradient-brand)" }}
                          >
                            {initials || "·"}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{t.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                      </div>
                      {t.logo && (
                        <img
                          src={t.logo}
                          alt=""
                          loading="lazy"
                          className="h-7 max-w-[70px] object-contain opacity-80"
                        />
                      )}
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
      </div>
    </Section>
  );
}


/* ---------------- FAQ ---------------- */

export function FAQSection() {
  const siteContent = useSiteContent();
  const faqs = siteContent.faqs;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2
            className="mt-5 text-4xl font-normal tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Answers to <span className="text-gradient italic">common questions</span>.
          </h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            Still curious? Reach out — we reply to every inquiry personally.
          </p>
          <Link to="/contact" className="btn-ghost mt-8">
            Ask a question <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {faqs.length === 0 ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <AddPlaceholder key={i} label="Add FAQ" minHeight="96px" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border rounded-3xl border border-border bg-white/70 backdrop-blur-xl">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className="px-6 sm:px-8">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="text-base font-semibold sm:text-lg">{f.q}</span>
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background transition-colors"
                      style={isOpen ? { background: "var(--gradient-brand)", color: "white", borderColor: "transparent" } : undefined}
                    >
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div
                    className="grid overflow-hidden transition-all duration-500 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="min-h-0">
                      <p className="pb-6 pr-14 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}

/* ---------------- CTA ---------------- */

export function PremiumCTA() {
  return (
    <Section>
      <div
        className="relative overflow-hidden rounded-[36px] p-10 sm:p-16"
        style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/70">Let's build</p>
            <h2
              className="mt-4 text-4xl font-normal leading-[1.02] text-white sm:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Have a project <span className="italic">in mind?</span>
            </h2>
            <p className="mt-5 max-w-lg text-white/80">
              Tell us about your brand, timeline and ambition. We'll come back with a plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
            >
              Start a project <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              View portfolio
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
