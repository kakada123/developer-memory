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

  async list(projectId: string): Promise<{ currentBranch: string | null; branches: string[]; remoteDiscoveryFailed: boolean }> {
    const project = await this.getProject(projectId);
    await this.commands.validateRepository(project.path);
    const [currentBranch, localBranches, trackingBranches, remotes] = await Promise.all([
      this.commands.branch(project.path),
      this.commands.localBranches(project.path),
      this.commands.remoteBranches(project.path),
      this.commands.remotes(project.path),
    ]);
    let remoteDiscoveryFailed = false;
    const remoteResults = await Promise.all(remotes.slice(0, 10).map(async (remote) => {
      try {
        return await this.commands.remoteHeads(project.path, remote);
      } catch {
        remoteDiscoveryFailed = true;
        return [];
      }
    }));
    const discoveredRemoteBranches = remoteResults.flat();
    const remoteBranches = [...new Set([...trackingBranches, ...discoveredRemoteBranches])];
    const branches = [...localBranches, ...remoteBranches.filter((remote) => {
      const trackingName = remote.split('/').slice(1).join('/');
      return trackingName && !localBranches.includes(trackingName);
    })];
    const availableBranches = currentBranch && !branches.includes(currentBranch)
      ? [currentBranch, ...branches]
      : branches;
    return { currentBranch: currentBranch || null, branches: availableBranches, remoteDiscoveryFailed };
  }

  async switch(projectId: string, requestedBranch: string): Promise<{ branch: string; headHash: string }> {
    if (this.progress.isActive(projectId)) throw new ConflictException('Wait for Git synchronization to finish before switching branches');

    const project = await this.getProject(projectId);
    await this.commands.validateRepository(project.path);
    const [localBranches, trackingBranches, remotes] = await Promise.all([
      this.commands.localBranches(project.path),
      this.commands.remoteBranches(project.path),
      this.commands.remotes(project.path),
    ]);
    const remote = remotes.find((name) => requestedBranch.startsWith(`${name}/`));
    const remoteBranchName = remote ? requestedBranch.slice(remote.length + 1) : null;
    let isKnownRemoteBranch = trackingBranches.includes(requestedBranch);
    if (remote && remoteBranchName && !isKnownRemoteBranch) {
      isKnownRemoteBranch = (await this.commands.remoteHeads(project.path, remote)).includes(requestedBranch);
    }
    if (!localBranches.includes(requestedBranch) && !isKnownRemoteBranch) {
      throw new NotFoundException('The selected branch was not found');
    }
    if (await this.commands.hasWorkingTreeChanges(project.path)) {
      throw new ConflictException('Branch switching is blocked because the project has uncommitted changes');
    }

    const currentBranch = await this.commands.branch(project.path);
    if (currentBranch !== requestedBranch) {
      if (localBranches.includes(requestedBranch)) {
        await this.commands.switchBranch(project.path, requestedBranch);
      } else {
        if (!trackingBranches.includes(requestedBranch) && remote && remoteBranchName) {
          await this.commands.fetchRemoteBranch(project.path, remote, remoteBranchName);
        }
        await this.commands.switchRemoteBranch(project.path, requestedBranch);
      }
    }
    const activeBranch = await this.commands.branch(project.path);
    const headHash = await this.commands.head(project.path);
    await this.projects.update(projectId, {
      gitCurrentBranch: activeBranch || requestedBranch,
      gitHeadHash: headHash,
      gitSyncStatus: GitSyncStatus.NOT_SYNCED,
      gitSyncError: null,
    });
    return { branch: activeBranch || requestedBranch, headHash };
  }

  async refresh(projectId: string): Promise<{ currentBranch: string | null; branches: string[]; remoteDiscoveryFailed: boolean }> {
    if (this.progress.isActive(projectId)) throw new ConflictException('Wait for Git synchronization to finish before refreshing branches');
    const project = await this.getProject(projectId);
    await this.commands.validateRepository(project.path);
    const remotes = await this.commands.remotes(project.path);
    if (remotes.length === 0) throw new NotFoundException('This repository has no configured Git remotes');

    for (const remote of remotes.slice(0, 10)) {
      await this.commands.refreshRemoteBranches(project.path, remote);
    }
    return this.list(projectId);
  }

  private async getProject(projectId: string): Promise<Project> {
    const project = await this.projects.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException('Project was not found');
    return project;
  }
}
