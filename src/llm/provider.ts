import { SupportedLanguage } from '../templates/schema';

export interface LLMRequestContext {
  /** The user's selection, or the single triggering line — whichever flow called this. */
  sourceText: string;

  /** Target language for the generated code. */
  language: SupportedLanguage;

  /** The specific action requested, e.g. "translate-to-python", "add-comments",
   * "convert-to-range-loop", or a freeform intent string for line-trigger flow. */
  action: string;

  /** A few lines of surrounding context, capped by settings.maxContextLines.
   * Optional — omit if not available or user has opted out. */
  surroundingContext?: string;
}

export interface LLMResponse {
  /** Always exactly one code block, fences already stripped. */
  code: string;

  /** True if responseParser had to retry once due to a malformed first response. */
  wasRetried: boolean;
}

export interface LLMProvider {
  readonly id: string; // "anthropic" | "openai" | "ollama"

  /** Throws LLMProviderError on failure — never returns partial/garbage output silently. */
  generate(context: LLMRequestContext): Promise<LLMResponse>;

  /** Cheap check used by settings.ts to decide whether to show "configure API key" prompts. */
  isConfigured(): Promise<boolean>;
}

export class LLMProviderError extends Error {
  constructor(
    message: string,
    public readonly kind: 'missing-key' | 'network' | 'malformed-response' | 'timeout'
  ) {
    super(message);
    Object.setPrototypeOf(this, LLMProviderError.prototype);
  }
}
