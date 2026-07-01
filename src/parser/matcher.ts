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

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => {
      if (i === 0) {
        return j;
      }
      if (j === 0) {
        return i;
      }
      return 0;
    })
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
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

  // 1. Exact trigger match
  let matches = templatesForLang.filter((template) =>
    template.trigger.some((trigger) => normalizeInput(trigger) === normalized)
  );

  if (matches.length > 0) {
    return buildMatchResult(matches);
  }

  // 2. Substring match
  matches = templatesForLang.filter((template) =>
    template.trigger.some((trigger) => {
      const normTrigger = normalizeInput(trigger);
      return normTrigger.includes(normalized) || normalized.includes(normTrigger);
    })
  );

  if (matches.length > 0) {
    return buildMatchResult(matches);
  }

  // 3. Levenshtein distance match
  const threshold = normalized.length < 10 ? 2 : 3;
  matches = templatesForLang.filter((template) =>
    template.trigger.some((trigger) => {
      const normTrigger = normalizeInput(trigger);
      return levenshtein(normalized, normTrigger) <= threshold;
    })
  );

  return buildMatchResult(matches);
}

function buildMatchResult(matches: Template[]): MatchResult {
  if (matches.length === 1) {
    return { status: 'exact', matches };
  } else if (matches.length > 1) {
    const uniqueMatches: Template[] = [];
    const seenIds = new Set<string>();
    for (const match of matches) {
      if (!seenIds.has(match.id)) {
        seenIds.add(match.id);
        uniqueMatches.push(match);
      }
    }
    
    if (uniqueMatches.length === 1) {
      return { status: 'exact', matches: uniqueMatches };
    }
    return { status: 'ambiguous', matches: uniqueMatches };
  }
  return { status: 'none', matches: [] };
}
