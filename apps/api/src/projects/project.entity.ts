import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { ProjectFile } from '../indexing/project-file.entity';
import { GitCommit } from '../git/git-commit.entity';
import { DevelopmentSession } from '../sessions/development-session.entity';
import { MemoryEntry } from '../memories/memory-entry.entity';

export enum ProjectIndexStatus {
  NOT_INDEXED = 'NOT_INDEXED',
  INDEXING = 'INDEXING',
  INDEXED = 'INDEXED',
  FAILED = 'FAILED',
}

export enum GitSyncStatus { NOT_SYNCED = 'NOT_SYNCED', SYNCING = 'SYNCING', SYNCED = 'SYNCED', FAILED = 'FAILED' }

@Entity('projects')
@Unique('UQ_projects_path', ['path'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text' })
  path: string;

  @Column({ type: 'text', nullable: true })
  framework: string | null;

  @Column({ type: 'text', nullable: true })
  language: string | null;

  @Column({ default: false })
  hasGit: boolean;

  @Column({ type: 'text', default: ProjectIndexStatus.NOT_INDEXED })
  indexStatus: ProjectIndexStatus;

  @Column({ type: 'datetime', nullable: true })
  lastIndexedAt: Date | null;

  @Column({ default: 0 })
  indexedFileCount: number;

  @Column({ type: 'text', nullable: true })
  indexError: string | null;

  @OneToMany(() => ProjectFile, (file) => file.project, { cascade: false })
  files: ProjectFile[];

  @Column({ type: 'text', default: GitSyncStatus.NOT_SYNCED })
  gitSyncStatus: GitSyncStatus;

  @Column({ type: 'datetime', nullable: true })
  lastGitSyncedAt: Date | null;

  @Column({ default: 0 })
  gitCommitCount: number;

  @Column({ type: 'text', nullable: true })
  gitCurrentBranch: string | null;

  @Column({ type: 'text', nullable: true })
  gitHeadHash: string | null;

  @Column({ type: 'text', nullable: true })
  gitSyncError: string | null;

  @OneToMany(() => GitCommit, (commit) => commit.project)
  commits: GitCommit[];

  @OneToMany(() => DevelopmentSession, (session) => session.project)
  sessions: DevelopmentSession[];

  @OneToMany(() => MemoryEntry, (memory) => memory.project)
  memories: MemoryEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
