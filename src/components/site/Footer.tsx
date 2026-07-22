import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-surface/60">
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full opacity-50 blur-[120px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--royal) 25%, transparent), transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full opacity-50 blur-[120px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--purple) 22%, transparent), transparent 60%)" }}
      />

      <div className="container-x relative py-20">
        {/* Newsletter / CTA strip */}
        <div className="grid gap-8 rounded-[28px] border border-border bg-white/70 p-8 backdrop-blur-xl sm:p-10 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Studio letters</p>
            <h3
              className="mt-3 text-3xl font-normal tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Quiet insights on <span className="text-gradient italic">craft & motion</span>.
            </h3>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-full border border-border bg-white p-1.5 pl-5 shadow-[0_10px_30px_-20px_rgba(30,40,90,0.25)]"
          >
            <input
              type="email"
              placeholder="you@brand.com"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--gradient-brand)" }}
            >
              Subscribe
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </form>
        </div>

        {/* Main grid */}
        <div className="mt-16 grid gap-12 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span
                className="grid h-10 w-10 place-items-center rounded-2xl text-sm font-bold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                N
              </span>
              <span className="text-base font-semibold tracking-tight">NurpurVasi Digitals</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A premium digital studio crafting websites, brands and products for ambitious teams
              that refuse to look ordinary.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" style={{ color: "var(--royal)" }} />
                hello@nurpurvasidigitals.com
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" style={{ color: "var(--royal)" }} />
                India · Working worldwide
              </p>
            </div>
          </div>

          <FooterCol
            title="Studio"
            items={[
              { label: "Services", to: "/services" },
              { label: "Portfolio", to: "/portfolio" },
              { label: "About", to: "/about" },
              { label: "Contact", to: "/contact" },
            ]}
          />
          <FooterCol
            title="Company"
            items={[
              { label: "Process", to: "/" },
              { label: "Careers", to: "/" },
              { label: "Journal", to: "/" },
              { label: "Press", to: "/" },
            ]}
          />

          <div>
            <p className="text-sm font-semibold">Follow</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: Youtube, label: "YouTube" },
                { Icon: Mail, label: "Email" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="group relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border border-border bg-white transition-all duration-500 hover:-translate-y-0.5 hover:border-transparent hover:text-white"
                >
                  <span
                    className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "var(--gradient-brand)" }}
                  />
                  <Icon className="relative h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              @nurpurvasi across every platform.
            </p>
          </div>
        </div>

        {/* Wordmark */}
        <div className="mt-16 select-none overflow-hidden">
          <p
            className="text-[16vw] leading-none tracking-tight text-transparent sm:text-[13vw]"
            style={{
              fontFamily: "var(--font-display)",
              WebkitTextStroke: "1px color-mix(in oklab, var(--navy) 20%, transparent)",
            }}
          >
            NurpurVasi.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} NurpurVasi Digitals. Crafted by Gaurav Bharti.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-brand)" }} />
            Made with care · Premium digital studio
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
        {items.map((it, i) => (
          <li key={`${it.label}-${i}`}>
            <Link
              to={it.to}
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <span className="relative">
                {it.label}
                <span
                  className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                  style={{ background: "var(--gradient-brand)" }}
                />
              </span>
              <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
