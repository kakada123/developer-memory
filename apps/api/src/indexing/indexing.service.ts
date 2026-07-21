import { ConflictException, Injectable, Logger, NotFoundException, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { extname } from 'node:path';
import { Project, ProjectIndexStatus } from '../projects/project.entity';
import { FileContentService, type FileContentResult } from './file-content.service';
import { FileHashService } from './file-hash.service';
import { FileScannerService, type ScannedFile } from './file-scanner.service';
import { indexingLimits } from './indexing.config';
import { detectFileLanguage } from './language-detection';
import { ProjectFile } from './project-file.entity';
import { classifyFileChange, findDeletedFileIds } from './change-detection';
import { indexStatusForOutcome } from './index-state';

export type ProgressStatus = 'SCANNING' | 'READING' | 'SAVING' | 'COMPLETED' | 'FAILED';

export interface IndexProgress {
  projectId: string;
  status: ProgressStatus;
  currentFile?: string;
  processedFiles: number;
  totalFiles: number;
  percentage: number;
  message?: string;
}

export interface IndexResult {
  projectId: string;
  status: ProjectIndexStatus;
  scannedFiles: number;
  indexedFiles: number;
  updatedFiles: number;
  unchangedFiles: number;
  deletedFiles: number;
  skippedFiles: number;
  durationMs: number;
}

interface PreparedFile {
  scanned: ScannedFile;
  hash: string;
  existing: ProjectFile | undefined;
  content?: FileContentResult;
}

interface ActiveJob {
  progress: IndexProgress;
  result: IndexResult | null;
}

async function mapInBatches<T, R>(
  values: T[],
  concurrency: number,
  operation: (value: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < values.length; index += concurrency) {
    results.push(...await Promise.all(values.slice(index, index + concurrency).map(operation)));
  }
  return results;
}

function safeIndexError(error: unknown): string {
  if (error instanceof Error && error.message === 'The project contains more files than the configured scan limit.') {
    return error.message;
  }
  if (error instanceof Error && error.message === 'The registered project directory is unavailable.') {
    return error.message;
  }
  return 'Indexing failed. Verify the project directory is accessible and try again.';
}

@Injectable()
export class IndexingService implements OnModuleInit {
  private readonly logger = new Logger(IndexingService.name);
  private readonly jobs = new Map<string, ActiveJob>();
  private readonly lastResults = new Map<string, IndexResult>();

  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(ProjectFile) private readonly files: Repository<ProjectFile>,
    private readonly dataSource: DataSource,
    private readonly scanner: FileScannerService,
    private readonly contentReader: FileContentService,
    private readonly hasher: FileHashService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.projects.update(
      { indexStatus: ProjectIndexStatus.INDEXING },
      {
        indexStatus: ProjectIndexStatus.FAILED,
        indexError: 'Indexing was interrupted before it completed. Please try again.',
      },
    );
  }

  async start(projectId: string): Promise<IndexProgress> {
    if (this.isActive(projectId)) throw new ConflictException('This project is already being indexed');

    const project = await this.projects.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException('Project was not found');

    const progress: IndexProgress = {
      projectId,
      status: 'SCANNING',
      processedFiles: 0,
      totalFiles: 0,
      percentage: 0,
      message: 'Scanning project files…',
    };
    this.jobs.set(projectId, { progress, result: null });
    try {
      await this.projects.update(projectId, { indexStatus: indexStatusForOutcome('start'), indexError: null });
    } catch (error: unknown) {
      this.jobs.delete(projectId);
      throw error;
    }
    void this.run(project).catch(() => {
      this.logger.error('An unhandled indexing job error occurred');
    });
    return progress;
  }

  async status(projectId: string): Promise<{ project: Project; progress: IndexProgress | null; result: IndexResult | null }> {
    const project = await this.projects.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException('Project was not found');
    const job = this.jobs.get(projectId);
    return {
      project,
      progress: job?.progress ?? null,
      result: job?.result ?? this.lastResults.get(projectId) ?? null,
    };
  }

  async listFiles(projectId: string): Promise<ProjectFile[]> {
    await this.requireProject(projectId);
    return this.files.find({
      where: { projectId },
      select: ['id', 'projectId', 'relativePath', 'extension', 'language', 'sizeBytes', 'lineCount', 'isBinary', 'indexedAt'],
      order: { relativePath: 'ASC' },
    });
  }

  async getFile(projectId: string, fileId: string): Promise<ProjectFile> {
    await this.requireProject(projectId);
    const file = await this.files.findOne({
      where: { id: fileId, projectId },
      select: ['id', 'projectId', 'relativePath', 'extension', 'language', 'sizeBytes', 'content', 'lineCount', 'isBinary', 'indexedAt'],
    });
    if (!file) throw new NotFoundException('Indexed file was not found');
    return file;
  }

  async clear(projectId: string): Promise<void> {
    if (this.isActive(projectId)) throw new ConflictException('Indexing is currently active');
    await this.requireProject(projectId);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(ProjectFile, { projectId });
      await manager.update(Project, projectId, {
        indexStatus: indexStatusForOutcome('clear'),
        lastIndexedAt: null,
        indexedFileCount: 0,
        indexError: null,
      });
    });
    this.lastResults.delete(projectId);
  }

  private async requireProject(projectId: string): Promise<void> {
    if (!await this.projects.existsBy({ id: projectId })) throw new NotFoundException('Project was not found');
  }

  private isActive(projectId: string): boolean {
    const status = this.jobs.get(projectId)?.progress.status;
    return status === 'SCANNING' || status === 'READING' || status === 'SAVING';
  }

  private updateProgress(projectId: string, update: Partial<IndexProgress>): void {
    const job = this.jobs.get(projectId);
    if (!job) return;
    Object.assign(job.progress, update);
  }

  private async run(project: Project): Promise<void> {
    const startedAt = Date.now();
    try {
      const scan = await this.scanner.scan(project.path);
      const existingFiles = await this.files.find({
        where: { projectId: project.id },
        select: [
          'id', 'projectId', 'relativePath', 'absolutePath', 'extension', 'language', 'sizeBytes',
          'contentHash', 'lineCount', 'isBinary', 'indexedAt', 'createdAt', 'updatedAt',
        ],
      });
      const existingByPath = new Map(existingFiles.map((file) => [file.relativePath, file]));
      const seenPaths = new Set(scan.files.map((file) => file.relativePath));
      const totalFiles = scan.files.length;

      this.updateProgress(project.id, {
        status: 'READING', totalFiles, processedFiles: 0, percentage: 0, message: 'Reading and hashing source files…',
      });

      let processedFiles = 0;
      const hashed = await mapInBatches(scan.files, indexingLimits.readConcurrency, async (scanned) => {
        const hash = await this.hasher.hashFile(scanned);
        processedFiles += 1;
        this.updateProgress(project.id, {
          currentFile: scanned.relativePath,
          processedFiles,
          percentage: totalFiles === 0 ? 100 : Math.round((processedFiles / totalFiles) * 75),
        });
        return hash ? { scanned, hash, existing: existingByPath.get(scanned.relativePath) } : null;
      });
      const readable: PreparedFile[] = hashed.filter((file): file is PreparedFile => file !== null);
      const changed = readable.filter((file) => classifyFileChange(file.existing?.contentHash, file.hash) !== 'UNCHANGED');
      const unchangedFiles = readable.length - changed.length;

      const storedSize = await this.files.createQueryBuilder('file')
        .select('COALESCE(SUM(LENGTH(CAST(file.content AS BLOB))), 0)', 'total')
        .where('file.projectId = :projectId', { projectId: project.id })
        .getRawOne<{ total: number | string }>();
      const existingStoredTextBytes = Number(storedSize?.total ?? 0);

      const contents = await mapInBatches(changed, indexingLimits.readConcurrency, (file) =>
        this.contentReader.read(
          file.scanned.absolutePath,
          file.scanned.sizeBytes,
          Math.max(0, indexingLimits.maxStoredTextBytes - existingStoredTextBytes),
          file.scanned.modifiedAtMs,
        ));
      let storedTextBytes = existingStoredTextBytes;
      for (let index = 0; index < changed.length; index += 1) {
        const content = contents[index];
        if (!content) continue;
        if (storedTextBytes + content.storedBytes > indexingLimits.maxStoredTextBytes) {
          changed[index]!.content = { content: null, lineCount: 0, isBinary: false, storedBytes: 0 };
        } else {
          changed[index]!.content = content;
          storedTextBytes += content.storedBytes;
        }
      }

      const prepared = changed.filter((file) => file.content !== undefined);
      const deletedIds = findDeletedFileIds(existingFiles, seenPaths);
      this.updateProgress(project.id, { status: 'SAVING', currentFile: undefined, percentage: 90, message: 'Saving index…' });

      const now = new Date();
      const indexedFileCount = existingFiles.length - deletedIds.length
        + prepared.filter((file) => !file.existing).length;
      await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(ProjectFile);
        for (let index = 0; index < prepared.length; index += 100) {
          const batch = prepared.slice(index, index + 100).map(({ scanned, hash, existing, content }) => repository.create({
            ...existing,
            projectId: project.id,
            relativePath: scanned.relativePath,
            absolutePath: scanned.absolutePath,
            extension: extname(scanned.relativePath).toLowerCase() || null,
            language: detectFileLanguage(scanned.relativePath),
            sizeBytes: scanned.sizeBytes,
            contentHash: hash,
            content: content?.content ?? null,
            lineCount: content?.lineCount ?? 0,
            isBinary: content?.isBinary ?? false,
            indexedAt: now,
          }));
          await repository.save(batch, { chunk: 100 });
        }
        if (deletedIds.length > 0) await repository.delete({ id: In(deletedIds) });

        await manager.update(Project, project.id, {
          indexStatus: indexStatusForOutcome('complete'),
          lastIndexedAt: now,
          indexedFileCount,
          indexError: null,
        });
      });

      const result: IndexResult = {
        projectId: project.id,
        status: ProjectIndexStatus.INDEXED,
        scannedFiles: scan.scannedFiles,
        indexedFiles: indexedFileCount,
        updatedFiles: prepared.filter((file) => file.existing).length,
        unchangedFiles,
        deletedFiles: deletedIds.length,
        skippedFiles: scan.skippedFiles + hashed.length - readable.length + changed.length - prepared.length,
        durationMs: Date.now() - startedAt,
      };
      this.lastResults.set(project.id, result);
      const job = this.jobs.get(project.id);
      if (job) job.result = result;
      this.updateProgress(project.id, {
        status: 'COMPLETED', processedFiles: totalFiles, totalFiles, percentage: 100, message: 'Indexing complete.',
      });
    } catch (error: unknown) {
      const message = safeIndexError(error);
      try {
        await this.projects.update(project.id, { indexStatus: indexStatusForOutcome('fail'), indexError: message });
      } catch {
        this.logger.error('Could not persist the failed indexing status');
      }
      this.updateProgress(project.id, { status: 'FAILED', currentFile: undefined, message });
    } finally {
      setTimeout(() => this.jobs.delete(project.id), 60_000).unref();
    }
  }
}
