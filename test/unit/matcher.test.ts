import * as assert from 'assert';
import * as path from 'path';
import { matchIntent } from '../../src/parser/matcher';
import { loadTemplates } from '../../src/templates/index';

describe('Matcher & Multi-Language Loader Tests', () => {
  const index = loadTemplates(path.join(__dirname, '..', '..'));

  it('should load all four languages in the index', () => {
    assert.ok(index.byLanguage.has('cpp'), 'Index should contain C++');
    assert.ok(index.byLanguage.has('python'), 'Index should contain Python');
    assert.ok(index.byLanguage.has('java'), 'Index should contain Java');
    assert.ok(index.byLanguage.has('rust'), 'Index should contain Rust');
  });

  it('should find exact match for C++', () => {
    const res = matchIntent('fast io', 'cpp', index);
    assert.strictEqual(res.status, 'exact');
    assert.strictEqual(res.matches.length, 1);
    assert.strictEqual(res.matches[0].id, 'fast-io-cpp');
  });

  it('should find exact match for Python', () => {
    const res = matchIntent('fast io', 'python', index);
    assert.strictEqual(res.status, 'exact');
    assert.strictEqual(res.matches.length, 1);
    assert.strictEqual(res.matches[0].id, 'fast-io-python');
  });

  it('should find exact match for Java', () => {
    const res = matchIntent('fast io', 'java', index);
    assert.strictEqual(res.status, 'exact');
    assert.strictEqual(res.matches.length, 1);
    assert.strictEqual(res.matches[0].id, 'fast-io-java');
  });

  it('should find exact match for Rust', () => {
    const res = matchIntent('read array', 'rust', index);
    assert.strictEqual(res.status, 'exact');
    assert.strictEqual(res.matches.length, 1);
    assert.strictEqual(res.matches[0].id, 'read-array-rust');
  });

  it('should handle Levenshtein distance typo matches', () => {
    const resPython = matchIntent('deph first search', 'python', index);
    assert.strictEqual(resPython.status, 'exact');
    assert.strictEqual(resPython.matches[0].id, 'dfs-python');

    const resJava = matchIntent('bianry search', 'java', index);
    assert.strictEqual(resJava.status, 'exact');
    assert.strictEqual(resJava.matches[0].id, 'binary-search-java');
  });

  it('should return ambiguous matches for read in cpp', () => {
    const res = matchIntent('read', 'cpp', index);
    assert.strictEqual(res.status, 'ambiguous');
    assert.ok(res.matches.length >= 2, 'Should find at least 2 read templates');
  });

  it('should return none for distance > threshold', () => {
    const res = matchIntent('verylongtypoteststringhere', 'cpp', index);
    assert.strictEqual(res.status, 'none');
    assert.strictEqual(res.matches.length, 0);
  });

  it('should respect selected language (cross-language check)', () => {
    const resPython = matchIntent('dfs', 'python', index);
    assert.strictEqual(resPython.status, 'exact');
    assert.strictEqual(resPython.matches[0].id, 'dfs-python');

    const resCpp = matchIntent('dfs', 'cpp', index);
    assert.strictEqual(resCpp.status, 'exact');
    assert.strictEqual(resCpp.matches[0].id, 'dfs-skeleton-cpp');
  });
});
