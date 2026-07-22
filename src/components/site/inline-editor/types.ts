import type { SiteContent } from "@/content/site";

export type SectionKey = keyof SiteContent;

export type FieldType = "text" | "textarea" | "url" | "email" | "media" | "number";

export type FieldDef = {
  key: string; // dot-path within section value, e.g. "primaryCta.label"
  label: string;
  type: FieldType;
  placeholder?: string;
  accept?: "image" | "video" | "any";
};

export type ItemSchema = {
  itemLabel: (item: Record<string, unknown>, i: number) => string;
  newItem: () => Record<string, unknown>;
  fields: FieldDef[];
};

export type SectionSchema =
  | { kind: "object"; title: string; fields: FieldDef[] }
  | { kind: "list"; title: string; item: ItemSchema };
