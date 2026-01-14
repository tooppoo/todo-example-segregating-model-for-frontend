<script setup lang="ts">
import { inject, computed } from "vue";
import { ViewType } from "@todo-example/front";
import type { TodoStore } from "../stores/useTodoStore";

const store = inject<TodoStore>("todoStore")!;

const currentView = computed(() => store.viewState.value.view);

function setView(view: ViewType) {
  store.setView(view);
}
</script>

<template>
  <nav class="view-selector">
    <button
      class="view-btn"
      :class="{ active: currentView === ViewType.INBOX }"
      @click="setView(ViewType.INBOX)"
    >
      Inbox
    </button>
    <button
      class="view-btn"
      :class="{ active: currentView === ViewType.PROJECT }"
      @click="setView(ViewType.PROJECT)"
    >
      Project
    </button>
    <button
      class="view-btn"
      :class="{ active: currentView === ViewType.TRASH }"
      @click="setView(ViewType.TRASH)"
    >
      Trash
    </button>
  </nav>
</template>

<style scoped>
.view-selector {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.view-btn.active {
  background: white;
  color: #4a90d9;
  font-weight: 500;
}
</style>
