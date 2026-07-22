import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { ContactCTA } from "@/components/site/Sections";

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
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <Eyebrow>About</Eyebrow>
            <h1
              className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              A studio led by <span className="text-gradient">Gaurav Bharti</span>.
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
          </div>

          <aside className="glass rounded-3xl p-8">
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
        </div>
      </Section>
      <ContactCTA />
    </SiteLayout>
  );
}
