import Module from 'module';

// Mock VS Code module before importing the provider
const originalLoad = (Module as any)._load;
(Module as any)._load = function (request: string, _parent: any, _isMain: boolean) {
  if (request === 'vscode') {
    return {
      workspace: {
        getConfiguration: () => ({
          get: (_key: string, defaultValue: any) => defaultValue,
        }),
      },
    };
  }
  return originalLoad.apply(this, arguments);
};

import * as assert from 'assert';
import { OllamaProvider } from '../../src/llm/ollamaProvider';
import { LLMProviderError } from '../../src/llm/provider';

describe('Ollama Provider Tests', () => {
  let originalFetch: any;

  before(() => {
    originalFetch = global.fetch;
  });

  after(() => {
    global.fetch = originalFetch;
  });

  it('should return parsed code block on successful response', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          message: {
            content: 'Here is your code:\n```cpp\nint main() {}\n```',
          },
        }),
      } as any;
    };

    const provider = new OllamaProvider();
    const res = await provider.generate({
      sourceText: 'main',
      language: 'cpp',
      action: 'line-intent',
    });

    assert.strictEqual(res.code, 'int main() {}');
    assert.strictEqual(res.wasRetried, false);
  });

  it('should throw LLMProviderError with network kind on HTTP error', async () => {
    global.fetch = async () => {
      return {
        ok: false,
        status: 500,
      } as any;
    };

    const provider = new OllamaProvider();
    await assert.rejects(
      provider.generate({
        sourceText: 'main',
        language: 'cpp',
        action: 'line-intent',
      }),
      (err: any) => {
        return err instanceof LLMProviderError && err.kind === 'network';
      }
    );
  });

  it('should throw LLMProviderError with timeout kind on timeout', async () => {
    global.fetch = async () => {
      throw new DOMException('The user aborted a request.', 'AbortError');
    };

    const provider = new OllamaProvider();
    await assert.rejects(
      provider.generate({
        sourceText: 'main',
        language: 'cpp',
        action: 'line-intent',
      }),
      (err: any) => {
        return err instanceof LLMProviderError && err.kind === 'timeout';
      }
    );
  });

  it('should retry once when first response is malformed', async () => {
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: true,
          json: async () => ({
            message: {
              content: 'no code block here',
            },
          }),
        } as any;
      }
      return {
        ok: true,
        json: async () => ({
          message: {
            content: '```cpp\nint retry = 1;\n```',
          },
        }),
      } as any;
    };

    const provider = new OllamaProvider();
    const res = await provider.generate({
      sourceText: 'main',
      language: 'cpp',
      action: 'line-intent',
    });

    assert.strictEqual(res.code, 'int retry = 1;');
    assert.strictEqual(res.wasRetried, true);
    assert.strictEqual(callCount, 2);
  });

  it('should throw malformed-response kind when retry response is also malformed', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          message: {
            content: 'still no code block',
          },
        }),
      } as any;
    };

    const provider = new OllamaProvider();
    await assert.rejects(
      provider.generate({
        sourceText: 'main',
        language: 'cpp',
        action: 'line-intent',
      }),
      (err: any) => {
        return err instanceof LLMProviderError && err.kind === 'malformed-response';
      }
    );
  });

  it('should return true for isConfigured() when tags returns ok', async () => {
    global.fetch = async () => {
      return {
        ok: true,
      } as any;
    };

    const provider = new OllamaProvider();
    const active = await provider.isConfigured();
    assert.strictEqual(active, true);
  });

  it('should return false for isConfigured() when tags fetch throws', async () => {
    global.fetch = async () => {
      throw new Error('Connection refused');
    };

    const provider = new OllamaProvider();
    const active = await provider.isConfigured();
    assert.strictEqual(active, false);
  });
});
