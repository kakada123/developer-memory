<script setup lang="ts">
import { ref } from 'vue';
import type { DetectedProject } from '@developer-memory/shared-types';

const props = defineProps<{ project: DetectedProject; saving: boolean; error: string | null }>();
const emit = defineEmits<{ close: []; save: [project: DetectedProject] }>();
const name = ref(props.project.name);

function save(): void {
  const trimmedName = name.value.trim();
  if (trimmedName) emit('save', { ...props.project, name: trimmedName });
}
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="emit('close')">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div class="modal-heading">
        <div>
          <p class="eyebrow">Detected project</p>
          <h2 id="confirm-title">Confirm project details</h2>
        </div>
        <button class="icon-button" aria-label="Close" :disabled="saving" @click="emit('close')">×</button>
      </div>

      <label class="field">
        <span>Project name</span>
        <input v-model="name" maxlength="200" autofocus @keyup.enter="save" />
      </label>
      <div class="detail-path">{{ project.path }}</div>
      <dl class="details-grid">
        <div><dt>Framework</dt><dd>{{ project.framework }}</dd></div>
        <div><dt>Language</dt><dd>{{ project.language }}</dd></div>
        <div><dt>Git repository</dt><dd>{{ project.hasGit ? 'Yes' : 'No' }}</dd></div>
      </dl>
      <p v-if="error" class="alert error-alert">{{ error }}</p>

      <div class="modal-actions">
        <button class="button secondary" :disabled="saving" @click="emit('close')">Cancel</button>
        <button class="button primary" :disabled="saving || !name.trim()" @click="save">
          {{ saving ? 'Saving…' : 'Save project' }}
        </button>
      </div>
    </section>
  </div>
</template>
