<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useGitStore } from '../stores/git';

const props = defineProps<{ projectId: string }>();
const store = useGitStore();
const search = ref('');
const openFileError = ref<string | null>(null);
const openingFile = ref<string | null>(null);
const selectedBranch = ref('');

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
  if (confirmed) await store.switchBranch(props.projectId, selectedBranch.value);
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
          <option v-for="branch in store.branches" :key="branch" :value="branch">{{ branch }}</option>
        </select>
        <button
          class="button secondary"
          :disabled="store.switchingBranch || !selectedBranch || selectedBranch === store.project?.gitCurrentBranch || store.project?.gitSyncStatus === 'SYNCING'"
          @click="switchBranch"
        >
          {{ store.switchingBranch ? 'Switching…' : 'Switch Branch' }}
        </button>
        <button
          class="button primary"
          :disabled="store.project?.gitSyncStatus === 'SYNCING' || store.switchingBranch"
          @click="store.sync(projectId)"
        >
          {{ store.project?.gitSyncStatus === 'SYNCING' ? 'Syncing…' : 'Sync Git History' }}
        </button>
      </div>
    </div>

    <div v-if="store.error || store.project?.gitSyncError" class="alert error-alert">
      {{ store.error || store.project?.gitSyncError }}
    </div>
    <div v-if="store.success" class="alert success-alert">{{ store.success }}</div>

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
