import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { FileContentService } from './file-content.service';
import { FileHashService } from './file-hash.service';
import { FileScannerService } from './file-scanner.service';
import { IndexingController } from './indexing.controller';
import { IndexingService } from './indexing.service';
import { ProjectFile } from './project-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectFile])],
  controllers: [IndexingController],
  providers: [IndexingService, FileScannerService, FileContentService, FileHashService],
})
export class IndexingModule {}
