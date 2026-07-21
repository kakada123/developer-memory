import { ref } from 'vue';
import { defineStore } from 'pinia';
import { apiClient } from '../services/api-client';
export const useGitStore = defineStore('git', () => {
    const commits = ref([]), selected = ref(null), files = ref([]), project = ref(null), progress = ref(null), error = ref(null), loading = ref(false);
    let timer = null;
    async function load(id, search = '') { loading.value = true; error.value = null; try {
        const [data, status] = await Promise.all([apiClient.listCommits(id, search), apiClient.getGitStatus(id)]);
        commits.value = data.items;
        project.value = status.project;
        progress.value = status.progress;
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'Unable to load Git history';
    }
    finally {
        loading.value = false;
    } }
    async function sync(id) { error.value = null; try {
        await apiClient.startGitSync(id);
        const poll = async () => { const status = await apiClient.getGitStatus(id); project.value = status.project; progress.value = status.progress; if (status.project.gitSyncStatus === 'SYNCING')
            timer = setTimeout(poll, 500);
        else
            await load(id); };
        await poll();
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'Git sync failed';
    } }
    async function open(p, id) { [selected.value, files.value] = await Promise.all([apiClient.getCommit(p, id), apiClient.getCommitFiles(p, id)]); }
    function stop() { if (timer)
        clearTimeout(timer); timer = null; }
    return { commits, selected, files, project, progress, error, loading, load, sync, open, stop };
});
