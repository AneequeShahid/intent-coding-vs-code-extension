import { LLMProvider, LLMRequestContext, LLMResponse, LLMProviderError } from './provider';
import { ApiKeyStore } from '../secrets/apiKeyStore';
import { buildPrompt } from './promptBuilder';
import { parseResponse } from './responseParser';

export class AnthropicProvider implements LLMProvider {
  readonly id = 'anthropic';

  constructor(private readonly apiKeyStore: ApiKeyStore) {}

  async isConfigured(): Promise<boolean> {
    const key = await this.apiKeyStore.getApiKey();
    return !!key && key.trim().length > 0;
  }

  async generate(context: LLMRequestContext): Promise<LLMResponse> {
    const apiKey = await this.apiKeyStore.getApiKey();
    if (!apiKey) {
      throw new LLMProviderError('Anthropic API key is not configured.', 'missing-key');
    }

    const { system, user } = buildPrompt(context);

    let wasRetried = false;
    let responseText = '';

    try {
      responseText = await this.makeApiCall(apiKey, system, user);
    } catch (err: any) {
      if (err instanceof LLMProviderError) {
        throw err;
      }
      throw new LLMProviderError(`Network error calling Anthropic API: ${err.message}`, 'network');
    }

    let parsed = parseResponse(responseText);
    if ('error' in parsed) {
      wasRetried = true;
      const strictUserPrompt = `${user}\n\nCRITICAL: Your previous response was invalid. You must output ONLY a single markdown fenced code block (e.g. \`\`\`${context.language}\ncode here\n\`\`\`). No explanation, no comments before/after, and no other text whatsoever.`;
      
      try {
        responseText = await this.makeApiCall(apiKey, system, strictUserPrompt);
      } catch (err: any) {
        if (err instanceof LLMProviderError) {
          throw err;
        }
        throw new LLMProviderError(`Network error on Anthropic retry: ${err.message}`, 'network');
      }

      parsed = parseResponse(responseText);
      if ('error' in parsed) {
        throw new LLMProviderError(
          `Failed to get a valid code-only response from Anthropic after retry. Error: ${parsed.error}`,
          'malformed-response'
        );
      }
    }

    return {
      code: parsed.code,
      wasRetried,
    };
  }

  private async makeApiCall(apiKey: string, system: string, user: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1536,
          system,
          messages: [
            {
              role: 'user',
              content: user,
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new LLMProviderError(
          `Anthropic API returned status ${response.status}: ${errorText}`,
          'network'
        );
      }

      const data = (await response.json()) as any;
      if (
        data &&
        data.content &&
        data.content[0] &&
        typeof data.content[0].text === 'string'
      ) {
        return data.content[0].text;
      }

      throw new LLMProviderError('Unexpected Anthropic API response format.', 'network');
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new LLMProviderError('Anthropic API request timed out.', 'timeout');
      }
      throw err;
    }
  }
}
