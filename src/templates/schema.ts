export type SupportedLanguage =
  | "cpp"
  | "python"
  | "java"
  | "rust"
  | "javascript"
  | "typescript";

export type TemplateCategory =
  | "io"
  | "loop"
  | "data-structure"
  | "algorithm"
  | "search"
  | "sort"
  | "misc";

export interface Template {
  /** Unique, stable id. Never reuse across templates. e.g. "fast-io-cpp" */
  id: string;

  /** Lowercase trigger phrases that should resolve to this template.
   * Matcher will normalize input (trim, lowercase, strip punctuation)
   * before comparing — store triggers already normalized. */
  trigger: string[];

  language: SupportedLanguage;

  category: TemplateCategory;

  /** The literal code to insert. Use \n for newlines, no markdown fences. */
  code: string;

  /** Optional short label shown in QuickPick disambiguation menus. */
  label?: string;

  /** Optional longer description shown as QuickPick detail line. */
  description?: string;

  /** Phase 3 — leave undefined for now. Will support variable substitution. */
  params?: TemplateParam[];
}

export interface TemplateParam {
  name: string;
  defaultValue: string;
}

export interface TemplateIndex {
  byLanguage: Map<SupportedLanguage, Template[]>;
  byId: Map<string, Template>;
}

/** Runtime validator — call on every loaded template before indexing. */
export function isValidTemplate(t: unknown): t is Template {
  if (typeof t !== "object" || t === null) return false;
  const obj = t as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    Array.isArray(obj.trigger) &&
    obj.trigger.every((x) => typeof x === "string") &&
    typeof obj.language === "string" &&
    typeof obj.category === "string" &&
    typeof obj.code === "string"
  );
}
