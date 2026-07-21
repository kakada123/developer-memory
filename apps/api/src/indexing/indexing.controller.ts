import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { IndexingService } from './indexing.service';

@Controller('projects/:projectId')
export class IndexingController {
  constructor(private readonly indexing: IndexingService) {}

  @Post('index')
  @HttpCode(HttpStatus.ACCEPTED)
  start(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.indexing.start(projectId);
  }

  @Get('index/status')
  status(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.indexing.status(projectId);
  }

  @Get('files')
  listFiles(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.indexing.listFiles(projectId);
  }

  @Get('files/:fileId')
  getFile(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
  ) {
    return this.indexing.getFile(projectId, fileId);
  }

  @Delete('index')
  @HttpCode(HttpStatus.NO_CONTENT)
  clear(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.indexing.clear(projectId);
  }
}
