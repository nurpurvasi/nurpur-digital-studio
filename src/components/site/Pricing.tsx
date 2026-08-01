import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Check, Minus } from "lucide-react";
import { Eyebrow, Section } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { getServiceIcon } from "@/components/site/service-icons";
import {
  listFeaturedPricingPlans,
  listPublicPricingPlans,
  type PricingPlan,
} from "@/lib/pricing.functions";

export const PLAN_COLORS = [
  { key: "", label: "Brand", value: "var(--gradient-brand)" },
  { key: "navy", label: "Navy", value: "#101a3c" },
  { key: "royal", label: "Royal Blue", value: "#2b52d6" },
  { key: "cyan", label: "Soft Cyan", value: "#3aa8c9" },
  { key: "purple", label: "Purple", value: "#7c4dd6" },
  { key: "slate", label: "Slate", value: "#4a5570" },
] as const;

export function planAccent(plan: Pick<PricingPlan, "plan_color">) {
  const found = PLAN_COLORS.find((c) => c.key === (plan.plan_color || ""));
  return found?.value ?? plan.plan_color ?? "var(--gradient-brand)";
}

const CYCLE_LABEL: Record<string, string> = {
  "One Time": "one time",
  Monthly: "per month",
  Quarterly: "per quarter",
  Yearly: "per year",
};

export function PricingCard({ plan }: { plan: PricingPlan }) {
  const Icon = getServiceIcon(plan.icon);
  const accent = planAccent(plan);
  const features = Array.isArray(plan.features) ? plan.features : [];
  const limitations = Array.isArray(plan.limitations) ? plan.limitations : [];

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(30,40,90,0.25)] ${
        plan.featured ? "border-transparent shadow-[0_25px_60px_-35px_rgba(30,40,90,0.35)]" : "border-border"
      }`}
    >
      {plan.featured && (
        <span
          className="pointer-events-none absolute inset-0 rounded-3xl p-px opacity-90"
          style={{ background: accent, WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
          aria-hidden
        />
      )}
      <div className="relative flex items-start justify-between">
        <div
          className="grid h-12 w-12 place-items-center rounded-2xl text-white"
          style={{ background: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        {plan.badge && (
          <span
            className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
            style={{ background: accent }}
          >
            {plan.badge}
          </span>
        )}
      </div>

      <h3 className="relative mt-6 text-lg font-semibold">{plan.title}</h3>
      {plan.short_description && (
        <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
          {plan.short_description}
        </p>
      )}

      <div className="relative mt-6 flex items-end gap-2">
        <span
          className="text-4xl font-normal tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {plan.price ? `${plan.currency === "INR" ? "₹" : `${plan.currency} `}${plan.price}` : "On request"}
        </span>
        <span className="pb-1.5 text-xs text-muted-foreground">
          {CYCLE_LABEL[plan.billing_cycle] ?? plan.billing_cycle}
        </span>
      </div>

      {(features.length > 0 || limitations.length > 0) && (
        <ul className="relative mt-6 space-y-2.5 border-t border-border/70 pt-6 text-sm">
          {features.map((f, i) => (
            <li key={`f-${i}`} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--primary, #2b52d6)" }} />
              <span>{f}</span>
            </li>
          ))}
          {limitations.map((l, i) => (
            <li key={`l-${i}`} className="flex items-start gap-2.5 text-muted-foreground">
              <Minus className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="line-through decoration-muted-foreground/40">{l}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="relative mt-8 pt-2">
        <Link
          to={plan.button_link || "/contact"}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
            plan.featured ? "text-white" : "border border-border bg-background hover:-translate-y-0.5 hover:shadow"
          }`}
          style={plan.featured ? { background: accent } : undefined}
        >
          {plan.button_text || "Get started"}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}

export function PricingGrid({ items }: { items: PricingPlan[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <Reveal key={p.id} delay={i * 70}>
          <PricingCard plan={p} />
        </Reveal>
      ))}
    </div>
  );
}

export function PricingSection({
  variant = "featured",
  eyebrow = "Pricing",
  title = "Simple, transparent pricing",
  subtitle = "Clear packages built around outcomes — no hidden fees, no surprises.",
  showEmpty = false,
}: {
  variant?: "featured" | "all";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  showEmpty?: boolean;
}) {
  const fetchFeatured = useServerFn(listFeaturedPricingPlans);
  const fetchAll = useServerFn(listPublicPricingPlans);
  const { data } = useQuery({
    queryKey: ["pricing-public", variant],
    queryFn: () => (variant === "featured" ? fetchFeatured() : fetchAll()),
  });
  const items = (data?.items ?? []) as PricingPlan[];

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
      <div className="mt-14">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
            Add your first pricing plan from the admin dashboard.
          </div>
        ) : (
          <PricingGrid items={items} />
        )}
      </div>
    </Section>
  );
}
