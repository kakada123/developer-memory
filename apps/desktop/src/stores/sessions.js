import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { apiClient } from '../services/api-client';
export const useSessionsStore = defineStore('sessions', () => { const items = ref([]), error = ref(null), active = computed(() => items.value.find(s => s.status === 'ACTIVE')); async function load(p) { items.value = await apiClient.listSessions(p); } async function create(p, title, summary) { try {
    await apiClient.createSession(p, { title, summary: summary || undefined });
    await load(p);
}
catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not create session';
} } async function action(p, id, a) { await apiClient.sessionAction(p, id, a); await load(p); } async function remove(p, id) { await apiClient.deleteSession(p, id); await load(p); } return { items, error, active, load, create, action, remove }; });
