import { Injectable } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import type { ScannedFile } from './file-scanner.service';

@Injectable()
export class FileHashService {
  hashContent(content: string | Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }

  async hashFile(file: ScannedFile): Promise<string | null> {
    try {
      const hash = createHash('sha256');
      const stream = createReadStream(file.absolutePath);
      for await (const chunk of stream) hash.update(chunk as Buffer);

      const after = await stat(file.absolutePath);
      if (after.size !== file.sizeBytes || after.mtimeMs !== file.modifiedAtMs) return null;
      return hash.digest('hex');
    } catch {
      return null;
    }
  }
}
