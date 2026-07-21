<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import HomeView from './views/HomeView.vue';
import ProjectDetailView from './views/ProjectDetailView.vue';

const locationHash = ref(window.location.hash);
const projectId = computed(() => locationHash.value.match(/^#\/projects\/([0-9a-f-]+)$/i)?.[1] ?? null);

function syncLocation(): void {
  locationHash.value = window.location.hash;
}

function openProject(id: string): void {
  window.location.hash = `/projects/${id}`;
}

onMounted(() => window.addEventListener('hashchange', syncLocation));
onBeforeUnmount(() => window.removeEventListener('hashchange', syncLocation));
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <a class="brand-link" href="#/">
        <div class="brand-mark">DM</div>
        <div><h1>Developer Memory</h1><p>Your local project knowledge, in one place.</p></div>
      </a>
    </header>
    <ProjectDetailView v-if="projectId" :project-id="projectId" />
    <HomeView v-else @open-project="openProject" />
  </div>
</template>
