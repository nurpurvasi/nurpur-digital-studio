import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { ContactCTA } from "@/components/site/Sections";
import { Reveal } from "@/components/site/Reveal";
import { AddPlaceholder } from "@/components/site/AddPlaceholder";
import { siteContent } from "@/content/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Gaurav Bharti — NurpurVasi Digitals" },
      {
        name: "description",
        content:
          "NurpurVasi Digitals is led by Gaurav Bharti — a senior designer and engineer building premium digital experiences.",
      },
      { property: "og:title", content: "About — NurpurVasi Digitals" },
      {
        property: "og:description",
        content: "Led by Gaurav Bharti. A senior studio for premium digital experiences.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <Reveal variant="up">
            <Eyebrow>About the studio</Eyebrow>
            <h1
              className="mt-5 text-5xl font-normal tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              A studio led by <span className="text-gradient italic">Gaurav Bharti</span>.
            </h1>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                NurpurVasi Digitals is a small, senior studio focused on one thing: shipping
                premium digital work that feels effortless to use and unmistakably crafted.
              </p>
              <p>
                Over the last decade Gaurav has designed and built websites, products and
                brand systems for founders, agencies and enterprise teams around the world.
              </p>
              <p>
                We work with a handful of partners at a time so every project gets the care,
                depth and pace it deserves.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {siteContent.stats.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Reveal key={i} delay={i * 80} variant="up">
                      <AddPlaceholder label="Add Statistic" minHeight="88px" />
                    </Reveal>
                  ))
                : siteContent.stats.map((s, i) => (
                    <Reveal key={s.label} delay={i * 80} variant="up">
                      <div className="group flex items-center gap-4 rounded-2xl border border-border bg-white/70 p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-25px_color-mix(in_oklab,var(--royal)_35%,transparent)]">
                        <span
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white text-sm font-semibold"
                          style={{ background: "var(--gradient-brand)", fontFamily: "var(--font-display)" }}
                        >
                          {(s.suffix ?? "").slice(0, 1) || "·"}
                        </span>
                        <div className="min-w-0">
                          <p
                            className="text-2xl font-normal tracking-tight"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {s.value}
                            {s.suffix ?? ""}
                          </p>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.label}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
            </div>
          </Reveal>

          <Reveal variant="scale" delay={120}>
            <div
              className="relative overflow-hidden rounded-[32px] border border-border bg-white/70 p-3 backdrop-blur-xl"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px]">
                <div
                  className="absolute inset-0"
                  style={{ background: "var(--gradient-brand)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(600px 400px at 30% 20%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(400px 300px at 80% 90%, rgba(255,255,255,0.15), transparent 60%)",
                  }}
                />
                <div className="absolute inset-x-5 bottom-5">
                  <div className="glass flex items-center gap-4 rounded-2xl p-4">
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-white text-sm font-semibold"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      GB
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">Gaurav Bharti</p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Founder · Design & Engineering
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="mt-6 glass rounded-3xl p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Principles</p>
              <ul className="mt-6 space-y-5">
                {[
                  { t: "Detail is the design", d: "Micro-interactions, spacing, typography — the details are the product." },
                  { t: "Speed as a feature", d: "Beautiful and fast. Premium never means sluggish." },
                  { t: "Long-term partnership", d: "We stay involved after launch to keep the work sharp." },
                ].map((p) => (
                  <li key={p.t}>
                    <p className="text-sm font-semibold">{p.t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </Reveal>
        </div>
      </Section>
      <ContactCTA />
    </SiteLayout>
  );
}
