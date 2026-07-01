import { LLMProvider, LLMRequestContext, LLMResponse, LLMProviderError } from './provider';
import { buildPrompt } from './promptBuilder';
import { parseResponse } from './responseParser';
import { getSettings } from '../config/settings';

export class OllamaProvider implements LLMProvider {
  readonly id = 'ollama';

  async generate(context: LLMRequestContext): Promise<LLMResponse> {
    const settings = getSettings();
    const host = settings.ollamaHost;
    const model = settings.ollamaModel;
    const timeout = settings.ollamaTimeoutMs;

    const { system, user } = buildPrompt(context);

    const body = {
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      stream: false
    };

    let raw: string;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      /* eslint-disable @typescript-eslint/naming-convention */
      const res = await fetch(`${host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      /* eslint-enable @typescript-eslint/naming-convention */
      clearTimeout(timer);

      if (!res.ok) {
        throw new LLMProviderError(
          `Ollama returned HTTP ${res.status}`,
          'network'
        );
      }

      const json = await res.json() as { message?: { content?: string } };
      raw = json?.message?.content ?? '';
    } catch (err: unknown) {
      if (err instanceof LLMProviderError) {
        throw err;
      }
      const isAbort = err instanceof Error && err.name === 'AbortError';
      throw new LLMProviderError(
        isAbort ? 'Ollama request timed out' : `Ollama fetch failed: ${String(err)}`,
        isAbort ? 'timeout' : 'network'
      );
    }

    const first = parseResponse(raw);
    if ('code' in first) {
      return { code: first.code, wasRetried: false };
    }

    const retryBody = {
      ...body,
      messages: [
        ...body.messages,
        { role: 'assistant', content: raw },
        { role: 'user', content: 'Return ONLY the code block. No explanation.' }
      ]
    };

    try {
      /* eslint-disable @typescript-eslint/naming-convention */
      const res2 = await fetch(`${host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retryBody)
      });
      /* eslint-enable @typescript-eslint/naming-convention */
      const json2 = await res2.json() as { message?: { content?: string } };
      const raw2 = json2?.message?.content ?? '';
      const second = parseResponse(raw2);
      if ('code' in second) {
        return { code: second.code, wasRetried: true };
      }
    } catch {
      // Fall through to error
    }

    throw new LLMProviderError('Ollama returned malformed response after retry', 'malformed-response');
  }

  async isConfigured(): Promise<boolean> {
    const settings = getSettings();
    try {
      const res = await fetch(`${settings.ollamaHost}/api/tags`, {
        signal: AbortSignal.timeout(2000)
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
