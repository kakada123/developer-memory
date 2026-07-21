import { Injectable } from '@nestjs/common';
import { opendir, realpath, stat } from 'node:fs/promises';
import type { Dir, Stats } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { indexingLimits } from './indexing.config';
import { isIgnoredDirectory, isIgnoredGeneratedFile, isSensitiveFile } from './ignore-rules';
import { isSupportedSourceFile } from './language-detection';

export interface ScannedFile {
  absolutePath: string;
  relativePath: string;
  sizeBytes: number;
  modifiedAtMs: number;
}

export interface ScanResult {
  files: ScannedFile[];
  scannedFiles: number;
  skippedFiles: number;
}

export function isPathInside(root: string, candidate: string): boolean {
  const pathFromRoot = relative(resolve(root), resolve(candidate));
  return pathFromRoot === '' || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..' && !isAbsolute(pathFromRoot));
}

@Injectable()
export class FileScannerService {
  async scan(projectPath: string): Promise<ScanResult> {
    const root = await realpath(projectPath);
    const rootStat = await stat(root);
    if (!rootStat.isDirectory()) throw new Error('The registered project directory is unavailable.');

    const files: ScannedFile[] = [];
    const pending = [root];
    const visitedDirectories = new Set<string>([root]);
    let scannedFiles = 0;
    let skippedFiles = 0;

    while (pending.length > 0) {
      const directoryPath = pending.pop();
      if (!directoryPath) break;

      let directory: Dir;
      try {
        directory = await opendir(directoryPath);
      } catch {
        skippedFiles += 1;
        continue;
      }

      for await (const entry of directory) {
        const lexicalPath = join(directoryPath, entry.name);
        const lexicalRelativePath = relative(root, lexicalPath).replaceAll(sep, '/');

        if ((entry.isDirectory() || entry.isSymbolicLink()) && isIgnoredDirectory(lexicalRelativePath)) {
          skippedFiles += 1;
          continue;
        }

        let resolvedPath: string;
        let fileStat: Stats;
        try {
          resolvedPath = await realpath(lexicalPath);
          if (!isPathInside(root, resolvedPath)) {
            skippedFiles += 1;
            continue;
          }
          fileStat = await stat(resolvedPath);
        } catch {
          skippedFiles += 1;
          continue;
        }

        if (fileStat.isDirectory()) {
          if (!visitedDirectories.has(resolvedPath)) {
            visitedDirectories.add(resolvedPath);
            pending.push(resolvedPath);
          }
          continue;
        }
        if (!fileStat.isFile()) continue;

        scannedFiles += 1;
        if (scannedFiles > indexingLimits.maxScannedFiles) {
          throw new Error('The project contains more files than the configured scan limit.');
        }

        if (isSensitiveFile(lexicalRelativePath)
          || isIgnoredGeneratedFile(lexicalRelativePath)
          || !isSupportedSourceFile(lexicalRelativePath)) {
          skippedFiles += 1;
          continue;
        }

        files.push({
          absolutePath: resolvedPath,
          relativePath: lexicalRelativePath,
          sizeBytes: fileStat.size,
          modifiedAtMs: fileStat.mtimeMs,
        });
      }
    }

    return { files, scannedFiles, skippedFiles };
  }
}
