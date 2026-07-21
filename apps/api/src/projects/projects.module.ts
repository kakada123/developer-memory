import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectFile } from '../indexing/project-file.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectFile])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
