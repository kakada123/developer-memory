import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjects1721548800000 implements MigrationInterface {
  name = 'CreateProjects1721548800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar(200) NOT NULL,
        "path" text NOT NULL,
        "framework" text,
        "language" text,
        "hasGit" boolean NOT NULL DEFAULT (0),
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_projects_path" UNIQUE ("path")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "projects"');
  }
}
