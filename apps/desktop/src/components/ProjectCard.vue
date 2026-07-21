<script setup lang="ts">
import type { Project } from '@developer-memory/shared-types';

defineProps<{ project: Project; deleting: boolean }>();
defineEmits<{ delete: [id: string]; open: [id: string] }>();

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}
</script>

<template>
  <article class="project-card" role="button" tabindex="0" @click="$emit('open', project.id)" @keyup.enter="$emit('open', project.id)">
    <div class="project-card-heading">
      <div class="project-icon">{{ project.name.slice(0, 1).toUpperCase() }}</div>
      <div class="project-title">
        <h2>{{ project.name }}</h2>
        <p :title="project.path">{{ project.path }}</p>
      </div>
      <button class="delete-button" :disabled="deleting" @click.stop="$emit('delete', project.id)">
        {{ deleting ? 'Deleting…' : 'Delete' }}
      </button>
    </div>
    <div class="tags">
      <span>{{ project.framework ?? 'Unknown' }}</span>
      <span>{{ project.language ?? 'Unknown' }}</span>
      <span :class="{ active: project.hasGit }">{{ project.hasGit ? 'Git repository' : 'No Git' }}</span>
      <span :class="{ active: project.indexStatus === 'INDEXED' }">{{ project.indexStatus.replaceAll('_', ' ') }}</span>
    </div>
    <p class="created">Added {{ formatDate(project.createdAt) }}</p>
  </article>
</template>
