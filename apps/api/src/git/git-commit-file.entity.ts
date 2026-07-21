import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { GitCommit } from './git-commit.entity';

export enum GitChangeType { ADDED='ADDED', MODIFIED='MODIFIED', DELETED='DELETED', RENAMED='RENAMED', COPIED='COPIED', TYPE_CHANGED='TYPE_CHANGED', UNKNOWN='UNKNOWN' }

@Entity('git_commit_files')
@Unique('UQ_commit_file_path', ['commitId', 'relativePath', 'previousPath'])
@Index('IDX_commit_files_commit', ['commitId'])
@Index('IDX_commit_files_project', ['projectId'])
@Index('IDX_commit_files_path', ['relativePath'])
export class GitCommitFile {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') commitId: string;
  @ManyToOne(() => GitCommit, (commit) => commit.files, { onDelete: 'CASCADE' }) commit: GitCommit;
  @Column('uuid') projectId: string;
  @Column({ type: 'text' }) relativePath: string;
  @Column({ type: 'text', nullable: true }) previousPath: string | null;
  @Column({ type: 'text', default: GitChangeType.UNKNOWN }) changeType: GitChangeType;
  @Column({ type: 'integer', nullable: true }) insertions: number | null;
  @Column({ type: 'integer', nullable: true }) deletions: number | null;
  @CreateDateColumn() createdAt: Date;
}
