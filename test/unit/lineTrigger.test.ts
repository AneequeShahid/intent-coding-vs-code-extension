import * as assert from 'assert';
import { shouldTrigger } from '../../src/parser/lineTrigger';

describe('Line Trigger Heuristic Tests', () => {
  it('should return true for intent phrases', () => {
    assert.strictEqual(shouldTrigger('read int'), true);
    assert.strictEqual(shouldTrigger('dfs'), true);
    assert.strictEqual(shouldTrigger('binary search'), true);
    assert.strictEqual(shouldTrigger('fast io'), true);
    assert.strictEqual(shouldTrigger('sort descending'), true);
  });

  it('should return false for actual code lines', () => {
    assert.strictEqual(shouldTrigger('int n = 0;'), false);
    assert.strictEqual(shouldTrigger('for(int i=0;i<n;i++)'), false);
    assert.strictEqual(shouldTrigger('// comment'), false);
    assert.strictEqual(shouldTrigger('#include <bits/stdc++.h>'), false);
    assert.strictEqual(shouldTrigger(''), false);
    assert.strictEqual(shouldTrigger('   '), false);
    assert.strictEqual(shouldTrigger('vector<int> arr(n);'), false);
  });

  it('should return false for lines ending with syntax characters', () => {
    assert.strictEqual(shouldTrigger('read int;'), false);
    assert.strictEqual(shouldTrigger('if (x) {'), false);
    assert.strictEqual(shouldTrigger('x, y,'), false);
  });

  it('should return false for lines exceeding maximum length', () => {
    const longLine = 'a'.repeat(60);
    assert.strictEqual(shouldTrigger(longLine), false);
  });
});
