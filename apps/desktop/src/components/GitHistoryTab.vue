<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useGitStore } from '../stores/git';
import { apiClient } from '../services/api-client';

const props = defineProps<{ projectId: string }>();
const store = useGitStore();
const search = ref('');
const openFileError = ref<string | null>(null);
const openingFile = ref<string | null>(null);
const selectedBranch = ref('');
const availableBranches = computed(() => store.branches ?? []);
const refreshingBranches = ref(false);
const switchingBranch = ref(false);
const branchActionError = ref<string | null>(null);
const branchMessage = ref<string | null>(null);

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function closeDetails(): void {
  store.selected = null;
  store.files = [];
}

async function openInVsCode(relativePath: string): Promise<void> {
  openingFile.value = relativePath;
  openFileError.value = null;
  const result = await window.desktop.openProjectFile(props.projectId, relativePath);
  if (!result.opened) openFileError.value = result.error ?? 'The file could not be opened.';
  openingFile.value = null;
}

async function switchBranch(): Promise<void> {
  if (!selectedBranch.value || selectedBranch.value === store.project?.gitCurrentBranch) return;
  const confirmed = window.confirm(
    `Switch this project to “${selectedBranch.value}”?\n\nThis changes the files in the working directory. The operation will be blocked if there are uncommitted changes.`,
  );
  if (!confirmed) return;

  switchingBranch.value = true;
  branchActionError.value = null;
  branchMessage.value = null;
  try {
    const result = await apiClient.switchGitBranch(props.projectId, selectedBranch.value);
    branchMessage.value = `Switched to ${result.branch}. Sync Git History and re-index Files to refresh stored data.`;
    await store.load(props.projectId);
  } catch (caught) {
    branchActionError.value = caught instanceof Error ? caught.message : 'The branch could not be switched.';
  } finally {
    switchingBranch.value = false;
  }
}

async function refreshBranches(): Promise<void> {
  const confirmed = window.confirm(
    'Fetch the latest branch list from configured Git remotes? This updates remote references but does not change your working files.',
  );
  if (!confirmed) return;

  refreshingBranches.value = true;
  branchActionError.value = null;
  branchMessage.value = null;
  try {
    const result = await apiClient.refreshGitBranches(props.projectId);
    store.$patch({ branches: result.branches });
    branchMessage.value = `Loaded ${result.branches.length} branches from the configured remotes.`;
  } catch (caught) {
    branchActionError.value = caught instanceof Error ? caught.message : 'Remote branches could not be refreshed.';
  } finally {
    refreshingBranches.value = false;
  }
}

watch(() => store.project?.gitCurrentBranch, (branch) => {
  selectedBranch.value = branch ?? '';
}, { immediate: true });

onMounted(() => store.load(props.projectId));
onBeforeUnmount(() => store.stop());
</script>

<template>
  <section class="phase-panel">
    <div class="tab-heading">
      <div>
        <p class="eyebrow">Repository</p>
        <h2>Git History</h2>
      </div>
      <div class="git-actions">
        <select v-model="selectedBranch" class="branch-select" aria-label="Local Git branch">
          <option v-if="store.project && !store.project.hasGit" value="">Git not detected</option>
          <option
            v-if="store.project?.hasGit && store.project.gitCurrentBranch && !availableBranches.includes(store.project.gitCurrentBranch)"
            :value="store.project.gitCurrentBranch"
          >
            {{ store.project.gitCurrentBranch }}
          </option>
          <option v-if="store.project?.hasGit && store.loadingBranches && !store.project?.gitCurrentBranch" value="">Loading branches…</option>
          <option v-else-if="store.project?.hasGit && availableBranches.length === 0 && !store.project?.gitCurrentBranch" value="">No branches found</option>
          <option v-for="branch in availableBranches" :key="branch" :value="branch">{{ branch }}</option>
        </select>
        <span v-if="store.loadingBranches" class="branch-loading">Loading branches…</span>
        <button
          class="button secondary"
          :disabled="!store.project?.hasGit || refreshingBranches || switchingBranch || store.project?.gitSyncStatus === 'SYNCING'"
          title="Fetch all branch references from configured remotes"
          @click="refreshBranches()"
        >
          {{ refreshingBranches ? 'Refreshing…' : 'Refresh Branches' }}
        </button>
        <button
          class="button secondary"
          :disabled="!store.project?.hasGit || switchingBranch || !selectedBranch || selectedBranch === store.project?.gitCurrentBranch || store.project?.gitSyncStatus === 'SYNCING'"
          @click="switchBranch"
        >
          {{ switchingBranch ? 'Switching…' : 'Switch Branch' }}
        </button>
        <button
          class="button primary"
          :disabled="!store.project?.hasGit || store.project?.gitSyncStatus === 'SYNCING' || switchingBranch"
          @click="store.sync(projectId)"
        >
          {{ store.project?.gitSyncStatus === 'SYNCING' ? 'Syncing…' : 'Sync Git History' }}
        </button>
      </div>
    </div>

    <div v-if="store.project && !store.project.hasGit" class="git-unavailable">
      <strong>Git repository not detected</strong>
      <p>This registered folder does not contain a <code>.git</code> directory. Register the repository root folder to sync history or switch branches.</p>
    </div>

    <div v-if="store.error || store.project?.gitSyncError" class="alert error-alert">
      {{ store.error || store.project?.gitSyncError }}
    </div>
    <div v-if="store.success" class="alert success-alert">{{ store.success }}</div>
    <div v-if="branchMessage" class="alert success-alert">{{ branchMessage }}</div>
    <div v-if="branchActionError" class="alert error-alert">{{ branchActionError }}</div>
    <div v-if="store.branchError" class="alert warning-alert">
      <span>{{ store.branchError }}</span>
      <button @click="refreshBranches()">Retry branches</button>
    </div>

    <div v-if="store.project" class="metadata-grid">
      <div><span>Branch</span><strong>{{ store.project.gitCurrentBranch || 'Unknown' }}</strong></div>
      <div><span>HEAD</span><strong>{{ store.project.gitHeadHash?.slice(0, 8) || '—' }}</strong></div>
      <div><span>Commits</span><strong>{{ store.project.gitCommitCount }}</strong></div>
    </div>

    <div
      v-if="store.progress && (store.project?.gitSyncStatus === 'SYNCING' || store.progress.status === 'FAILED')"
      class="progress-panel"
    >
      <div class="progress-heading">
        <strong>{{ store.progress.message }}</strong>
        <span>{{ store.progress.percentage }}%</span>
      </div>
      <div class="progress-track"><div :style="{ width: `${store.progress.percentage}%` }"></div></div>
    </div>

    <div class="commit-toolbar">
      <input
        v-model="search"
        class="wide-input"
        placeholder="Search by message, author, hash, or file…"
        @keyup.enter="store.load(projectId, search)"
      />
      <button class="button secondary" @click="store.load(projectId, search)">Search</button>
    </div>

    <p v-if="!store.loading && store.commits.length === 0" class="file-empty">No commits found.</p>
    <div v-else class="memory-list commit-list">
      <button
        v-for="commit in store.commits"
        :key="commit.id"
        class="commit-card"
        @click="store.open(projectId, commit.id)"
      >
        <code>{{ commit.shortHash }}</code>
        <div>
          <strong>{{ commit.subject }}</strong>
          <small>
            {{ commit.authorName }} · {{ formatDate(commit.committedAt) }} ·
            {{ commit.filesChanged }} files · +{{ commit.insertions }} −{{ commit.deletions }}
          </small>
        </div>
        <span class="commit-open-hint">View details →</span>
      </button>
    </div>

    <div v-if="store.selected" class="commit-drawer-backdrop" @mousedown.self="closeDetails">
      <aside class="commit-drawer" role="dialog" aria-modal="true" aria-labelledby="commit-detail-title">
        <header class="commit-drawer-header">
          <div>
            <p class="eyebrow">Commit details</p>
            <code>{{ store.selected.shortHash }}</code>
          </div>
          <button class="icon-button" aria-label="Close commit details" @click="closeDetails">×</button>
        </header>

        <div class="commit-drawer-content">
          <h2 id="commit-detail-title">{{ store.selected.subject }}</h2>
          <p v-if="store.selected.body" class="commit-body">{{ store.selected.body }}</p>

          <dl class="commit-facts">
            <div><dt>Author</dt><dd>{{ store.selected.authorName }}</dd></div>
            <div><dt>Committed</dt><dd>{{ formatDate(store.selected.committedAt) }}</dd></div>
            <div><dt>Full hash</dt><dd><code>{{ store.selected.hash }}</code></dd></div>
            <div><dt>Parents</dt><dd>{{ store.selected.parentHashes.map(hash => hash.slice(0, 8)).join(', ') || 'None' }}</dd></div>
          </dl>

          <div class="changed-files-heading">
            <div>
              <h3>Changed files</h3>
              <p>{{ store.files.length }} {{ store.files.length === 1 ? 'file' : 'files' }} in this commit</p>
            </div>
            <div class="change-totals">
              <span class="additions">+{{ store.selected.insertions }}</span>
              <span class="deletions">−{{ store.selected.deletions }}</span>
            </div>
          </div>

          <div v-if="openFileError" class="alert error-alert">{{ openFileError }}</div>

          <div class="drawer-file-list">
            <button
              v-for="file in store.files"
              :key="file.id"
              class="drawer-file-row"
              :disabled="openingFile === file.relativePath"
              :title="`Open ${file.relativePath} in VS Code`"
              @click="openInVsCode(file.relativePath)"
            >
              <span class="change-badge">{{ file.changeType }}</span>
              <div class="drawer-file-path">
                <code>{{ file.relativePath }}</code>
                <small v-if="file.previousPath">Previously {{ file.previousPath }}</small>
              </div>
              <span class="file-change-count">
                <b>+{{ file.insertions ?? 0 }}</b>
                <em>−{{ file.deletions ?? 0 }}</em>
              </span>
              <span class="open-in-editor">{{ openingFile === file.relativePath ? 'Opening…' : 'Open ↗' }}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
