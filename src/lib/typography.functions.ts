import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { defaultTypography, mergeTypography, type TypographySettings } from "@/lib/typography";

const typographyInput = z.object({
  heading_font: z.string().min(1).max(120),
  body_font: z.string().min(1).max(120),
  button_font: z.string().min(1).max(120),
  navigation_font: z.string().min(1).max(120),
  heading_weight: z.number().int().min(100).max(900),
  body_weight: z.number().int().min(100).max(900),
  button_weight: z.number().int().min(100).max(900),
  navigation_weight: z.number().int().min(100).max(900),
  heading_letter_spacing: z.number().min(-0.2).max(0.5),
  body_letter_spacing: z.number().min(-0.2).max(0.5),
  heading_line_height: z.number().min(0.8).max(2.5),
  body_line_height: z.number().min(0.8).max(3),
  base_font_size: z.number().min(12).max(24),
  text_transform: z.enum(["none", "uppercase", "capitalize"]),
});

async function assertEditor(ctx: { supabase: unknown; userId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa = ctx.supabase as any;
  const { data } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .in("role", ["admin", "editor"]);
  if (!data || data.length === 0) throw new Error("Forbidden");
}

export const getAdminTypography = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertEditor(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (context.supabase as any)
      .from("typography_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    return { settings: mergeTypography(data as Partial<TypographySettings>) };
  });

export const saveTypography = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => typographyInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertEditor(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("typography_settings")
      .upsert({ id: 1, ...data, updated_by: context.userId }, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw error;
    return { settings: mergeTypography(row as Partial<TypographySettings>) };
  });

export const resetTypography = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertEditor(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("typography_settings")
      .upsert({ id: 1, ...defaultTypography, updated_by: context.userId }, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw error;
    return { settings: mergeTypography(row as Partial<TypographySettings>) };
  });
