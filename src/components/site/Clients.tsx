import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";
import { Eyebrow, Section } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { listFeaturedClients, type ClientBrand } from "@/lib/clients.functions";

/* ---------------- Single logo tile ---------------- */

export function ClientLogo({
  client,
  showDescription = false,
}: {
  client: ClientBrand;
  showDescription?: boolean;
}) {
  const inner = (
    <>
      <div className="grid h-16 w-full place-items-center">
        {client.logo ? (
          <img
            src={client.logo}
            alt={`${client.company_name} logo`}
            loading="lazy"
            decoding="async"
            className="max-h-14 w-auto max-w-[80%] object-contain opacity-80 transition duration-500 group-hover:opacity-100"
          />
        ) : (
          <span
            className="text-lg font-normal tracking-tight text-muted-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {client.company_name || "Client"}
          </span>
        )}
      </div>
      <div className="mt-3 text-center">
        <div className="text-[13px] font-medium tracking-tight">{client.company_name}</div>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {client.category}
        </div>
        {showDescription && client.description ? (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {client.description}
          </p>
        ) : null}
      </div>
    </>
  );

  const cls =
    "group flex h-full flex-col items-center justify-start rounded-3xl border border-border bg-card/60 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_20px_50px_-30px_rgba(30,40,90,0.45)]";

  if (client.website) {
    return (
      <a
        href={client.website}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cls} relative`}
        aria-label={`${client.company_name} website`}
      >
        <ExternalLink className="absolute right-4 top-4 h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
        {inner}
      </a>
    );
  }
  return <div className={cls}>{inner}</div>;
}

/* ---------------- Grid ---------------- */

export function ClientsGrid({
  items,
  showDescription = false,
}: {
  items: ClientBrand[];
  showDescription?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((c, i) => (
        <Reveal key={c.id} variant="up" delay={Math.min(i, 6) * 60}>
          <ClientLogo client={c} showDescription={showDescription} />
        </Reveal>
      ))}
    </div>
  );
}

/* ---------------- Responsive carousel (scroll-snap) ---------------- */

export function ClientsCarousel({ items }: { items: ClientBrand[] }) {
  return (
    <div className="relative">
      <div
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label="Our clients"
      >
        {items.map((c) => (
          <div
            key={c.id}
            role="listitem"
            className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]"
          >
            <ClientLogo client={c} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-background to-transparent sm:block" />
    </div>
  );
}

/* ---------------- Homepage section ---------------- */

export function ClientsSection({
  eyebrow = "Clients",
  title = "Trusted by ambitious teams",
  subtitle = "A selection of businesses and brands we build for.",
  showEmpty = false,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  showEmpty?: boolean;
}) {
  const load = useServerFn(listFeaturedClients);
  const { data } = useQuery({
    queryKey: ["clients-public", "featured"],
    queryFn: () => load(),
  });
  const items = (data?.items ?? []) as ClientBrand[];

  if (items.length === 0 && !showEmpty) return null;

  return (
    <Section>
      <Reveal variant="up">
        <div className="max-w-2xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2
            className="mt-5 text-4xl font-normal tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">{subtitle}</p>
        </div>
      </Reveal>

      <div className="mt-12">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center text-sm text-muted-foreground">
            Client logos will appear here once published.
          </div>
        ) : (
          <ClientsCarousel items={items} />
        )}
      </div>
    </Section>
  );
}
