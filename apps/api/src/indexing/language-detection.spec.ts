import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectFileLanguage, isSupportedSourceFile } from './language-detection';

describe('language detection', () => {
  it('detects supported languages', () => {
    const cases = [
      ['component.tsx', 'TypeScript'], ['app.js', 'JavaScript'], ['Page.vue', 'Vue'], ['query.sql', 'SQL'],
      ['README.md', 'Markdown'], ['Dockerfile', 'Docker'], ['config.yaml', 'YAML'],
    ] as const;
    for (const [path, language] of cases) assert.equal(detectFileLanguage(path), language);
  });

  it('rejects unsupported compiled and image files', () => {
    assert.equal(isSupportedSourceFile('photo.png'), false);
    assert.equal(isSupportedSourceFile('program.exe'), false);
    assert.equal(isSupportedSourceFile('data.sqlite'), false);
  });
});
