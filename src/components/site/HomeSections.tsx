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
import { projects } from "./data";

/* ---------------- Stats ---------------- */

const stats = [
  { value: 120, suffix: "+", label: "Projects delivered" },
  { value: 48, suffix: "", label: "Happy clients" },
  { value: 10, suffix: "y", label: "Years crafting" },
  { value: 24, suffix: "", label: "Countries reached" },
];

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
          {stats.map((s) => (
            <StatItem key={s.label} run={inView} {...s} />
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
        {services.map((s) => (
          <article
            key={s.title}
            className="group relative overflow-hidden rounded-3xl border border-border bg-white p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-transparent"
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: "radial-gradient(400px 200px at 50% 0%, color-mix(in oklab, var(--royal) 10%, transparent), transparent 70%)",
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
              Learn more
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Featured Portfolio ---------------- */

export function FeaturedPortfolio() {
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
          {projects.slice(0, 4).map((p, i) => {
            const span = i === 0 ? "md:col-span-4" : i === 1 ? "md:col-span-2" : i === 2 ? "md:col-span-2" : "md:col-span-4";
            return (
              <a
                key={p.title}
                href="#"
                className={`group relative overflow-hidden rounded-[28px] border border-border bg-card ${span}`}
              >
                <div
                  className="aspect-[16/10] w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  style={{ background: p.gradient }}
                >
                  <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3),transparent_55%)]" />
                </div>
                <div className="flex items-center justify-between gap-4 bg-white p-6">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {p.tag} · {p.year}
                    </p>
                    <h3 className="mt-1.5 truncate text-lg font-semibold">{p.title}</h3>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-background transition-all group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </a>
            );
          })}
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

const testimonials = [
  {
    quote:
      "NurpurVasi elevated our brand to another dimension. The craft, the motion, the details — everything felt like it belonged in a design museum.",
    name: "Aria Chen",
    role: "CMO, Aurora Studio",
    initials: "AC",
  },
  {
    quote:
      "Working with Gaurav is like hiring a small design studio that ships like a big engineering team. Our conversions doubled in eight weeks.",
    name: "Marcus Vale",
    role: "Founder, Northwind",
    initials: "MV",
  },
  {
    quote:
      "The rare studio that treats brand, engineering and SEO as one craft. Beautiful, fast, and quietly powerful — exactly what they promise.",
    name: "Sofia Rey",
    role: "Head of Product, Lumen",
    initials: "SR",
  },
];

export function TestimonialsSection() {
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
        {testimonials.map((t, i) => (
          <figure
            key={t.name}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-white p-8 transition-all duration-500 hover:-translate-y-1"
            style={{
              boxShadow: "0 1px 0 rgba(255,255,255,0.7) inset, 0 20px 40px -30px color-mix(in oklab, var(--navy) 25%, transparent)",
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div
              className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
              style={{ background: "var(--gradient-brand)" }}
            />
            <div className="flex gap-1 text-[color:var(--royal)]">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="relative mt-5 text-[15px] leading-relaxed text-foreground/90">
              "{t.quote}"
            </blockquote>
            <figcaption className="relative mt-7 flex items-center gap-3 border-t border-border pt-5">
              <span
                className="grid h-11 w-11 place-items-center rounded-full text-sm font-semibold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                {t.initials}
              </span>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- FAQ ---------------- */

const faqs = [
  {
    q: "What does a typical project cost?",
    a: "Every engagement is scoped to your goals. Most website projects range from $8k for focused brand sites to $60k+ for large marketing platforms and product experiences.",
  },
  {
    q: "How long until we launch?",
    a: "Focused brand sites ship in 3–5 weeks. Complex marketing platforms and product work typically run 8–14 weeks depending on scope.",
  },
  {
    q: "Do you handle SEO and ongoing growth?",
    a: "Yes. Every site ships tuned for Core Web Vitals and technical SEO. We also partner on content strategy, CRO experiments and analytics as an ongoing retainer.",
  },
  {
    q: "Which technologies do you build with?",
    a: "React, TypeScript, TanStack Start, Tailwind, Framer Motion and Vite. We select tools that produce the fastest, most maintainable result for your project.",
  },
  {
    q: "Can you work with our existing brand?",
    a: "Absolutely. We can extend and elevate an existing identity, or build a new one from scratch — whichever gets you to a world-class result.",
  },
];

export function FAQSection() {
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
            Still curious? Reach out — we reply to every inquiry personally within 24 hours.
          </p>
          <Link to="/contact" className="btn-ghost mt-8">
            Ask a question <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

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
              Tell us about your brand, timeline and ambition. We'll come back with a plan within 24 hours.
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
