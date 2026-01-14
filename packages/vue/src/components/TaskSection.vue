<script setup lang="ts">
import { inject, computed, ref } from "vue";
import type { TaskSection as TaskSectionType } from "@todo-example/front";
import type { TodoStore } from "../stores/useTodoStore";
import { createDragContext, createDropTarget } from "@todo-example/front";
import TaskItem from "./TaskItem.vue";

const props = defineProps<{
  section: TaskSectionType;
  title: string;
}>();

const store = inject<TodoStore>("todoStore")!;
const dragDropEnabled = computed(() => store.dragDropEnabled.value);

const draggedIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);

function handleDragStart(index: number, event: DragEvent) {
  if (!dragDropEnabled.value) return;
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }
}

function handleDragOver(index: number, event: DragEvent) {
  if (!dragDropEnabled.value || draggedIndex.value === null) return;
  event.preventDefault();
  dropTargetIndex.value = index;
}

function handleDragLeave() {
  dropTargetIndex.value = null;
}

function handleDrop(index: number, event: DragEvent) {
  if (!dragDropEnabled.value || draggedIndex.value === null) return;
  event.preventDefault();

  const sourceIndex = draggedIndex.value;
  const task = props.section.tasks[sourceIndex];
  if (!task) return;

  const drag = createDragContext(
    sourceIndex,
    props.section.type,
    task
  );

  const drop = createDropTarget(index, props.section.type);

  store.handleDragDrop(drag, drop);

  draggedIndex.value = null;
  dropTargetIndex.value = null;
}

function handleDragEnd() {
  draggedIndex.value = null;
  dropTargetIndex.value = null;
}
</script>

<template>
  <div class="task-section">
    <h2 class="section-title">{{ title }}</h2>
    <ul class="task-items">
      <li
        v-for="(task, index) in section.tasks"
        :key="task.id"
        class="task-item-wrapper"
        :class="{
          dragging: draggedIndex === index,
          'drop-target': dropTargetIndex === index,
          'drag-enabled': dragDropEnabled,
        }"
        :draggable="dragDropEnabled"
        @dragstart="handleDragStart(index, $event)"
        @dragover="handleDragOver(index, $event)"
        @dragleave="handleDragLeave"
        @drop="handleDrop(index, $event)"
        @dragend="handleDragEnd"
      >
        <TaskItem :task="task" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.task-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.task-items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item-wrapper {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.task-item-wrapper.drag-enabled {
  cursor: grab;
}

.task-item-wrapper.drag-enabled:active {
  cursor: grabbing;
}

.task-item-wrapper.dragging {
  opacity: 0.5;
  transform: scale(1.02);
}

.task-item-wrapper.drop-target {
  transform: translateY(4px);
}

.task-item-wrapper.drop-target::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: #4a90d9;
  border-radius: 1px;
}
</style>
