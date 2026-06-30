import * as assert from 'assert';
import { parseResponse } from '../../src/llm/responseParser';

describe('Response Parser Tests', () => {
  it('should extract code from a single fenced block', () => {
    const raw = 'Here is the code:\n```cpp\nint n = 10;\n```\nHope this helps!';
    const res = parseResponse(raw);
    assert.deepStrictEqual(res, { code: 'int n = 10;' });
  });

  it('should return error for no code block', () => {
    const raw = 'No code blocks in this response.';
    const res = parseResponse(raw);
    assert.deepStrictEqual(res, { error: 'no-code-block' });
  });

  it('should return error for multiple code blocks', () => {
    const raw = '```cpp\nint a = 5;\n```\nand\n```python\nb = 10\n```';
    const res = parseResponse(raw);
    assert.deepStrictEqual(res, { error: 'multiple-code-blocks' });
  });

  it('should handle code blocks without language tags', () => {
    const raw = '```\nprint("hello")\n```';
    const res = parseResponse(raw);
    assert.deepStrictEqual(res, { code: 'print("hello")' });
  });
});
