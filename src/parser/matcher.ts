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
  const inputWords = normalized.split(' ').filter((w) => w.length > 0);

  const getThreshold = (word: string): number => {
    if (word.length <= 3) {
      return 0;
    }
    if (word.length <= 5) {
      return 1;
    }
    if (word.length < 10) {
      return 2;
    }
    return 3;
  };

  const matchedTemplates: { template: Template; distance: number }[] = [];

  const checkMatch = (template: Template) => {
    let minTDist = Infinity;
    for (const trigger of template.trigger) {
      const normTrigger = normalizeInput(trigger);
      const triggerWords = normTrigger.split(' ').filter((w) => w.length > 0);
      const M = triggerWords.length;

      if (inputWords.length === M) {
        if (normalized === normTrigger) {
          minTDist = Math.min(minTDist, 0);
        } else if (normTrigger.includes(normalized) || normalized.includes(normTrigger)) {
          minTDist = Math.min(minTDist, 0.5);
        } else {
          const threshold = getThreshold(normTrigger);
          const dist = levenshtein(normalized, normTrigger);
          if (dist <= threshold) {
            minTDist = Math.min(minTDist, dist);
          }
        }
      } else if (inputWords.length > M) {
        const prefix = inputWords.slice(0, M).join(' ');
        if (prefix === normTrigger) {
          minTDist = Math.min(minTDist, 0.1);
        } else {
          const threshold = getThreshold(normTrigger);
          const dist = levenshtein(prefix, normTrigger);
          if (dist <= threshold) {
            minTDist = Math.min(minTDist, dist);
          }
        }

        const suffix = inputWords.slice(inputWords.length - M).join(' ');
        if (suffix === normTrigger) {
          minTDist = Math.min(minTDist, 0.1);
        } else {
          const suffixThreshold = getThreshold(normTrigger);
          const dist = levenshtein(suffix, normTrigger);
          if (dist <= suffixThreshold) {
            minTDist = Math.min(minTDist, dist);
          }
        }
      }
    }

    if (minTDist !== Infinity) {
      matchedTemplates.push({ template, distance: minTDist });
    }
  };

  for (const template of templatesForLang) {
    checkMatch(template);
  }

  if (matchedTemplates.length === 0) {
    return { status: 'none', matches: [] };
  }

  const minOverallDist = Math.min(...matchedTemplates.map((m) => m.distance));
  const bestMatches = matchedTemplates
    .filter((m) => m.distance === minOverallDist)
    .map((m) => m.template);

  return buildMatchResult(bestMatches);
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

export function extractParam(rawInput: string, template: Template): string | undefined {
  const normalizedInput = normalizeInput(rawInput);
  const rawWords = rawInput.trim().split(/\s+/).filter((w) => w.length > 0);

  let bestTrigger: string | undefined;
  let bestDist = Infinity;

  for (const trigger of template.trigger) {
    const normTrigger = normalizeInput(trigger);
    if (normalizedInput.includes(normTrigger)) {
      bestTrigger = normTrigger;
      break;
    }
  }

  if (!bestTrigger) {
    for (const trigger of template.trigger) {
      const normTrigger = normalizeInput(trigger);
      const dist = levenshtein(normalizedInput, normTrigger);
      if (dist < bestDist) {
        bestDist = dist;
        bestTrigger = normTrigger;
      }
    }
  }

  if (bestTrigger) {
    const triggerWords = bestTrigger.split(' ').filter((w) => w.length > 0);
    const M = triggerWords.length;
    if (rawWords.length > M) {
      if (normalizedInput.endsWith(bestTrigger)) {
        const paramWords = rawWords.slice(0, rawWords.length - M);
        return paramWords[paramWords.length - 1];
      } else {
        const paramWords = rawWords.slice(M);
        return paramWords[0];
      }
    }
  }
  return undefined;
}

export function substituteParams(code: string, paramValue: string | undefined, template: Template): string {
  const value = paramValue || (template.params && template.params[0]?.defaultValue) || 'a';
  return code.replace(/\{\{var\}\}/g, value);
}

