import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectIndexing1721635200000 implements MigrationInterface {
  name = 'AddProjectIndexing1721635200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN "indexStatus" text NOT NULL DEFAULT ('NOT_INDEXED')`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN "lastIndexedAt" datetime`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN "indexedFileCount" integer NOT NULL DEFAULT (0)`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN "indexError" text`);
    await queryRunner.query(`
      CREATE TABLE "project_files" (
        "id" varchar PRIMARY KEY NOT NULL,
        "projectId" varchar NOT NULL,
        "relativePath" text NOT NULL,
        "absolutePath" text NOT NULL,
        "extension" text,
        "language" text,
        "sizeBytes" integer NOT NULL,
        "contentHash" text NOT NULL,
        "content" text,
        "lineCount" integer NOT NULL DEFAULT (0),
        "isBinary" boolean NOT NULL DEFAULT (0),
        "indexedAt" datetime NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_project_files_project_path" UNIQUE ("projectId", "relativePath"),
        CONSTRAINT "FK_project_files_project" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_project_files_project_id" ON "project_files" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_files_content_hash" ON "project_files" ("contentHash")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_project_files_content_hash"`);
    await queryRunner.query(`DROP INDEX "IDX_project_files_project_id"`);
    await queryRunner.query(`DROP TABLE "project_files"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "indexError"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "indexedFileCount"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "lastIndexedAt"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "indexStatus"`);
  }
}
