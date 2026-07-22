import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Layered premium gradient backdrop */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(1200px 700px at 12% 8%, color-mix(in oklab, var(--royal) 22%, transparent), transparent 60%), radial-gradient(1000px 600px at 88% 12%, color-mix(in oklab, var(--purple) 20%, transparent), transparent 60%), radial-gradient(900px 500px at 50% 110%, color-mix(in oklab, var(--cyan) 24%, transparent), transparent 60%), linear-gradient(180deg, #ffffff 0%, #f7f8fc 100%)",
        }}
      />
      {/* subtle grid */}
      <div className="absolute inset-0 -z-10 opacity-[0.5] [background-image:radial-gradient(circle_at_1px_1px,rgba(30,40,90,0.07)_1px,transparent_0)] [background-size:26px_26px]" />
      {/* blurred orbs */}
      <div
        className="pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full blur-[120px] opacity-60 -z-10"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--royal) 45%, transparent), transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute -right-40 top-40 h-[520px] w-[520px] rounded-full blur-[120px] opacity-60 -z-10"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--purple) 45%, transparent), transparent 60%)" }}
      />

      {/* Floating glass cards */}
      <FloatingCard className="left-[5%] top-[28%] hidden lg:flex" delay="0s" title="Web Design" sub="Cinematic UI" hue="royal" />
      <FloatingCard className="right-[6%] top-[24%] hidden lg:flex" delay="1.4s" title="SEO Growth" sub="+312% Organic" hue="purple" />
      <FloatingCard className="right-[12%] bottom-[16%] hidden lg:flex" delay="2.8s" title="Development" sub="Blazing Fast" hue="cyan" />
      <FloatingCard className="left-[9%] bottom-[20%] hidden lg:flex" delay="4.2s" title="Analytics" sub="Data-driven" hue="royal" />

      <div className="container-x relative flex min-h-[100svh] flex-col items-center justify-center pt-28 pb-16 text-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--royal)" }} />
            Premium Digital Studio · Est. 2015
          </span>
        </div>

        <h1
          className="mx-auto mt-8 max-w-5xl text-balance text-6xl font-normal leading-[0.98] tracking-tight sm:text-7xl md:text-[104px] animate-fade-up"
          style={{ fontFamily: "var(--font-display)", animationDelay: "0.1s" }}
        >
          Crafting digital <br className="hidden sm:block" />
          experiences that <span className="text-gradient italic">inspire</span>.
        </h1>

        <p
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          NurpurVasi Digitals designs and builds world-class websites, brands and digital
          products for ambitious companies that refuse to look ordinary.
        </p>

        <div
          className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link to="/contact" className="btn-primary group !px-7 !py-3.5 text-[15px]">
            Start your project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/portfolio" className="btn-ghost !px-7 !py-3.5 text-[15px] group">
            <span className="grid h-6 w-6 place-items-center rounded-full" style={{ background: "var(--gradient-brand)" }}>
              <Play className="h-3 w-3 fill-white text-white" />
            </span>
            Watch showreel
          </Link>
        </div>

        {/* Trust bar */}
        <div className="mt-16 w-full animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Trusted by teams at
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {["AURORA", "NORTHWIND", "LUMEN", "ATELIER", "MERIDIAN", "HALCYON"].map((n) => (
              <span
                key={n}
                className="text-sm font-semibold tracking-[0.2em] text-foreground/70"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-border/80 bg-white/40 p-1.5 backdrop-blur">
            <span className="h-2 w-1 animate-scroll-hint rounded-full bg-foreground/60" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  className,
  delay,
  title,
  sub,
  hue,
}: {
  className?: string;
  delay: string;
  title: string;
  sub: string;
  hue: "royal" | "purple" | "cyan";
}) {
  const bg =
    hue === "royal"
      ? "linear-gradient(135deg, var(--royal), var(--navy))"
      : hue === "purple"
        ? "linear-gradient(135deg, var(--purple), var(--royal))"
        : "linear-gradient(135deg, var(--cyan), var(--royal))";
  return (
    <div
      className={`glass absolute z-0 flex items-center gap-3 rounded-2xl p-3 pr-5 animate-float ${className ?? ""}`}
      style={{ animationDelay: delay }}
    >
      <span className="h-10 w-10 rounded-xl shadow-lg" style={{ background: bg }} />
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{sub}</p>
        <p className="text-sm font-semibold">{title}</p>
      </div>
    </div>
  );
}
