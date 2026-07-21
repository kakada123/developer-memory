<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { DetectedProject } from '@developer-memory/shared-types';
import AddProjectDialog from '../components/AddProjectDialog.vue';
import ProjectCard from '../components/ProjectCard.vue';
import { useProjectsStore } from '../stores/projects';

const store = useProjectsStore();
const emit = defineEmits<{ openProject: [id: string] }>();
const detectedProject = ref<DetectedProject | null>(null);
const actionError = ref<string | null>(null);
const success = ref<string | null>(null);
const selecting = ref(false);
const saving = ref(false);
const deletingId = ref<string | null>(null);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

async function addProject(): Promise<void> {
  selecting.value = true;
  actionError.value = null;
  success.value = null;
  try {
    const selection = await window.desktop.selectProjectDirectory();
    if (!selection.canceled && selection.path) detectedProject.value = await window.desktop.detectProject(selection.path);
  } catch (error) {
    actionError.value = errorMessage(error);
  } finally {
    selecting.value = false;
  }
}

async function saveProject(project: DetectedProject): Promise<void> {
  saving.value = true;
  actionError.value = null;
  try {
    await store.create(project);
    detectedProject.value = null;
    success.value = `${project.name} was added successfully.`;
  } catch (error) {
    actionError.value = errorMessage(error);
  } finally {
    saving.value = false;
  }
}

async function deleteProject(id: string): Promise<void> {
  deletingId.value = id;
  actionError.value = null;
  try {
    await store.remove(id);
    success.value = 'Project deleted.';
  } catch (error) {
    actionError.value = errorMessage(error);
  } finally {
    deletingId.value = null;
  }
}

onMounted(() => store.load());
</script>

<template>
  <main>
    <div class="home-actions">
      <button class="button primary" :disabled="selecting" @click="addProject">
        <span>＋</span>{{ selecting ? 'Selecting…' : 'Add Project' }}
      </button>
    </div>
    <div v-if="actionError || store.error" class="alert error-alert">
      {{ actionError ?? store.error }}
      <button v-if="store.error" @click="store.load">Try again</button>
    </div>
    <div v-if="success" class="alert success-alert">{{ success }}</div>

    <section class="section-heading">
      <div><p class="eyebrow">Workspace</p><h2>Projects</h2></div>
      <span v-if="store.hasProjects" class="project-count">{{ store.projects.length }} {{ store.projects.length === 1 ? 'project' : 'projects' }}</span>
    </section>

    <div v-if="store.loading" class="status-panel"><div class="spinner"></div><h2>Loading projects…</h2></div>
    <section v-else-if="!store.hasProjects" class="empty-state">
      <div class="empty-icon">⌘</div><h2>Add your first project</h2>
      <p>Select a local folder to detect its framework, language, and Git status.</p>
      <button class="button primary" :disabled="selecting" @click="addProject">Add Project</button>
    </section>
    <section v-else class="project-grid">
      <ProjectCard v-for="project in store.projects" :key="project.id" :project="project" :deleting="deletingId === project.id" @delete="deleteProject" @open="emit('openProject', $event)" />
    </section>

    <AddProjectDialog v-if="detectedProject" :project="detectedProject" :saving="saving" :error="actionError" @close="detectedProject = null" @save="saveProject" />
  </main>
</template>
