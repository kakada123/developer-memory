import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function defaultDataDirectory(): string {
  if (process.platform === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'Developer Memory');
  }
  if (process.platform === 'win32') {
    return join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'Developer Memory');
  }
  return join(process.env.XDG_DATA_HOME ?? join(homedir(), '.local', 'share'), 'developer-memory');
}

export function resolveDatabasePath(): string {
  const databasePath = process.env.DEVELOPER_MEMORY_DB_PATH ?? join(defaultDataDirectory(), 'developer-memory.sqlite');
  mkdirSync(dirname(databasePath), { recursive: true });
  return databasePath;
}

export const databaseOptions: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: resolveDatabasePath(),
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production',
  migrationsRun: process.env.NODE_ENV === 'production',
  migrations: [join(__dirname, 'migrations', '*{.js,.ts}')],
};
