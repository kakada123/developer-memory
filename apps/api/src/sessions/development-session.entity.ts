import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { MemoryEntry } from '../memories/memory-entry.entity';

export enum SessionStatus { ACTIVE='ACTIVE', COMPLETED='COMPLETED', PAUSED='PAUSED' }
@Entity('development_sessions')
@Index('IDX_sessions_project', ['projectId']) @Index('IDX_sessions_status', ['status']) @Index('IDX_sessions_started', ['startedAt'])
@Index('UQ_active_session_project', ['projectId'], { unique: true, where: "status = 'ACTIVE'" })
export class DevelopmentSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') projectId: string;
  @ManyToOne(() => Project, (project) => project.sessions, { onDelete: 'CASCADE' }) project: Project;
  @Column({ length: 200 }) title: string;
  @Column({ type: 'text', nullable: true }) summary: string | null;
  @Column({ type: 'text', default: SessionStatus.ACTIVE }) status: SessionStatus;
  @Column({ type: 'datetime' }) startedAt: Date;
  @Column({ type: 'datetime', nullable: true }) endedAt: Date | null;
  @Column({ type: 'integer', nullable: true }) durationMinutes: number | null;
  @Column({ type: 'text', nullable: true }) branchName: string | null;
  @Column({ type: 'text', nullable: true }) baseCommitHash: string | null;
  @Column({ type: 'text', nullable: true }) headCommitHash: string | null;
  @OneToMany(() => MemoryEntry, (memory) => memory.session) memories: MemoryEntry[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
