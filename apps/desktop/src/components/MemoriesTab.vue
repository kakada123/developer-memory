<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { MemoryEntry } from '@developer-memory/shared-types';
import { useMemoriesStore } from '../stores/memories';

const props = defineProps<{ projectId: string }>();
const store = useMemoriesStore();

const memoryTypes: MemoryEntry['type'][] = [
  'NOTE',
  'DECISION',
  'BUG',
  'TASK',
  'SOLUTION',
  'QUESTION',
  'OUTCOME',
];

const title = ref('');
const content = ref('');
const type = ref<MemoryEntry['type']>('NOTE');
const query = ref('');
const filter = ref<MemoryEntry['type'] | ''>('');

const shown = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase();

  return store.items.filter((memory) => {
    const matchesQuery = !normalizedQuery
      || `${memory.title} ${memory.content} ${memory.tags.join(' ')}`.toLowerCase().includes(normalizedQuery);
    const matchesType = !filter.value || memory.type === filter.value;
    return matchesQuery && matchesType;
  });
});

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function lineReference(memory: MemoryEntry): string {
  if (!memory.lineStart) return '';
  return memory.lineEnd && memory.lineEnd !== memory.lineStart
    ? `:${memory.lineStart}-${memory.lineEnd}`
    : `:${memory.lineStart}`;
}

async function create(): Promise<void> {
  if (!title.value.trim() || !content.value.trim()) return;

  const saved = await store.create(props.projectId, {
    title: title.value,
    content: content.value,
    type: type.value,
  });

  if (saved) {
    title.value = '';
    content.value = '';
  }
}

onMounted(() => store.load(props.projectId));
</script>

<template>
  <section class="phase-panel memories-panel">
    <div class="tab-heading memories-heading">
      <div>
        <p class="eyebrow">Project knowledge</p>
        <h2>Memories</h2>
      </div>
      <span class="memory-count">{{ store.items.length }} saved</span>
    </div>

    <div v-if="store.error" class="alert error-alert">{{ store.error }}</div>

    <form class="memory-composer" @submit.prevent="create">
      <div class="memory-composer-row">
        <label class="memory-field">
          <span>Type</span>
          <select v-model="type">
            <option v-for="item in memoryTypes" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>

        <label class="memory-field">
          <span>Title</span>
          <input v-model="title" maxlength="200" placeholder="What should you remember?" required />
        </label>
      </div>

      <label class="memory-field">
        <span>Details</span>
        <textarea
          v-model="content"
          maxlength="20000"
          placeholder="Add the context, reasoning, or outcome…"
          required
        ></textarea>
      </label>

      <div class="memory-composer-footer">
        <small>{{ content.length.toLocaleString() }} / 20,000 characters · saved locally</small>
        <button
          type="submit"
          class="button primary"
          :disabled="store.saving || !title.trim() || !content.trim()"
        >
          {{ store.saving ? 'Saving…' : 'Save Memory' }}
        </button>
      </div>
    </form>

    <div class="memory-toolbar">
      <input v-model="query" type="search" placeholder="Search memories…" aria-label="Search memories" />
      <select v-model="filter" aria-label="Filter memories by type">
        <option value="">All types</option>
        <option v-for="item in memoryTypes" :key="item" :value="item">{{ item }}</option>
      </select>
    </div>

    <div v-if="store.loading" class="memory-empty">
      <strong>Loading memories…</strong>
    </div>
    <div v-else-if="shown.length === 0" class="memory-empty">
      <strong>{{ store.items.length === 0 ? 'No memories yet' : 'No matching memories' }}</strong>
      <p>{{ store.items.length === 0 ? 'Capture your first note, decision, bug, or outcome above.' : 'Try changing the search text or type filter.' }}</p>
    </div>

    <div v-else class="memory-results">
      <article v-for="memory in shown" :key="memory.id" class="memory-entry-card">
        <div class="memory-card-heading">
          <div class="memory-badges">
            <span class="record-type">{{ memory.type }}</span>
            <span :class="['memory-status', `is-${memory.status.toLowerCase()}`]">{{ memory.status }}</span>
          </div>
          <span v-if="memory.priority" class="memory-priority">{{ memory.priority }} PRIORITY</span>
        </div>

        <h3>{{ memory.title }}</h3>
        <p class="memory-preview">{{ memory.content }}</p>

        <div v-if="memory.tags.length" class="memory-tags">
          <span v-for="tag in memory.tags" :key="tag">#{{ tag }}</span>
        </div>

        <div class="memory-card-footer">
          <div class="memory-meta">
            <span>{{ formatDate(memory.createdAt) }}</span>
            <span v-if="memory.session">Session: {{ memory.session.title }}</span>
            <code v-if="memory.relativeFilePath">{{ memory.relativeFilePath }}{{ lineReference(memory) }}</code>
            <code v-if="memory.commitHash">Commit {{ memory.commitHash.slice(0, 7) }}</code>
          </div>

          <div class="record-actions">
            <button
              v-if="memory.status === 'OPEN'"
              type="button"
              :disabled="store.actingId === memory.id"
              @click="store.action(projectId, memory.id, 'resolve')"
            >
              Resolve
            </button>
            <button
              v-if="memory.status !== 'ARCHIVED'"
              type="button"
              :disabled="store.actingId === memory.id"
              @click="store.action(projectId, memory.id, 'archive')"
            >
              Archive
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
