import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isIgnoredDirectory, isIgnoredGeneratedFile, isSensitiveFile } from './ignore-rules';

describe('ignore rules', () => {
  it('protects sensitive filenames', () => {
    for (const path of ['.env', '.env.local', 'nested/secret.pem', 'id_rsa', 'credentials.json', 'secrets.prod']) {
      assert.equal(isSensitiveFile(path), true, path);
    }
  });

  it('does not overmatch safe filenames', () => {
    for (const path of ['src/.env-example.ts', 'keys/public.key.txt', 'credential.json']) {
      assert.equal(isSensitiveFile(path), false, path);
    }
  });

  it('matches generated files and nested ignored directories', () => {
    assert.equal(isIgnoredGeneratedFile('package-lock.json'), true);
    assert.equal(isIgnoredDirectory('packages/client/node_modules'), true);
    assert.equal(isIgnoredDirectory('storage/logs/archive'), true);
    assert.equal(isIgnoredDirectory('public/build'), true);
  });
});
