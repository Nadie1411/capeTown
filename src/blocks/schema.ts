import type { BlockStyle, BlockType, LText } from "@/lib/types";

/* --------------------------------------------------------------------- */
/*  Schema used to auto-generate the admin editing forms for every block  */
/* --------------------------------------------------------------------- */

export interface FieldBase {
  key: string;
  label: LText;
  help?: LText;
  /** Only show the field when this returns true for the current values */
  showIf?: (values: any) => boolean;
  width?: "full" | "half";
}

export type Field = FieldBase &
  (
    | { type: "text" | "textarea" | "url" | "richtext" | "ltext" | "ltextarea" | "lrichtext" | "icon" | "color" | "boolean" | "code"; placeholder?: string }
    | { type: "number"; min?: number; max?: number; step?: number }
    | { type: "select"; options: { value: string; label: LText }[] }
    | { type: "media"; accept: "image" | "video" | "any" }
    | { type: "link" }
    | { type: "list"; itemFields: Field[]; itemTitle?: (item: any, index: number) => string; addLabel?: LText; max?: number; newItem?: () => any }
    | { type: "group"; fields: Field[] }
    | { type: "services" | "projects" | "category" }
  );

export interface BlockDefinition {
  type: BlockType;
  name: LText;
  description: LText;
  icon: string;
  category: "hero" | "content" | "lists" | "media" | "conversion" | "layout";
  fields: Field[];
  defaults: () => Record<string, any>;
  defaultStyle?: Partial<BlockStyle>;
}
