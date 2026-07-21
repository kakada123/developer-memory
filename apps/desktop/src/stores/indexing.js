import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { apiClient } from '../services/api-client';
function errorMessage(error) {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
}
export const useIndexingStore = defineStore('indexing', () => {
    const project = ref(null);
    const progress = ref(null);
    const result = ref(null);
    const files = ref([]);
    const selectedFile = ref(null);
    const search = ref('');
    const language = ref('');
    const loading = ref(false);
    const error = ref(null);
    let pollTimer = null;
    const isIndexing = computed(() => project.value?.indexStatus === 'INDEXING');
    const languages = computed(() => [...new Set(files.value.map((file) => file.language).filter((value) => Boolean(value)))].sort());
    const filteredFiles = computed(() => {
        const query = search.value.trim().toLowerCase();
        return files.value.filter((file) => (!query || file.relativePath.toLowerCase().includes(query)) && (!language.value || file.language === language.value));
    });
    async function load(projectId) {
        loading.value = true;
        error.value = null;
        try {
            const [loadedProject, loadedFiles] = await Promise.all([apiClient.getProject(projectId), apiClient.listIndexedFiles(projectId)]);
            project.value = loadedProject;
            files.value = loadedFiles;
            if (loadedProject.indexStatus === 'INDEXING')
                startPolling(projectId);
        }
        catch (caught) {
            error.value = errorMessage(caught);
        }
        finally {
            loading.value = false;
        }
    }
    async function start(projectId) {
        error.value = null;
        result.value = null;
        try {
            progress.value = await apiClient.startIndex(projectId);
            if (project.value)
                project.value.indexStatus = 'INDEXING';
            startPolling(projectId);
        }
        catch (caught) {
            error.value = errorMessage(caught);
        }
    }
    function startPolling(projectId) {
        stopPolling();
        const poll = async () => {
            try {
                const status = await apiClient.getIndexStatus(projectId);
                project.value = status.project;
                progress.value = status.progress;
                result.value = status.result;
                if (status.project.indexStatus === 'INDEXING') {
                    pollTimer = setTimeout(poll, 500);
                }
                else {
                    files.value = await apiClient.listIndexedFiles(projectId);
                }
            }
            catch (caught) {
                error.value = errorMessage(caught);
                stopPolling();
            }
        };
        void poll();
    }
    function stopPolling() {
        if (pollTimer)
            clearTimeout(pollTimer);
        pollTimer = null;
    }
    async function clear(projectId) {
        error.value = null;
        try {
            await apiClient.clearIndex(projectId);
            files.value = [];
            selectedFile.value = null;
            progress.value = null;
            result.value = null;
            project.value = await apiClient.getProject(projectId);
        }
        catch (caught) {
            error.value = errorMessage(caught);
        }
    }
    async function openFile(projectId, fileId) {
        error.value = null;
        try {
            selectedFile.value = await apiClient.getIndexedFile(projectId, fileId);
        }
        catch (caught) {
            error.value = errorMessage(caught);
        }
    }
    function reset() {
        stopPolling();
        project.value = null;
        files.value = [];
        selectedFile.value = null;
        progress.value = null;
        result.value = null;
        search.value = '';
        language.value = '';
        error.value = null;
    }
    return { project, progress, result, files, selectedFile, search, language, loading, error, isIndexing, languages, filteredFiles, load, start, clear, openFile, stopPolling, reset };
});
