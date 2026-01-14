<script setup lang="ts">
import { inject, ref, computed, watch } from "vue";
import {
  Priority,
  SortType,
  StatusFilter,
  createDueFilter,
} from "@todo-example/front";
import type { TodoStore } from "../stores/useTodoStore";

const store = inject<TodoStore>("todoStore")!;

const searchQuery = ref(store.viewState.value.filter.query ?? "");
const selectedPriority = ref<Priority | "">(
  store.viewState.value.filter.priority ?? ""
);
const selectedStatus = ref<StatusFilter | "">(
  store.viewState.value.filter.status ?? ""
);
const selectedSort = ref<SortType>(store.viewState.value.sort);
const dueDate = ref<string>("");
const dueType = ref<"exact" | "until">("exact");

watch(
  () => store.viewState.value,
  (state) => {
    searchQuery.value = state.filter.query ?? "";
    selectedPriority.value = state.filter.priority ?? "";
    selectedStatus.value = state.filter.status ?? "";
    selectedSort.value = state.sort;
    if (state.filter.due) {
      dueDate.value = state.filter.due.date.toISOString().split("T")[0] ?? "";
      dueType.value = state.filter.due.type;
    } else {
      dueDate.value = "";
    }
  }
);

function handleSearchChange() {
  store.setViewState({
    filter: { query: searchQuery.value || null },
  });
}

function handlePriorityChange() {
  store.setViewState({
    filter: { priority: selectedPriority.value || null },
  });
}

function handleStatusChange() {
  store.setViewState({
    filter: { status: selectedStatus.value || null },
  });
}

function handleSortChange() {
  store.setSort(selectedSort.value);
}

function handleDueChange() {
  if (dueDate.value) {
    const due = createDueFilter(dueType.value, new Date(dueDate.value));
    store.setViewState({
      filter: { due },
    });
  } else {
    store.setViewState({
      filter: { due: null },
    });
  }
}

function clearFilters() {
  searchQuery.value = "";
  selectedPriority.value = "";
  selectedStatus.value = "";
  dueDate.value = "";
  store.setViewState({
    filter: {
      query: null,
      priority: null,
      status: null,
      due: null,
      tags: [],
    },
  });
}

const hasActiveFilters = computed(() => {
  const filter = store.viewState.value.filter;
  return (
    filter.query !== null ||
    filter.priority !== null ||
    filter.status !== null ||
    filter.due !== null ||
    filter.tags.length > 0
  );
});
</script>

<template>
  <div class="filter-bar">
    <div class="filter-section">
      <h3>Search</h3>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search tasks..."
        class="search-input"
        @input="handleSearchChange"
      />
    </div>

    <div class="filter-section">
      <h3>Sort By</h3>
      <select v-model="selectedSort" class="select-input" @change="handleSortChange">
        <option :value="SortType.MANUAL">Manual</option>
        <option :value="SortType.CREATED_AT">Created Date</option>
        <option :value="SortType.DUE_AT">Due Date</option>
        <option :value="SortType.PRIORITY">Priority</option>
      </select>
    </div>

    <div class="filter-section">
      <h3>Priority</h3>
      <select
        v-model="selectedPriority"
        class="select-input"
        @change="handlePriorityChange"
      >
        <option value="">All</option>
        <option :value="Priority.HIGH">High</option>
        <option :value="Priority.MEDIUM">Medium</option>
        <option :value="Priority.LOW">Low</option>
        <option :value="Priority.NONE">None</option>
      </select>
    </div>

    <div class="filter-section">
      <h3>Status</h3>
      <select
        v-model="selectedStatus"
        class="select-input"
        @change="handleStatusChange"
      >
        <option value="">All</option>
        <option :value="StatusFilter.ACTIVE">Active</option>
        <option :value="StatusFilter.COMPLETED">Completed</option>
      </select>
    </div>

    <div class="filter-section">
      <h3>Due Date</h3>
      <div class="due-filter">
        <select v-model="dueType" class="select-input small" @change="handleDueChange">
          <option value="exact">Exact</option>
          <option value="until">Until</option>
        </select>
        <input
          v-model="dueDate"
          type="date"
          class="date-input"
          @change="handleDueChange"
        />
      </div>
    </div>

    <button
      v-if="hasActiveFilters"
      class="clear-filters-btn"
      @click="clearFilters"
    >
      Clear Filters
    </button>
  </div>
</template>

<style scoped>
.filter-bar {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-section h3 {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.search-input,
.select-input,
.date-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
}

.search-input:focus,
.select-input:focus,
.date-input:focus {
  outline: none;
  border-color: #4a90d9;
}

.due-filter {
  display: flex;
  gap: 0.5rem;
}

.due-filter .select-input.small {
  width: auto;
  flex-shrink: 0;
}

.due-filter .date-input {
  flex: 1;
}

.clear-filters-btn {
  width: 100%;
  padding: 0.5rem;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-filters-btn:hover {
  background: #eee;
  border-color: #ccc;
}
</style>
