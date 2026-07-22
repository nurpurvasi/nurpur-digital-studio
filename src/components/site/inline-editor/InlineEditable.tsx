import { useState, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { useAdminMode } from "@/content/AdminModeContext";
import { InlineEditorSheet } from "./InlineEditorSheet";
import type { SectionKey } from "./types";

type Props = {
  section: SectionKey;
  label?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps a page section. In admin edit mode, shows a hover pencil button.
 * Clicking opens a side-panel editor bound to that content section.
 * Invisible for non-admin visitors.
 */
export function InlineEditable({ section, label, className, children }: Props) {
  const { editMode } = useAdminMode();
  const [open, setOpen] = useState(false);

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <>
      <div className={`group/edit relative ${className ?? ""}`}>
        {children}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 outline outline-2 outline-offset-4 outline-[color:var(--royal)]/0 transition-all duration-300 group-hover/edit:opacity-100 group-hover/edit:outline-[color:var(--royal)]/40"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-foreground opacity-0 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:text-white group-hover/edit:opacity-100 focus:opacity-100"
          style={{ backgroundImage: "none" }}
          aria-label={`Edit ${label ?? section}`}
        >
          <span
            className="grid h-5 w-5 place-items-center rounded-full text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Pencil className="h-3 w-3" />
          </span>
          Edit {label ?? section}
        </button>
      </div>
      {open && (
        <InlineEditorSheet
          section={section}
          label={label}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
