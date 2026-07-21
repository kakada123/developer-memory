import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Project } from '../projects/project.entity';

@Entity('project_files')
@Unique('UQ_project_files_project_path', ['projectId', 'relativePath'])
@Index('IDX_project_files_project_id', ['projectId'])
@Index('IDX_project_files_content_hash', ['contentHash'])
export class ProjectFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @ManyToOne(() => Project, (project) => project.files, { onDelete: 'CASCADE' })
  project: Project;

  @Column({ type: 'text' })
  relativePath: string;

  @Column({ type: 'text' })
  absolutePath: string;

  @Column({ type: 'text', nullable: true })
  extension: string | null;

  @Column({ type: 'text', nullable: true })
  language: string | null;

  @Column({ type: 'integer' })
  sizeBytes: number;

  @Column({ type: 'text' })
  contentHash: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'integer', default: 0 })
  lineCount: number;

  @Column({ default: false })
  isBinary: boolean;

  @Column({ type: 'datetime' })
  indexedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
