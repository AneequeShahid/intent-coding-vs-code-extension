import * as assert from 'assert';
import { matchIntent } from '../../src/parser/matcher';
import { TemplateIndex, Template } from '../../src/templates/schema';

describe('Matcher Tests', () => {
  const mockTemplates: Template[] = [
    {
      id: 'fast-io-cpp',
      trigger: ['fast io', 'fastio'],
      language: 'cpp',
      category: 'io',
      code: 'ios_base::sync_with_stdio(false);',
    },
    {
      id: 'for-loop-cpp',
      trigger: ['for loop', 'loop'],
      language: 'cpp',
      category: 'loop',
      code: 'for (int i = 0; i < n; i++) {}',
    },
    {
      id: 'loop-ambiguous-cpp',
      trigger: ['loop'],
      language: 'cpp',
      category: 'loop',
      code: 'while(true) {}',
    }
  ];

  const index: TemplateIndex = {
    byLanguage: new Map([['cpp', mockTemplates]]),
    byId: new Map(mockTemplates.map((t) => [t.id, t])),
  };

  it('should find exact match', () => {
    const res = matchIntent('fast io', 'cpp', index);
    assert.strictEqual(res.status, 'exact');
    assert.strictEqual(res.matches.length, 1);
    assert.strictEqual(res.matches[0].id, 'fast-io-cpp');
  });

  it('should handle case insensitivity and extra spaces', () => {
    const res = matchIntent('  FASTIO  ', 'cpp', index);
    assert.strictEqual(res.status, 'exact');
    assert.strictEqual(res.matches.length, 1);
    assert.strictEqual(res.matches[0].id, 'fast-io-cpp');
  });

  it('should return ambiguous matches', () => {
    const res = matchIntent('loop', 'cpp', index);
    assert.strictEqual(res.status, 'ambiguous');
    assert.strictEqual(res.matches.length, 2);
  });

  it('should return none when no match exists', () => {
    const res = matchIntent('unknown intent', 'cpp', index);
    assert.strictEqual(res.status, 'none');
    assert.strictEqual(res.matches.length, 0);
  });
});
