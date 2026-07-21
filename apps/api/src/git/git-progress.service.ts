import { Injectable } from '@nestjs/common';
export type GitProgressStatus = 'VALIDATING'|'READING_COMMITS'|'READING_FILES'|'SAVING'|'COMPLETED'|'FAILED';
export interface GitSyncProgress { projectId:string; status:GitProgressStatus; processedCommits:number; totalCommits:number; percentage:number; currentCommit?:string; message?:string }
@Injectable()
export class GitProgressService {
  private readonly progress = new Map<string, GitSyncProgress>();
  get(projectId:string): GitSyncProgress|null { return this.progress.get(projectId) ?? null; }
  isActive(projectId:string): boolean { const value=this.get(projectId)?.status; return Boolean(value && !['COMPLETED','FAILED'].includes(value)); }
  set(value:GitSyncProgress): void { this.progress.set(value.projectId, value); }
  update(projectId:string, update:Partial<GitSyncProgress>): void { const value=this.progress.get(projectId); if(value) Object.assign(value, update); }
  clear(projectId:string): void { this.progress.delete(projectId); }
}
