import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Eyebrow } from "./Layout";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-bg absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(30,40,90,0.06)_1px,transparent_0)] [background-size:24px_24px]" />

      {/* floating cards */}
      <FloatingCard className="left-[6%] top-[26%] hidden md:block" delay="0s" title="Web Design" hue="royal" />
      <FloatingCard className="right-[7%] top-[22%] hidden md:block" delay="1.5s" title="SEO" hue="purple" />
      <FloatingCard className="right-[14%] bottom-[18%] hidden md:block" delay="3s" title="Development" hue="cyan" />

      <div className="container-x relative pt-16 pb-28 sm:pt-24 sm:pb-40">
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <Eyebrow>
            <Sparkles className="h-3 w-3" /> Premium Digital Studio
          </Eyebrow>

          <h1
            className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl md:text-[88px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-gradient">NurpurVasi</span>
            <br />
            <span className="text-foreground">Digitals</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Premium Website Design · Development · SEO · Digital Solutions crafted for brands that
            want to feel unmistakably world-class.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/portfolio" className="btn-primary group">
              View Portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/contact" className="btn-ghost">
              Get Free Consultation
            </Link>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-border/80 p-1.5">
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
  hue,
}: {
  className?: string;
  delay: string;
  title: string;
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
      className={`glass absolute z-0 rounded-2xl p-3 pr-4 animate-float ${className ?? ""}`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-2.5">
        <span className="h-8 w-8 rounded-xl" style={{ background: bg }} />
        <div className="text-left">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Service</p>
          <p className="text-sm font-medium">{title}</p>
        </div>
      </div>
    </div>
  );
}
