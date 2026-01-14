<script setup lang="ts">
import { inject, ref, computed } from "vue";
import type { DisplayTask } from "@todo-example/front";
import { Priority, ViewType } from "@todo-example/front";
import type { TodoStore } from "../stores/useTodoStore";

const COMPLETED_TAG_ID = -1;

const props = defineProps<{
  task: DisplayTask;
}>();

const store = inject<TodoStore>("todoStore")!;

const isEditing = ref(false);
const editTitle = ref("");
const editDescription = ref("");
const editDueAt = ref<string>("");

const isCompleted = computed(() => store.isTaskCompleted(props.task));
const isTrashView = computed(() => store.viewState.value.view === ViewType.TRASH);

const displayTags = computed(() =>
  props.task.tags.filter((t) => t.id !== COMPLETED_TAG_ID)
);

const priorityClass = computed(() => `priority-${props.task.priority}`);

const formattedDueAt = computed(() => {
  if (!props.task.dueAt) return null;
  return props.task.dueAt.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});

function toggleComplete() {
  if (isCompleted.value) {
    store.uncompleteTask(props.task.id);
  } else {
    store.completeTask(props.task.id);
  }
}

function startEdit() {
  editTitle.value = props.task.title;
  editDescription.value = props.task.description;
  editDueAt.value = props.task.dueAt
    ? props.task.dueAt.toISOString().split("T")[0] ?? ""
    : "";
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
}

function saveEdit() {
  store.updateTask(props.task.id, {
    title: editTitle.value,
    description: editDescription.value,
  });

  const newDueAt = editDueAt.value ? new Date(editDueAt.value) : null;
  if (
    (newDueAt === null && props.task.dueAt !== null) ||
    (newDueAt !== null && props.task.dueAt === null) ||
    (newDueAt !== null &&
      props.task.dueAt !== null &&
      newDueAt.getTime() !== props.task.dueAt.getTime())
  ) {
    store.setTaskDue(props.task.id, newDueAt);
  }

  isEditing.value = false;
}

function deleteTask() {
  store.deleteTask(props.task.id);
}

function restoreTask() {
  store.restoreTask(props.task.id);
}

function setPriority(priority: Priority) {
  store.setTaskPriority(props.task.id, priority);
}
</script>

<template>
  <div class="task-item" :class="[priorityClass, { completed: isCompleted }]">
    <template v-if="isEditing">
      <div class="edit-form">
        <input
          v-model="editTitle"
          type="text"
          class="edit-title"
          placeholder="Title"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
        />
        <textarea
          v-model="editDescription"
          class="edit-description"
          placeholder="Description"
          rows="2"
        />
        <input v-model="editDueAt" type="date" class="edit-due-date" />
        <div class="edit-actions">
          <button class="btn btn-primary" @click="saveEdit">Save</button>
          <button class="btn btn-secondary" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="task-content">
        <button
          class="checkbox"
          :class="{ checked: isCompleted }"
          @click="toggleComplete"
          :disabled="isTrashView"
        >
          <span v-if="isCompleted" class="checkmark">&#10003;</span>
        </button>

        <div class="task-details">
          <h3 class="task-title">{{ task.title }}</h3>
          <p v-if="task.description" class="task-description">
            {{ task.description }}
          </p>
          <div class="task-meta">
            <span v-if="formattedDueAt" class="due-date">
              {{ formattedDueAt }}
            </span>
            <span
              v-if="task.priority !== Priority.NONE"
              class="priority-badge"
              :class="priorityClass"
            >
              {{ task.priority }}
            </span>
            <span
              v-for="tag in displayTags"
              :key="tag.id"
              class="tag"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <div class="task-actions">
          <template v-if="isTrashView">
            <button class="action-btn restore" @click="restoreTask" title="Restore">
              &#8634;
            </button>
          </template>
          <template v-else>
            <div class="priority-dropdown">
              <button class="action-btn priority" title="Set Priority">!</button>
              <div class="dropdown-content">
                <button @click="setPriority(Priority.HIGH)">High</button>
                <button @click="setPriority(Priority.MEDIUM)">Medium</button>
                <button @click="setPriority(Priority.LOW)">Low</button>
                <button @click="setPriority(Priority.NONE)">None</button>
              </div>
            </div>
            <button class="action-btn edit" @click="startEdit" title="Edit">
              &#9998;
            </button>
            <button class="action-btn delete" @click="deleteTask" title="Delete">
              &#10005;
            </button>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.task-item {
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid transparent;
  transition: background-color 0.15s ease;
}

.task-item:hover {
  background: #f0f0f0;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #888;
}

.task-item.priority-high {
  border-left-color: #e74c3c;
}

.task-item.priority-medium {
  border-left-color: #f39c12;
}

.task-item.priority-low {
  border-left-color: #3498db;
}

.task-content {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  gap: 0.75rem;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.checkbox:hover {
  border-color: #4a90d9;
}

.checkbox.checked {
  background: #4a90d9;
  border-color: #4a90d9;
}

.checkmark {
  color: white;
  font-size: 12px;
}

.task-details {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.task-description {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.due-date {
  color: #666;
  background: #eee;
  padding: 0.125rem 0.5rem;
  border-radius: 3px;
}

.priority-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 3px;
  font-weight: 500;
  text-transform: capitalize;
}

.priority-badge.priority-high {
  background: #fde8e8;
  color: #e74c3c;
}

.priority-badge.priority-medium {
  background: #fef3e2;
  color: #f39c12;
}

.priority-badge.priority-low {
  background: #e8f4fd;
  color: #3498db;
}

.tag {
  background: #e0e0e0;
  color: #555;
  padding: 0.125rem 0.5rem;
  border-radius: 3px;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.task-item:hover .task-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #ddd;
}

.action-btn.delete:hover {
  background: #fde8e8;
  color: #e74c3c;
}

.action-btn.restore:hover {
  background: #e8fde8;
  color: #27ae60;
}

.priority-dropdown {
  position: relative;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 100px;
  overflow: hidden;
}

.priority-dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-content button {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
}

.dropdown-content button:hover {
  background: #f5f5f5;
}

.edit-form {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-title {
  font-size: 0.95rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.edit-description {
  font-size: 0.85rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.edit-due-date {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.15s ease;
}

.btn-primary {
  background: #4a90d9;
  color: white;
}

.btn-primary:hover {
  background: #3a7bc8;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}
</style>
