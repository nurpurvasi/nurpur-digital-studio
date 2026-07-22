import { useAdminMode } from "@/content/AdminModeContext";
import { Eye, Pencil } from "lucide-react";

/**
 * Floating toggle to enter / exit inline edit mode. Visible only to admins.
 */
export function AdminModeToggle() {
  const { isAdmin, editMode, toggle } = useAdminMode();
  if (!isAdmin) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={editMode}
      aria-label={editMode ? "Exit edit mode" : "Enter edit mode"}
      className="fixed bottom-6 left-6 z-[60] inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/95 px-4 py-2.5 text-xs font-semibold text-foreground shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5"
    >
      <span
        className="grid h-6 w-6 place-items-center rounded-full text-white transition"
        style={{ background: editMode ? "var(--gradient-brand)" : "hsl(var(--muted-foreground) / 0.9)" }}
      >
        {editMode ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </span>
      {editMode ? "Editing on" : "Edit site"}
    </button>
  );
}
