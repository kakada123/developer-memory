import { ref } from 'vue';
import { defineStore } from 'pinia';
import { apiClient } from '../services/api-client';
export const useMemoriesStore = defineStore('memories', () => { const items = ref([]), error = ref(null); async function load(p) { items.value = await apiClient.listMemories(p); } async function create(p, input) { try {
    await apiClient.createMemory(p, input);
    await load(p);
}
catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not save memory';
} } async function action(p, id, a) { await apiClient.memoryAction(p, id, a); await load(p); } return { items, error, load, create, action }; });
