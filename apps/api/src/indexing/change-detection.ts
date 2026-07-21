export type FileChange = 'NEW' | 'CHANGED' | 'UNCHANGED';

export function classifyFileChange(existingHash: string | undefined, currentHash: string): FileChange {
  if (existingHash === undefined) return 'NEW';
  return existingHash === currentHash ? 'UNCHANGED' : 'CHANGED';
}

export function findDeletedFileIds(
  existing: ReadonlyArray<{ id: string; relativePath: string }>,
  scannedPaths: ReadonlySet<string>,
): string[] {
  return existing.filter((file) => !scannedPaths.has(file.relativePath)).map((file) => file.id);
}
