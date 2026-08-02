import { createFileRoute } from "@tanstack/react-router";
import { TypographyStudio } from "@/components/admin/TypographyStudio";

export const Route = createFileRoute("/_authenticated/admin/typography/")({
  component: () => <TypographyStudio tab="fonts" />,
});
