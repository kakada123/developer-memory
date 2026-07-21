import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './project.entity';
import { ProjectFile } from '../indexing/project-file.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(ProjectFile) private readonly files: Repository<ProjectFile>,
  ) {}

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
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.files.delete({ projectId: id });
    const result = await this.projects.delete(id);
    if (!result.affected) throw new NotFoundException(`Project ${id} was not found`);
  }
}
