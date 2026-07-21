import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { containsBinaryData, FileContentService } from './file-content.service';
import { FileHashService } from './file-hash.service';

const temporaryPaths: string[] = [];
afterEach(async () => Promise.all(temporaryPaths.splice(0).map((path) => rm(path, { recursive: true, force: true }))));

describe('file content and hashing', () => {
  it('calculates stable SHA-256 hashes', () => {
    const service = new FileHashService();
    assert.equal(service.hashContent('developer-memory'), service.hashContent('developer-memory'));
    assert.notEqual(service.hashContent('changed'), service.hashContent('developer-memory'));
  });

  it('detects null bytes and invalid UTF-8 as binary', () => {
    assert.equal(containsBinaryData(Buffer.from([65, 0, 66])), true);
    assert.equal(containsBinaryData(Buffer.from([0xc3, 0x28])), true);
    assert.equal(containsBinaryData(Buffer.from('const safe = true;')), false);
  });

  it('normalizes line endings without changing indentation', async () => {
    const root = await mkdtemp(join(process.cwd(), '.developer-memory-content-'));
    temporaryPaths.push(root);
    const path = join(root, 'source.ts');
    await writeFile(path, '  first\r\n\tsecond\rthird');
    const fileStat = await stat(path);

    const result = await new FileContentService().read(path, fileStat.size, 1024);
    assert.equal(result?.content, '  first\n\tsecond\nthird');
    assert.equal(result?.lineCount, 3);
  });
});
