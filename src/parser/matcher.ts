import { SupportedLanguage, TemplateIndex, Template } from '../templates/schema';

export interface MatchResult {
  status: 'exact' | 'ambiguous' | 'none';
  matches: Template[];
}

export function normalizeInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ');
}

export function matchIntent(
  rawInput: string,
  language: SupportedLanguage,
  index: TemplateIndex
): MatchResult {
  const normalized = normalizeInput(rawInput);
  if (!normalized) {
    return { status: 'none', matches: [] };
  }

  const templatesForLang = index.byLanguage.get(language) || [];
  const matches = templatesForLang.filter((template) =>
    template.trigger.some((trigger) => normalizeInput(trigger) === normalized)
  );

  if (matches.length === 1) {
    return { status: 'exact', matches };
  } else if (matches.length > 1) {
    return { status: 'ambiguous', matches };
  }

  return { status: 'none', matches: [] };
}
