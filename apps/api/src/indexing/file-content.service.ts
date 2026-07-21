import { Injectable } from '@nestjs/common';
import { open, stat } from 'node:fs/promises';
import type { FileHandle } from 'node:fs/promises';
import { indexingLimits } from './indexing.config';

export interface FileContentResult {
  content: string | null;
  lineCount: number;
  isBinary: boolean;
  storedBytes: number;
}

export function containsBinaryData(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  if (sample.includes(0)) return true;

  try {
    new TextDecoder('utf-8', { fatal: true }).decode(sample);
    return false;
  } catch {
    return true;
  }
}

@Injectable()
export class FileContentService {
  async read(
    path: string,
    sizeBytes: number,
    remainingTextBytes: number,
    expectedModifiedAtMs?: number,
  ): Promise<FileContentResult | null> {
    const bytesToRead = Math.min(sizeBytes, indexingLimits.maxFileSizeBytes) || 1;
    let handle: FileHandle | undefined;
    try {
      handle = await open(path, 'r');
      const buffer = Buffer.allocUnsafe(bytesToRead);
      const { bytesRead } = await handle.read(buffer, 0, bytesToRead, 0);
      const value = buffer.subarray(0, bytesRead);

      const after = await stat(path);
      if (after.size !== sizeBytes || (expectedModifiedAtMs !== undefined && after.mtimeMs !== expectedModifiedAtMs)) return null;
      if (containsBinaryData(value)) return { content: null, lineCount: 0, isBinary: true, storedBytes: 0 };
      if (sizeBytes > indexingLimits.maxFileSizeBytes || sizeBytes > remainingTextBytes) {
        return { content: null, lineCount: 0, isBinary: false, storedBytes: 0 };
      }

      const normalized = new TextDecoder('utf-8', { fatal: true })
        .decode(value)
        .replaceAll('\r\n', '\n')
        .replaceAll('\r', '\n')
        .replaceAll('\0', '');
      const lineCount = normalized.length === 0 ? 0 : normalized.split('\n').length;
      return { content: normalized, lineCount, isBinary: false, storedBytes: Buffer.byteLength(normalized) };
    } catch {
      return null;
    } finally {
      await handle?.close().catch(() => undefined);
    }
  }
}
