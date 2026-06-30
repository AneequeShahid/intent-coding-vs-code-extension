import { LLMRequestContext } from './provider';

export function buildPrompt(context: LLMRequestContext): { system: string; user: string } {
  const system = `You are a code generator embedded in an editor. Return ONLY a single fenced code block in ${context.language}. No prose before or after, no explanation, no multiple code blocks. If the request is ambiguous, make the most common-sense interpretation rather than asking for clarification.`;

  let user = `Action requested: ${context.action}\n`;
  if (context.surroundingContext) {
    user += `Surrounding code context:\n${context.surroundingContext}\n\n`;
  }
  user += `Source text to transform/generate from:\n${context.sourceText}\n`;

  return { system, user };
}
