<script setup lang="ts">
import { inject, computed } from "vue";
import type { TodoStore } from "../stores/useTodoStore";
import TaskSection from "./TaskSection.vue";

const store = inject<TodoStore>("todoStore")!;

const taskListView = computed(() => store.taskListView.value);
const isEmpty = computed(
  () =>
    taskListView.value.withDue.tasks.length === 0 &&
    taskListView.value.withoutDue.tasks.length === 0
);
</script>

<template>
  <div class="task-list">
    <div v-if="isEmpty" class="empty-state">
      <p>No tasks found</p>
      <p class="hint">Add a new task or adjust your filters</p>
    </div>

    <template v-else>
      <TaskSection
        v-if="taskListView.withDue.tasks.length > 0"
        :section="taskListView.withDue"
        title="Due Date"
      />
      <TaskSection
        v-if="taskListView.withoutDue.tasks.length > 0"
        :section="taskListView.withoutDue"
        title="No Due Date"
      />
    </template>
  </div>
</template>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 8px;
  color: #666;
}

.empty-state .hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: #999;
}
</style>
