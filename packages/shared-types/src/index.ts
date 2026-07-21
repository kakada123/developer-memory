export interface Project {
  id: string;
  name: string;
  path: string;
  framework: string | null;
  language: string | null;
  hasGit: boolean;
  indexStatus: ProjectIndexStatus;
  lastIndexedAt: string | null;
  indexedFileCount: number;
  indexError: string | null;
  gitSyncStatus: 'NOT_SYNCED'|'SYNCING'|'SYNCED'|'FAILED';
  lastGitSyncedAt: string|null;
  gitCommitCount: number;
  gitCurrentBranch: string|null;
  gitHeadHash: string|null;
  gitSyncError: string|null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectIndexStatus = 'NOT_INDEXED' | 'INDEXING' | 'INDEXED' | 'FAILED';
export type IndexProgressStatus = 'SCANNING' | 'READING' | 'SAVING' | 'COMPLETED' | 'FAILED';

export interface IndexProgress {
  projectId: string;
  status: IndexProgressStatus;
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

export interface IndexStatusResponse {
  project: Project;
  progress: IndexProgress | null;
  result: IndexResult | null;
}

export interface IndexedFile {
  id: string;
  projectId: string;
  relativePath: string;
  extension: string | null;
  language: string | null;
  sizeBytes: number;
  lineCount: number;
  isBinary: boolean;
  indexedAt: string;
}

export interface IndexedFileDetail extends IndexedFile {
  content: string | null;
}

export interface GitCommit {id:string;hash:string;shortHash:string;authorName:string;authorEmail:string|null;authoredAt:string;committerName:string|null;committerEmail:string|null;committedAt:string;subject:string;body:string|null;parentHashes:string[];branchNames:string[];tagNames:string[];filesChanged:number;insertions:number;deletions:number}
export interface GitCommitFile{id:string;relativePath:string;previousPath:string|null;changeType:string;insertions:number|null;deletions:number|null}
export interface DevelopmentSession{id:string;projectId:string;title:string;summary:string|null;status:'ACTIVE'|'COMPLETED'|'PAUSED';startedAt:string;endedAt:string|null;durationMinutes:number|null;branchName:string|null;baseCommitHash:string|null;headCommitHash:string|null;memories?:MemoryEntry[]}
export interface MemoryEntry{id:string;projectId:string;sessionId:string|null;type:'NOTE'|'DECISION'|'BUG'|'TASK'|'SOLUTION'|'QUESTION'|'OUTCOME';title:string;content:string;status:'OPEN'|'RESOLVED'|'ARCHIVED';priority:'LOW'|'MEDIUM'|'HIGH'|null;commitHash:string|null;relativeFilePath:string|null;lineStart:number|null;lineEnd:number|null;tags:string[];createdAt:string;updatedAt:string;resolvedAt:string|null;session?:DevelopmentSession|null}

export interface CreateProjectInput {
  name: string;
  path: string;
  framework?: string;
  language?: string;
  hasGit?: boolean;
}

export type DetectedProject = Required<CreateProjectInput>;

export interface DirectorySelection {
  canceled: boolean;
  path?: string;
}
