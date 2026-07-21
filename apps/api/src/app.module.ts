import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseOptions } from './database/database.config';
import { HealthController } from './health/health.controller';
import { IndexingModule } from './indexing/indexing.module';
import { ProjectsModule } from './projects/projects.module';
import { GitModule } from './git/git.module';
import { SessionsModule } from './sessions/sessions.module';
import { MemoriesModule } from './memories/memories.module';
import { SearchModule } from './search/search.module';
import { OverviewModule } from './overview/overview.module';

@Module({
  imports: [TypeOrmModule.forRoot(databaseOptions), ProjectsModule, IndexingModule, GitModule, SessionsModule, MemoriesModule, SearchModule, OverviewModule],
  controllers: [HealthController],
})
export class AppModule {}
