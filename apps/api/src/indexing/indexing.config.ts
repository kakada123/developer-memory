export interface IndexingLimits {
  maxFileSizeBytes: number;
  maxScannedFiles: number;
  maxStoredTextBytes: number;
  readConcurrency: number;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const indexingLimits: IndexingLimits = {
  maxFileSizeBytes: positiveInteger(process.env.INDEX_MAX_FILE_SIZE_BYTES, 1024 * 1024),
  maxScannedFiles: positiveInteger(process.env.INDEX_MAX_SCANNED_FILES, 20_000),
  maxStoredTextBytes: positiveInteger(process.env.INDEX_MAX_STORED_TEXT_BYTES, 50 * 1024 * 1024),
  readConcurrency: positiveInteger(process.env.INDEX_READ_CONCURRENCY, 8),
};
