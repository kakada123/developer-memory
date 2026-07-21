import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FileScannerService, isPathInside } from './file-scanner.service';

const temporaryPaths: string[] = [];
afterEach(async () => Promise.all(temporaryPaths.splice(0).map((path) => rm(path, { recursive: true, force: true }))));

async function temporaryDirectory(prefix: string): Promise<string> {
  const path = await mkdtemp(join(process.cwd(), `.${prefix}`));
  temporaryPaths.push(path);
  return path;
}

describe('safe file scanning', () => {
  it('prevents path traversal', () => {
    assert.equal(isPathInside('/project/root', '/project/root/src/app.ts'), true);
    assert.equal(isPathInside('/project/root', '/project/other/secret.ts'), false);
  });

  it('does not follow a symlink outside the project root', async () => {
    const root = await temporaryDirectory('developer-memory-root-');
    const outside = await temporaryDirectory('developer-memory-outside-');
    await writeFile(join(outside, 'outside.ts'), 'export const secret = true;');
    await symlink(outside, join(root, 'escaped'));
    await writeFile(join(root, 'inside.ts'), 'export const safe = true;');

    const result = await new FileScannerService().scan(root);
    assert.deepEqual(result.files.map((file) => file.relativePath), ['inside.ts']);
  });

  it('skips sensitive and ignored directory content', async () => {
    const root = await temporaryDirectory('developer-memory-ignore-');
    await mkdir(join(root, 'node_modules'));
    await writeFile(join(root, 'node_modules', 'package.ts'), 'ignored');
    await writeFile(join(root, '.env'), 'SECRET=value');
    await writeFile(join(root, 'main.ts'), 'const value = 1;');

    const result = await new FileScannerService().scan(root);
    assert.deepEqual(result.files.map((file) => file.relativePath), ['main.ts']);
  });
});
