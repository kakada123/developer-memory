import { ref } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';
import type { GitCommit, GitCommitFile, Project } from '@developer-memory/shared-types';
import { apiClient } from '../services/api-client';

export const useGitStore = defineStore('git', () => {
  const commits = ref<GitCommit[]>([]);
  const selected = ref<GitCommit | null>(null);
  const files = ref<GitCommitFile[]>([]);
  const project = ref<Project | null>(null);
  const progress = ref<{ status: string; percentage: number; message?: string } | null>(null);
  const branches = ref<string[]>([]);
  const branchError = ref<string | null>(null);
  const loadingBranches = ref(false);
  const refreshingBranches = ref(false);
  const error = ref<string | null>(null);
  const success = ref<string | null>(null);
  const loading = ref(false);
  const switchingBranch = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function load(id: string, search = ''): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const [data, status] = await Promise.all([
        apiClient.listCommits(id, search),
        apiClient.getGitStatus(id),
      ]);
      commits.value = data.items;
      project.value = status.project;
      progress.value = status.progress;
      if (status.project.hasGit) await loadBranches(id);
      else branches.value = [];
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Unable to load Git history';
    } finally {
      loading.value = false;
    }
  }

  async function loadBranches(id: string): Promise<void> {
    loadingBranches.value = true;
    branchError.value = null;
    try {
      const branchData = await apiClient.listGitBranches(id);
      branches.value = branchData.branches;
      if (branchData.currentBranch && !branches.value.includes(branchData.currentBranch)) {
        branches.value.unshift(branchData.currentBranch);
      }
      if (branchData.remoteDiscoveryFailed) {
        branchError.value = 'Some remote branches could not be loaded. Local and cached remote branches are still available.';
      }
    } catch (caught) {
      branches.value = project.value?.gitCurrentBranch ? [project.value.gitCurrentBranch] : [];
      branchError.value = caught instanceof Error ? caught.message : 'Local branches could not be loaded';
    } finally {
      loadingBranches.value = false;
    }
  }

  async function sync(id: string): Promise<void> {
    error.value = null;
    success.value = null;
    try {
      await apiClient.startGitSync(id);
      const poll = async (): Promise<void> => {
        const status = await apiClient.getGitStatus(id);
        project.value = status.project;
        progress.value = status.progress;
        if (status.project.gitSyncStatus === 'SYNCING') timer = setTimeout(poll, 500);
        else await load(id);
      };
      await poll();
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Git sync failed';
    }
  }

  async function switchBranch(id: string, branch: string): Promise<void> {
    switchingBranch.value = true;
    error.value = null;
    success.value = null;
    try {
      const result = await apiClient.switchGitBranch(id, branch);
      success.value = `Switched to ${result.branch}. Sync Git History and re-index Files to refresh stored data.`;
      await load(id);
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'The branch could not be switched';
    } finally {
      switchingBranch.value = false;
    }
  }

  async function refreshBranches(id: string): Promise<void> {
    refreshingBranches.value = true;
    branchError.value = null;
    success.value = null;
    try {
      const branchData = await apiClient.refreshGitBranches(id);
      branches.value = branchData.branches;
      success.value = `Loaded ${branchData.branches.length} branches from the configured remotes.`;
    } catch (caught) {
      branchError.value = caught instanceof Error ? caught.message : 'Remote branches could not be refreshed';
    } finally {
      refreshingBranches.value = false;
    }
  }

  async function open(projectId: string, commitId: string): Promise<void> {
    [selected.value, files.value] = await Promise.all([
      apiClient.getCommit(projectId, commitId),
      apiClient.getCommitFiles(projectId, commitId),
    ]);
  }

  function stop(): void {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  return {
    commits, selected, files, project, progress, branches, branchError, error, success, loading, loadingBranches, refreshingBranches, switchingBranch,
    load, loadBranches, refreshBranches, sync, switchBranch, open, stop,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useGitStore, import.meta.hot));
