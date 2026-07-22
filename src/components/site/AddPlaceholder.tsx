import { Plus } from "lucide-react";

/**
 * Editable placeholder tile. Rendered wherever a collection in
 * `src/content/site.ts` is empty. Non-interactive — purely a visual
 * "Add …" affordance so the layout stays production-ready without any
 * fake demo content.
 */
export function AddPlaceholder({
  label,
  className = "",
  aspect,
  minHeight,
}: {
  label: string;
  className?: string;
  aspect?: string;
  minHeight?: string;
}) {
  return (
    <div
      className={`group relative flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/80 bg-white/60 p-8 text-center backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:border-transparent hover:bg-white/80 hover:shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--royal)_30%,transparent)] ${className}`}
      style={{ aspectRatio: aspect, minHeight }}
      role="note"
      aria-label={label}
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-2xl text-white transition-transform duration-500 group-hover:scale-110"
        style={{ background: "var(--gradient-brand)" }}
      >
        <Plus className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-foreground/80">{label}</p>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Editable placeholder
      </p>
    </div>
  );
}
