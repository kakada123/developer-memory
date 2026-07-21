import { basename, posix } from 'node:path';

const ignoredDirectoryNames = new Set([
  '.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.nuxt', '.output',
  '.vite', '.cache', '.tmp', 'temp', 'vendor', '.idea', '.vscode',
]);
const ignoredDirectoryPaths = new Set(['storage/logs', 'public/build']);
const ignoredGeneratedFiles = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock']);
const sensitiveExactNames = new Set([
  '.env', 'id_rsa', 'id_ed25519', 'credentials.json', 'service-account.json',
]);
const sensitiveExtensions = ['.pem', '.key', '.p12', '.pfx'];

function normalized(relativePath: string): string {
  return relativePath.replaceAll('\\', '/').replace(/^\.\//, '');
}

export function isIgnoredDirectory(relativePath: string): boolean {
  const path = normalized(relativePath);
  const name = posix.basename(path).toLowerCase();
  const lowerPath = path.toLowerCase();
  return ignoredDirectoryNames.has(name)
    || [...ignoredDirectoryPaths].some((ignored) => lowerPath === ignored || lowerPath.startsWith(`${ignored}/`));
}

export function isSensitiveFile(relativePath: string): boolean {
  const name = basename(normalized(relativePath)).toLowerCase();
  return sensitiveExactNames.has(name)
    || name.startsWith('.env.')
    || name.startsWith('secrets.')
    || sensitiveExtensions.some((extension) => name.endsWith(extension));
}

export function isIgnoredGeneratedFile(relativePath: string): boolean {
  return ignoredGeneratedFiles.has(basename(normalized(relativePath)).toLowerCase());
}
