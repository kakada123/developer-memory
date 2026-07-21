import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { MemoryEntry } from '@developer-memory/shared-types';
import { apiClient } from '../services/api-client';

export const useMemoriesStore = defineStore('memories', () => {
  const items = ref<MemoryEntry[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const actingId = ref<string | null>(null);
  const error = ref<string | null>(null);

  async function load(projectId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      items.value = await apiClient.listMemories(projectId);
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Could not load memories.';
    } finally {
      loading.value = false;
    }
  }

  async function create(
    projectId: string,
    input: Partial<MemoryEntry> & Pick<MemoryEntry, 'type' | 'title' | 'content'>,
  ): Promise<boolean> {
    saving.value = true;
    error.value = null;

    try {
      await apiClient.createMemory(projectId, input);
      await load(projectId);
      return true;
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Could not save memory.';
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function action(projectId: string, memoryId: string, actionName: 'resolve' | 'archive'): Promise<void> {
    actingId.value = memoryId;
    error.value = null;

    try {
      await apiClient.memoryAction(projectId, memoryId, actionName);
      await load(projectId);
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Could not update memory.';
    } finally {
      actingId.value = null;
    }
  }

  return { items, loading, saving, actingId, error, load, create, action };
});
