import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, Youtube, Plus } from "lucide-react";
import { useSiteContent } from "@/content/SiteContentContext";

export function Footer() {
  const siteContent = useSiteContent();
  const { email, location } = siteContent.contact;
  const { instagram, facebook, youtube, linkedin, email: emailLink } = siteContent.socials;
  const { privacyUrl, termsUrl } = siteContent.footer;

  const socials = [
    { Icon: Instagram, label: "Instagram", href: instagram },
    { Icon: Facebook, label: "Facebook", href: facebook },
    { Icon: Youtube, label: "YouTube", href: youtube },
    { Icon: Linkedin, label: "LinkedIn", href: linkedin },
    { Icon: Mail, label: "Email", href: emailLink || (email ? `mailto:${email}` : "") },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-surface/60">
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full opacity-50 blur-[120px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--royal) 25%, transparent), transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full opacity-50 blur-[120px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--purple) 22%, transparent), transparent 60%)" }}
      />

      <div className="container-x relative py-20">
        <div className="grid gap-8 rounded-[28px] border border-border bg-white/70 p-8 backdrop-blur-xl sm:p-10 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Nurpur updates</p>
            <h3
              className="mt-3 text-3xl font-normal tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Stories & photos from <span className="text-gradient italic">Nurpur</span>.
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

        <div className="mt-16 grid gap-12 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              {siteContent.theme.footerLogo || siteContent.brand.logo ? (
                <img src={siteContent.theme.footerLogo || siteContent.brand.logo} alt={`${siteContent.brand.name} logo`} className="h-10 w-10 rounded-2xl object-contain" />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-2xl text-sm font-bold text-white" style={{ background: "var(--gradient-brand)" }}>
                  {siteContent.brand.initial}
                </span>
              )}
              <span className="text-base font-semibold tracking-tight">{siteContent.brand.name}</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A local media portal for Nurpur, Kangra — photos, videos, reels, places, local news,
              events and live weather.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" style={{ color: "var(--royal)" }} />
                {email || <span className="inline-flex items-center gap-1"><Plus className="h-3 w-3" />Add Email</span>}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" style={{ color: "var(--royal)" }} />
                {location || <span className="inline-flex items-center gap-1"><Plus className="h-3 w-3" />Add Address</span>}
              </p>
            </div>
          </div>

          <FooterCol
            title="Explore"
            items={[
              { label: "Photos", to: "/photos" },
              { label: "Videos", to: "/videos" },
              { label: "Reels", to: "/reels" },
              { label: "Places", to: "/places" },
            ]}
          />
          <FooterCol
            title="Portal"
            items={[
              { label: "News", to: "/blog" },
              { label: "Business", to: "/business" },
              { label: "Weather", to: "/weather" },
              { label: "About", to: "/about" },
              { label: "Contact", to: "/contact" },
            ]}
          />

          <div>
            <p className="text-sm font-semibold">Follow</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href || "#"}
                  aria-label={href ? label : `Add ${label} link`}
                  className={`group relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border ${href ? "border-border bg-white" : "border-dashed border-border/70 bg-white/60"} transition-all duration-500 hover:-translate-y-0.5 hover:border-transparent hover:text-white`}
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
              {socials.every((s) => !s.href) ? "Add social handles in Home page & branding." : "Follow NurpurVasi Media across platforms."}
            </p>
          </div>
        </div>

        <div className="mt-16 select-none overflow-hidden">
          <p
            className="text-[16vw] leading-none tracking-tight text-transparent sm:text-[13vw]"
            style={{
              fontFamily: "var(--font-display)",
              WebkitTextStroke: "1px color-mix(in oklab, var(--navy) 20%, transparent)",
            }}
          >
            {siteContent.brand.name.split(" ")[0]}.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>{(siteContent.footer.copyright || "").replace("{year}", String(new Date().getFullYear())) || `© ${new Date().getFullYear()} ${siteContent.brand.name}. All rights reserved.`}</p>
          <div className="flex items-center gap-4">
            {privacyUrl && <a href={privacyUrl} className="hover:text-foreground">Privacy</a>}
            {termsUrl && <a href={termsUrl} className="hover:text-foreground">Terms</a>}
            <p className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-brand)" }} />
              {siteContent.footer.tagline || "Nurpur\u2019s local media portal"}
            </p>
          </div>
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
