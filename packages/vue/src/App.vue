<script setup lang="ts">
import { provide, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTodoStore } from "./stores/useTodoStore";
import { decodeFromRecord, encodeToRecord } from "@todo-example/front";
import FilterBar from "./components/FilterBar.vue";
import TaskList from "./components/TaskList.vue";
import TaskForm from "./components/TaskForm.vue";
import ViewSelector from "./components/ViewSelector.vue";

const store = useTodoStore();
provide("todoStore", store);

const route = useRoute();
const router = useRouter();

// Sync URL to ViewState on mount and route change
watch(
  () => route.query,
  (query) => {
    const record: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string") {
        record[key] = value;
      }
    }
    const viewState = decodeFromRecord(record);
    store.setViewState(viewState);
  },
  { immediate: true }
);

// Sync ViewState to URL
watch(
  () => store.viewState.value,
  (viewState) => {
    const query = encodeToRecord(viewState);
    const filteredQuery: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        filteredQuery[key] = value;
      }
    }
    router.replace({ query: filteredQuery });
  }
);

// Add some sample tasks for demo
if (store.tasks.value.length === 0) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  store.addTask("Buy groceries", "Milk, bread, eggs", tomorrow);
  store.addTask("Finish report", "Q4 sales report", nextWeek);
  store.addTask("Call mom", "Birthday wishes");
  store.addTask("Clean room", "Weekly cleaning");
  store.addTask("Read book", "Chapter 5-7");
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>TODO App</h1>
      <ViewSelector />
    </header>

    <main class="app-main">
      <aside class="sidebar">
        <FilterBar />
      </aside>

      <section class="content">
        <TaskForm />
        <TaskList />
      </section>
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #4a90d9;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.app-main {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem;
  gap: 1.5rem;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .app-main {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
