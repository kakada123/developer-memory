import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { GitCommitFile } from './git-commit-file.entity';

@Entity('git_commits')
@Unique('UQ_git_commits_project_hash', ['projectId', 'hash'])
@Index('IDX_git_commits_project', ['projectId'])
@Index('IDX_git_commits_authored', ['authoredAt'])
@Index('IDX_git_commits_committed', ['committedAt'])
@Index('IDX_git_commits_subject', ['subject'])
export class GitCommit {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') projectId: string;
  @ManyToOne(() => Project, (project) => project.commits, { onDelete: 'CASCADE' }) project: Project;
  @Column({ type: 'text' }) hash: string;
  @Column({ type: 'text' }) shortHash: string;
  @Column({ type: 'text' }) authorName: string;
  @Column({ type: 'text', nullable: true }) authorEmail: string | null;
  @Column({ type: 'datetime' }) authoredAt: Date;
  @Column({ type: 'text', nullable: true }) committerName: string | null;
  @Column({ type: 'text', nullable: true }) committerEmail: string | null;
  @Column({ type: 'datetime' }) committedAt: Date;
  @Column({ type: 'text' }) subject: string;
  @Column({ type: 'text', nullable: true }) body: string | null;
  @Column({ type: 'simple-json' }) parentHashes: string[];
  @Column({ type: 'simple-json' }) branchNames: string[];
  @Column({ type: 'simple-json' }) tagNames: string[];
  @Column({ default: 0 }) filesChanged: number;
  @Column({ default: 0 }) insertions: number;
  @Column({ default: 0 }) deletions: number;
  @OneToMany(() => GitCommitFile, (file) => file.commit) files: GitCommitFile[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
