import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GitSyncStatus, Project } from '../projects/project.entity';
import { GitCommandService } from './git-command.service';
import { GitProgressService } from './git-progress.service';

@Injectable()
export class GitBranchService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    private readonly commands: GitCommandService,
    private readonly progress: GitProgressService,
  ) {}

  async list(projectId: string): Promise<{ currentBranch: string | null; branches: string[] }> {
    const project = await this.getProject(projectId);
    await this.commands.validateRepository(project.path);
    const [currentBranch, branches] = await Promise.all([
      this.commands.branch(project.path),
      this.commands.localBranches(project.path),
    ]);
    return { currentBranch: currentBranch || null, branches };
  }

  async switch(projectId: string, requestedBranch: string): Promise<{ branch: string; headHash: string }> {
    if (this.progress.isActive(projectId)) throw new ConflictException('Wait for Git synchronization to finish before switching branches');

    const project = await this.getProject(projectId);
    await this.commands.validateRepository(project.path);
    const branches = await this.commands.localBranches(project.path);
    if (!branches.includes(requestedBranch)) throw new NotFoundException('The selected local branch was not found');
    if (await this.commands.hasWorkingTreeChanges(project.path)) {
      throw new ConflictException('Branch switching is blocked because the project has uncommitted changes');
    }

    const currentBranch = await this.commands.branch(project.path);
    if (currentBranch !== requestedBranch) await this.commands.switchBranch(project.path, requestedBranch);
    const headHash = await this.commands.head(project.path);
    await this.projects.update(projectId, {
      gitCurrentBranch: requestedBranch,
      gitHeadHash: headHash,
      gitSyncStatus: GitSyncStatus.NOT_SYNCED,
      gitSyncError: null,
    });
    return { branch: requestedBranch, headHash };
  }

  private async getProject(projectId: string): Promise<Project> {
    const project = await this.projects.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException('Project was not found');
    return project;
  }
}
