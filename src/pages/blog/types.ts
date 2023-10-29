import type { StarterKitOptions } from "@tiptap/starter-kit";

export type Extensions =
  | keyof StarterKitOptions
  | "underline"
  | "undo"
  | "redo"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "alignJustify";
