import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { classifyFileChange, findDeletedFileIds } from './change-detection';
import { indexStatusForOutcome } from './index-state';

describe('incremental indexing', () => {
  it('classifies new, changed, and unchanged hashes', () => {
    assert.equal(classifyFileChange(undefined, 'a'), 'NEW');
    assert.equal(classifyFileChange('a', 'b'), 'CHANGED');
    assert.equal(classifyFileChange('a', 'a'), 'UNCHANGED');
  });

  it('identifies database files missing from a later scan', () => {
    const existing = [{ id: '1', relativePath: 'kept.ts' }, { id: '2', relativePath: 'deleted.ts' }];
    assert.deepEqual(findDeletedFileIds(existing, new Set(['kept.ts'])), ['2']);
  });
});

describe('project indexing status transitions', () => {
  it('maps each indexing outcome to a persistent status', () => {
    assert.equal(indexStatusForOutcome('start'), 'INDEXING');
    assert.equal(indexStatusForOutcome('complete'), 'INDEXED');
    assert.equal(indexStatusForOutcome('fail'), 'FAILED');
    assert.equal(indexStatusForOutcome('clear'), 'NOT_INDEXED');
  });
});
