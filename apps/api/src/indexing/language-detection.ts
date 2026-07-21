import { basename, extname } from 'node:path';

const languagesByExtension: Readonly<Record<string, string>> = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript', '.jsx': 'JavaScript',
  '.vue': 'Vue', '.php': 'PHP', '.json': 'JSON', '.html': 'HTML', '.css': 'CSS',
  '.scss': 'SCSS', '.sass': 'Sass', '.less': 'Less', '.md': 'Markdown', '.yaml': 'YAML',
  '.yml': 'YAML', '.sql': 'SQL', '.prisma': 'Prisma', '.graphql': 'GraphQL', '.gql': 'GraphQL',
  '.xml': 'XML', '.toml': 'TOML', '.ini': 'INI', '.sh': 'Shell', '.ps1': 'PowerShell',
  '.dockerfile': 'Docker',
};
const languagesByFilename: Readonly<Record<string, string>> = {
  dockerfile: 'Docker', makefile: 'Makefile', procfile: 'Procfile',
};

export function detectFileLanguage(path: string): string | null {
  const name = basename(path).toLowerCase();
  return languagesByFilename[name] ?? languagesByExtension[extname(name)] ?? null;
}

export function isSupportedSourceFile(path: string): boolean {
  return detectFileLanguage(path) !== null;
}
