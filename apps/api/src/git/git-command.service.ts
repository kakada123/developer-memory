import { Injectable } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { realpath } from 'node:fs/promises';
import { resolve } from 'node:path';

const execFileAsync = promisify(execFile);
const options = { timeout: 30_000, maxBuffer: 32 * 1024 * 1024, windowsHide: true } as const;

@Injectable()
export class GitCommandService {
  private async run(cwd: string, args: readonly string[]): Promise<string> {
    try {
      const result = await execFileAsync('git', [...args], {
        cwd,
        ...options,
        env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' },
      });
      return result.stdout;
    } catch (error: unknown) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
      if (code === 'ENOENT') throw new Error('Git is not installed or is unavailable.');
      if (code === 'ETIMEDOUT') throw new Error('The Git command timed out.');
      throw new Error('Git history could not be read from this project.');
    }
  }

  async validateRepository(projectPath: string): Promise<void> {
    const root = await realpath(projectPath).catch(() => { throw new Error('The project directory is unavailable.'); });
    const inside = (await this.run(root, ['rev-parse', '--is-inside-work-tree'])).trim();
    const topLevel = (await this.run(root, ['rev-parse', '--show-toplevel'])).trim();
    if (inside !== 'true' || resolve(await realpath(topLevel)) !== resolve(root)) {
      throw new Error('The project folder is not the root of a Git repository.');
    }
  }

  head(cwd: string): Promise<string> { return this.run(cwd, ['rev-parse', 'HEAD']).then((value) => value.trim()); }
  branch(cwd: string): Promise<string> { return this.run(cwd, ['branch', '--show-current']).then((value) => value.trim()); }
  localBranches(cwd: string): Promise<string[]> {
    return this.run(cwd, ['branch', '--format=%(refname:short)'])
      .then((value) => value.split('\n').map((branch) => branch.trim()).filter(Boolean));
  }
  remoteBranches(cwd: string): Promise<string[]> {
    return this.run(cwd, ['branch', '--remotes', '--format=%(refname:short)'])
      .then((value) => value.split('\n').map((branch) => branch.trim()).filter((branch) => Boolean(branch) && !branch.endsWith('/HEAD')));
  }
  remotes(cwd: string): Promise<string[]> {
    return this.run(cwd, ['remote']).then((value) => value.split('\n').map((remote) => remote.trim()).filter(Boolean));
  }
  remoteHeads(cwd: string, remote: string): Promise<string[]> {
    return this.run(cwd, ['ls-remote', '--heads', remote]).then((value) => value.split('\n').flatMap((line) => {
      const match = line.match(/^[0-9a-f]{40}\trefs\/heads\/(.+)$/i);
      return match?.[1] ? [`${remote}/${match[1]}`] : [];
    }));
  }
  hasWorkingTreeChanges(cwd: string): Promise<boolean> {
    return this.run(cwd, ['status', '--porcelain=v1', '-z']).then((value) => value.length > 0);
  }
  switchBranch(cwd: string, branch: string): Promise<void> {
    return this.run(cwd, ['switch', '--', branch]).then(() => undefined);
  }
  switchRemoteBranch(cwd: string, remoteBranch: string): Promise<void> {
    return this.run(cwd, ['switch', '--track', remoteBranch]).then(() => undefined);
  }
  fetchRemoteBranch(cwd: string, remote: string, branch: string): Promise<void> {
    const refspec = `refs/heads/${branch}:refs/remotes/${remote}/${branch}`;
    return this.run(cwd, ['fetch', '--no-tags', remote, refspec]).then(() => undefined);
  }
  refreshRemoteBranches(cwd: string, remote: string): Promise<void> {
    const refspec = `+refs/heads/*:refs/remotes/${remote}/*`;
    return this.run(cwd, ['fetch', '--prune', '--no-tags', remote, refspec]).then(() => undefined);
  }
  isAncestor(cwd: string, hash: string, head: string): Promise<boolean> {
    return this.run(cwd, ['merge-base', '--is-ancestor', hash, head]).then(() => true).catch(() => false);
  }
  log(cwd: string, limit: number): Promise<string> {
    const format = '%x1e%H%x1f%h%x1f%an%x1f%ae%x1f%aI%x1f%cn%x1f%ce%x1f%cI%x1f%s%x1f%b%x1f%P%x1f%D';
    return this.run(cwd, ['log', 'HEAD', '--branches', `--max-count=${limit}`, `--format=${format}`, '--numstat', '--find-renames']);
  }
  sessionSummary(cwd: string, base: string, head: string): Promise<string> {
    return this.run(cwd, ['log', `${base}..${head}`, '--format=%H', '--numstat', '--no-renames']);
  }
}
