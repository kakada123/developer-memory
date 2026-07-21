import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, TableColumn } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './project.entity';
import { ProjectFile } from '../indexing/project-file.entity';

@Injectable()
export class ProjectsService implements OnModuleInit {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(ProjectFile) private readonly files: Repository<ProjectFile>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      if (!(await queryRunner.hasTable('projects'))) return;

      const legacyColumns = [
        new TableColumn({ name: 'indexStatus', type: 'text', default: "'NOT_INDEXED'" }),
        new TableColumn({ name: 'lastIndexedAt', type: 'datetime', isNullable: true }),
        new TableColumn({ name: 'indexedFileCount', type: 'integer', default: 0 }),
        new TableColumn({ name: 'indexError', type: 'text', isNullable: true }),
        new TableColumn({ name: 'gitSyncStatus', type: 'text', default: "'NOT_SYNCED'" }),
        new TableColumn({ name: 'lastGitSyncedAt', type: 'datetime', isNullable: true }),
        new TableColumn({ name: 'gitCommitCount', type: 'integer', default: 0 }),
        new TableColumn({ name: 'gitCurrentBranch', type: 'text', isNullable: true }),
        new TableColumn({ name: 'gitHeadHash', type: 'text', isNullable: true }),
        new TableColumn({ name: 'gitSyncError', type: 'text', isNullable: true }),
      ];

      for (const column of legacyColumns) {
        if (!(await queryRunner.hasColumn('projects', column.name))) {
          await queryRunner.addColumn('projects', column);
        }
      }
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Project[]> {
    return this.projects.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projects.findOneBy({ id });
    if (!project) throw new NotFoundException(`Project ${id} was not found`);
    return project;
  }

  async create(input: CreateProjectDto): Promise<Project> {
    const existing = await this.projects.findOneBy({ path: input.path });
    if (existing) throw new ConflictException('A project with this path already exists');

    try {
      return await this.projects.save(this.projects.create({
        ...input,
        framework: input.framework ?? null,
        language: input.language ?? null,
        hasGit: input.hasGit ?? false,
      }));
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictException('A project with this path already exists');
      }
      if (process.env.DEVELOPER_MEMORY_DEBUG === 'true' && error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.files.delete({ projectId: id });
    const result = await this.projects.delete(id);
    if (!result.affected) throw new NotFoundException(`Project ${id} was not found`);
  }
}
