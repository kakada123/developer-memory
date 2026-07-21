import { access, readFile, realpath, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { DetectedProject } from '@developer-memory/shared-types';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

async function readPackageManifest(path: string): Promise<PackageManifest | null> {
  try {
    const contents = await readFile(path, 'utf8');
    const value: unknown = JSON.parse(contents);
    return typeof value === 'object' && value !== null ? value as PackageManifest : null;
  } catch {
    return null;
  }
}

export async function detectProject(selectedPath: string): Promise<DetectedProject> {
  const path = await realpath(selectedPath);
  const directory = await stat(path);
  if (!directory.isDirectory()) throw new Error('The selected path is not a directory');

  const packagePath = join(path, 'package.json');
  const [hasGit, hasPackage, hasTsConfig, hasNest, hasArtisan, hasComposer] = await Promise.all([
    exists(join(path, '.git')),
    exists(packagePath),
    exists(join(path, 'tsconfig.json')),
    exists(join(path, 'nest-cli.json')),
    exists(join(path, 'artisan')),
    exists(join(path, 'composer.json')),
  ]);
  const viteFiles = ['vite.config.ts', 'vite.config.js', 'vite.config.mts', 'vite.config.mjs', 'vite.config.cts', 'vite.config.cjs'];
  const hasVite = (await Promise.all(viteFiles.map((file) => exists(join(path, file))))).some(Boolean);
  const manifest = hasPackage ? await readPackageManifest(packagePath) : null;
  const dependencies = { ...manifest?.devDependencies, ...manifest?.dependencies };
  const hasVue = 'vue' in dependencies;
  const hasElectron = 'electron' in dependencies;

  let framework = 'Unknown';
  if (hasNest) framework = 'NestJS';
  else if (hasArtisan) framework = 'Laravel';
  else if (hasVue) framework = 'Vue';
  else if (hasElectron) framework = 'Electron';
  else if (hasVite) framework = 'Vite';
  else if (hasPackage) framework = 'Node.js';

  let language = 'Unknown';
  if (hasTsConfig) language = 'TypeScript';
  else if (hasComposer || hasArtisan) language = 'PHP';
  else if (hasPackage) language = 'JavaScript';

  return { name: basename(path), path, framework, language, hasGit };
}
