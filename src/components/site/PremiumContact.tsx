import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, Phone, Instagram, Facebook, Youtube, Plus } from "lucide-react";
import { Eyebrow, Section } from "./Layout";
import { Reveal } from "./Reveal";
import { siteContent } from "@/content/site";

export function PremiumContactSection() {
  const { email, phoneDisplay, phone, location, responseTime } = siteContent.contact;
  const { instagram, facebook, youtube, email: emailLink } = siteContent.socials;

  const contactItems = [
    { Icon: Mail, top: "Email", bottom: email, placeholder: "Add Email" },
    { Icon: Phone, top: "Phone", bottom: phoneDisplay || phone, placeholder: "Add Phone Number" },
    { Icon: MapPin, top: "Studio", bottom: location, placeholder: "Add Address" },
    { Icon: ArrowUpRight, top: "Response", bottom: responseTime, placeholder: "Add Response Time" },
  ];

  const socials = [
    { Icon: Instagram, label: "Instagram", href: instagram },
    { Icon: Facebook, label: "Facebook", href: facebook },
    { Icon: Youtube, label: "YouTube", href: youtube },
    { Icon: Mail, label: "Email", href: emailLink || (email ? `mailto:${email}` : "") },
  ];

  return (
    <Section id="contact-preview">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <Reveal variant="up">
          <Eyebrow>Say hello</Eyebrow>
          <h2
            className="mt-5 text-4xl font-normal tracking-tight sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Let's craft something <span className="text-gradient italic">unforgettable</span>.
          </h2>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            Whether it's a new brand, a website worth remembering or a full digital rethink —
            we'd love to hear the story behind your ambition.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {contactItems.map(({ Icon, top, bottom, placeholder }, i) => (
              <Reveal key={top} delay={i * 80} variant="up">
                <div className="group flex items-start gap-4 rounded-2xl border border-border bg-white/70 p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_20px_50px_-25px_color-mix(in_oklab,var(--royal)_35%,transparent)]">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{top}</p>
                    {bottom ? (
                      <p className="mt-1 truncate text-sm font-semibold">{bottom}</p>
                    ) : (
                      <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        <Plus className="h-3 w-3" style={{ color: "var(--royal)" }} />
                        {placeholder}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Follow the studio</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map(({ Icon, label, href }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="group inline-flex items-center gap-3 rounded-full border border-border bg-white/80 py-2 pl-2 pr-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_16px_40px_-20px_color-mix(in_oklab,var(--royal)_35%,transparent)]"
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-full text-white transition-transform duration-500 group-hover:scale-110"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </a>
                ) : (
                  <span
                    key={label}
                    className="inline-flex items-center gap-3 rounded-full border border-dashed border-border/80 bg-white/60 py-2 pl-2 pr-4 backdrop-blur-xl"
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-full text-white"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">Add {label}</span>
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary group">
              Start a project
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            {email && (
              <a href={`mailto:${email}`} className="btn-ghost">
                Email the studio
              </a>
            )}
          </div>
        </Reveal>

        {/* Right — Map placeholder */}
        <Reveal variant="scale" delay={120}>
          <div
            className="relative overflow-hidden rounded-[32px] border border-border bg-white/70 p-3 backdrop-blur-xl"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.97 0.01 250) 0%, oklch(0.94 0.02 260) 100%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "linear-gradient(color-mix(in oklab, var(--royal) 12%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--royal) 12%, transparent) 1px, transparent 1px)",
                  backgroundSize: "42px 42px",
                }}
              />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 500" fill="none">
                <path d="M-20 120 C 120 80, 240 200, 420 160" stroke="color-mix(in oklab, var(--royal) 35%, transparent)" strokeWidth="10" strokeLinecap="round" opacity="0.35" />
                <path d="M-20 320 C 100 260, 260 380, 420 300" stroke="color-mix(in oklab, var(--purple) 35%, transparent)" strokeWidth="6" strokeLinecap="round" opacity="0.35" />
                <path d="M180 -20 C 220 120, 160 260, 220 520" stroke="color-mix(in oklab, var(--royal) 30%, transparent)" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
              </svg>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(600px 300px at 60% 40%, color-mix(in oklab, var(--royal) 18%, transparent), transparent 60%), radial-gradient(400px 300px at 30% 80%, color-mix(in oklab, var(--purple) 18%, transparent), transparent 60%)",
                }}
              />
              <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <span className="absolute inset-0 -z-10 animate-ping rounded-full opacity-60" style={{ background: "var(--royal)" }} />
                  <span
                    className="grid h-14 w-14 place-items-center rounded-full text-white shadow-2xl"
                    style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-elegant)" }}
                  >
                    <MapPin className="h-5 w-5" />
                  </span>
                </div>
              </div>
              <div className="absolute inset-x-4 bottom-4">
                <div className="glass flex items-center justify-between gap-4 rounded-2xl p-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Studio</p>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {location || "Add studio address"}
                    </p>
                  </div>
                  <a
                    href={siteContent.contact.mapEmbed || "#"}
                    className="group grid h-10 w-10 shrink-0 place-items-center rounded-full text-white transition-transform hover:-translate-y-0.5"
                    style={{ background: "var(--gradient-brand)" }}
                    aria-label="Open map"
                  >
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
