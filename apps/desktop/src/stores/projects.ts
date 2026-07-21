import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { CreateProjectInput, Project } from '@developer-memory/shared-types';
import { apiClient } from '../services/api-client';

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasProjects = computed(() => projects.value.length > 0);

  async function load(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      projects.value = await apiClient.listProjects();
    } catch (caught) {
      error.value = messageFrom(caught);
    } finally {
      loading.value = false;
    }
  }

  async function create(input: CreateProjectInput): Promise<Project> {
    const project = await apiClient.createProject(input);
    await load();
    return project;
  }

  async function remove(id: string): Promise<void> {
    await apiClient.deleteProject(id);
    projects.value = projects.value.filter((project) => project.id !== id);
  }

  return { projects, loading, error, hasProjects, load, create, remove };
});
