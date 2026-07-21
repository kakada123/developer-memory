import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { apiClient } from '../services/api-client';
function messageFrom(error) {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
}
export const useProjectsStore = defineStore('projects', () => {
    const projects = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const hasProjects = computed(() => projects.value.length > 0);
    async function load() {
        loading.value = true;
        error.value = null;
        try {
            projects.value = await apiClient.listProjects();
        }
        catch (caught) {
            error.value = messageFrom(caught);
        }
        finally {
            loading.value = false;
        }
    }
    async function create(input) {
        const project = await apiClient.createProject(input);
        await load();
        return project;
    }
    async function remove(id) {
        await apiClient.deleteProject(id);
        projects.value = projects.value.filter((project) => project.id !== id);
    }
    return { projects, loading, error, hasProjects, load, create, remove };
});
