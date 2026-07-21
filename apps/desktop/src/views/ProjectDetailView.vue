<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useIndexingStore } from '../stores/indexing';
import GitHistoryTab from '../components/GitHistoryTab.vue';
import SessionsTab from '../components/SessionsTab.vue';
import MemoriesTab from '../components/MemoriesTab.vue';

const props = defineProps<{ projectId: string }>();
const store = useIndexingStore();
type ProjectTab = 'overview'|'files'|'git'|'sessions'|'memories';
const tabStorageKey = `developer-memory:project-tab:${props.projectId}`;
const storedTab = sessionStorage.getItem(tabStorageKey);
const validTabs: ProjectTab[] = ['overview', 'files', 'git', 'sessions', 'memories'];
const activeTab = ref<ProjectTab>(validTabs.includes(storedTab as ProjectTab) ? storedTab as ProjectTab : 'overview');
const openingProject = ref(false);
const openProjectError = ref<string | null>(null);

watch(activeTab, (tab) => sessionStorage.setItem(tabStorageKey, tab));

function formatDate(value: string | null): string {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Never';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function clearIndex(): Promise<void> {
  if (window.confirm('Clear all indexed files for this project? The project registration will remain.')) {
    await store.clear(props.projectId);
  }
}

async function openProjectInEditor(): Promise<void> {
  openingProject.value = true;
  openProjectError.value = null;

  try {
    const result = await window.desktop.openProjectFile(props.projectId, '.');
    if (!result.opened) {
      openProjectError.value = result.error ?? 'The project could not be opened in VS Code.';
    }
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : '';
    openProjectError.value = message.includes('No handler registered')
      ? 'The desktop process is out of date. Quit Developer Memory and restart npm run dev once.'
      : 'The project could not be opened in VS Code. Make sure VS Code is installed.';
  } finally {
    openingProject.value = false;
  }
}

onMounted(() => store.load(props.projectId));
onBeforeUnmount(() => store.reset());
</script>

<template>
  <main class="detail-page">
    <a class="back-link" href="#/">← All projects</a>
    <div v-if="store.error" class="alert error-alert">{{ store.error }}</div>
    <div v-if="openProjectError" class="alert error-alert">{{ openProjectError }}</div>
    <div v-if="store.loading" class="status-panel"><div class="spinner"></div><h2>Loading project…</h2></div>

    <template v-else-if="store.project">
      <section class="project-hero">
        <div>
          <p class="eyebrow">Project</p>
          <h2>{{ store.project.name }}</h2>
          <p class="hero-path">{{ store.project.path }}</p>
        </div>
        <div class="hero-actions">
          <button
            type="button"
            class="button secondary"
            :disabled="openingProject"
            @click="openProjectInEditor"
          >
            {{ openingProject ? 'Opening…' : 'Open in VS Code ↗' }}
          </button>
          <button
            v-if="activeTab === 'files'"
            type="button"
            class="button primary"
            :disabled="store.isIndexing"
            @click="store.start(projectId)"
          >
            {{ store.isIndexing ? 'Indexing…' : store.project.indexStatus === 'NOT_INDEXED' ? 'Index Project' : 'Re-index' }}
          </button>
          <button v-if="activeTab === 'files' && store.project.indexStatus !== 'NOT_INDEXED'" type="button" class="button danger" :disabled="store.isIndexing" @click="clearIndex">Clear Index</button>
        </div>
      </section>

      <nav class="detail-tabs">
        <button v-for="tab in ['overview','files','git','sessions','memories'] as const" :key="tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab === 'git' ? 'Git History' : tab[0]?.toUpperCase() + tab.slice(1) }}</button>
      </nav>

      <div class="detail-tab-content">

      <section v-if="activeTab === 'overview'" class="metadata-grid">
        <div><span>Framework</span><strong>{{ store.project.framework ?? 'Unknown' }}</strong></div>
        <div><span>Language</span><strong>{{ store.project.language ?? 'Unknown' }}</strong></div>
        <div><span>Git</span><strong>{{ store.project.hasGit ? 'Repository' : 'Not detected' }}</strong></div>
        <div><span>Index status</span><strong :class="`status-${store.project.indexStatus.toLowerCase()}`">{{ store.project.indexStatus.replaceAll('_', ' ') }}</strong></div>
        <div><span>Last indexed</span><strong>{{ formatDate(store.project.lastIndexedAt) }}</strong></div>
        <div><span>Indexed files</span><strong>{{ store.project.indexedFileCount }}</strong></div>
      </section>

      <section v-if="activeTab === 'files' && store.progress && (store.isIndexing || store.progress.status === 'FAILED')" class="progress-panel">
        <div class="progress-heading"><strong>{{ store.progress.message }}</strong><span>{{ store.progress.percentage }}%</span></div>
        <div class="progress-track"><div :style="{ width: `${store.progress.percentage}%` }"></div></div>
        <p v-if="store.progress.currentFile">{{ store.progress.currentFile }}</p>
        <small>{{ store.progress.processedFiles }} of {{ store.progress.totalFiles }} files processed</small>
      </section>

      <div v-if="store.project.indexError" class="alert error-alert">{{ store.project.indexError }}</div>
      <section v-if="activeTab === 'files' && store.result" class="result-summary">
        <div><strong>{{ store.result.indexedFiles }}</strong><span>Indexed files</span></div>
        <div><strong>{{ store.result.updatedFiles }}</strong><span>Updated</span></div>
        <div><strong>{{ store.result.unchangedFiles }}</strong><span>Unchanged</span></div>
        <div><strong>{{ store.result.deletedFiles }}</strong><span>Deleted</span></div>
        <div><strong>{{ store.result.skippedFiles }}</strong><span>Skipped</span></div>
        <div><strong>{{ store.result.durationMs }} ms</strong><span>Duration</span></div>
      </section>

      <section v-if="activeTab === 'files'" class="file-browser">
        <div class="file-browser-header">
          <div><p class="eyebrow">Index</p><h2>Source files</h2></div>
          <div class="file-filters">
            <input v-model="store.search" type="search" placeholder="Search paths…" />
            <select v-model="store.language">
              <option value="">All languages</option>
              <option v-for="item in store.languages" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
        </div>

        <div v-if="store.files.length === 0" class="file-empty">No indexed files yet.</div>
        <div v-else class="file-layout">
          <div class="file-list">
            <button
              v-for="file in store.filteredFiles"
              :key="file.id"
              :class="{ selected: store.selectedFile?.id === file.id }"
              @click="store.openFile(projectId, file.id)"
            >
              <span class="file-path">{{ file.relativePath }}</span>
              <span class="file-stats">{{ file.language ?? 'Text' }} · {{ formatSize(file.sizeBytes) }} · {{ file.lineCount }} lines · {{ formatDate(file.indexedAt) }}</span>
            </button>
            <p v-if="store.filteredFiles.length === 0" class="no-results">No files match these filters.</p>
          </div>
          <div class="file-preview">
            <template v-if="store.selectedFile">
              <div class="preview-title"><strong>{{ store.selectedFile.relativePath }}</strong><button class="icon-button" aria-label="Close preview" @click="store.selectedFile = null">×</button></div>
              <pre v-if="store.selectedFile.content !== null"><code>{{ store.selectedFile.content }}</code></pre>
              <div v-else class="preview-unavailable">Content was not stored because the file was binary or exceeded an indexing limit.</div>
            </template>
            <div v-else class="preview-unavailable">Select a file to view its stored content.</div>
          </div>
        </div>
      </section>
      <GitHistoryTab v-if="activeTab === 'git'" :project-id="projectId" />
      <SessionsTab v-if="activeTab === 'sessions'" :project-id="projectId" />
      <MemoriesTab v-if="activeTab === 'memories'" :project-id="projectId" />
      </div>
    </template>
  </main>
</template>
