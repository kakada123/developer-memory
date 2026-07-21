import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { DevelopmentSession } from '../sessions/development-session.entity';

export enum MemoryType { NOTE='NOTE', DECISION='DECISION', BUG='BUG', TASK='TASK', SOLUTION='SOLUTION', QUESTION='QUESTION', OUTCOME='OUTCOME' }
export enum MemoryStatus { OPEN='OPEN', RESOLVED='RESOLVED', ARCHIVED='ARCHIVED' }
export enum MemoryPriority { LOW='LOW', MEDIUM='MEDIUM', HIGH='HIGH' }
@Entity('memory_entries')
@Index('IDX_memories_project', ['projectId']) @Index('IDX_memories_session', ['sessionId']) @Index('IDX_memories_type', ['type'])
@Index('IDX_memories_status', ['status']) @Index('IDX_memories_commit', ['commitHash']) @Index('IDX_memories_file', ['relativeFilePath']) @Index('IDX_memories_created', ['createdAt'])
export class MemoryEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') projectId: string;
  @ManyToOne(() => Project, (project) => project.memories, { onDelete: 'CASCADE' }) project: Project;
  @Column({ type: 'uuid', nullable: true }) sessionId: string | null;
  @ManyToOne(() => DevelopmentSession, (session) => session.memories, { nullable: true, onDelete: 'SET NULL' }) session: DevelopmentSession | null;
  @Column({ type: 'text' }) type: MemoryType;
  @Column({ length: 200 }) title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ type: 'text', default: MemoryStatus.OPEN }) status: MemoryStatus;
  @Column({ type: 'text', nullable: true }) priority: MemoryPriority | null;
  @Column({ type: 'text', nullable: true }) commitHash: string | null;
  @Column({ type: 'text', nullable: true }) relativeFilePath: string | null;
  @Column({ type: 'integer', nullable: true }) lineStart: number | null;
  @Column({ type: 'integer', nullable: true }) lineEnd: number | null;
  @Column({ type: 'simple-json' }) tags: string[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @Column({ type: 'datetime', nullable: true }) resolvedAt: Date | null;
}
