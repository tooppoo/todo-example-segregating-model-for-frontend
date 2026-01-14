<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { decodeFromRecord, encodeToRecord } from "@todo-example/front";
  import FilterBar from "./components/FilterBar.svelte";
  import TaskList from "./components/TaskList.svelte";
  import TaskForm from "./components/TaskForm.svelte";
  import ViewSelector from "./components/ViewSelector.svelte";
  import { tasks, viewState, setViewState, addTask } from "./stores/todoStore";

  function syncFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const record: Record<string, string | undefined> = {};
    for (const [key, value] of params.entries()) {
      record[key] = value;
    }
    const nextViewState = decodeFromRecord(record);
    setViewState(nextViewState);
  }

  onMount(() => {
    syncFromUrl();

    const handlePopState = () => syncFromUrl();
    window.addEventListener("popstate", handlePopState);

    const unsubscribe = viewState.subscribe((state) => {
      const query = encodeToRecord(state);
      const filtered: Record<string, string> = {};
      for (const [key, value] of Object.entries(query)) {
        if (value) {
          filtered[key] = value;
        }
      }
      const nextParams = new URLSearchParams(filtered);
      const nextString = nextParams.toString();
      const currentString = window.location.search.replace(/^\?/, "");
      if (nextString !== currentString) {
        const base = window.location.pathname;
        const nextUrl = nextString ? `${base}?${nextString}` : base;
        window.history.replaceState({}, "", nextUrl);
      }
    });

    if (get(tasks).length === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      addTask("Buy groceries", "Milk, bread, eggs", tomorrow);
      addTask("Finish report", "Q4 sales report", nextWeek);
      addTask("Call mom", "Birthday wishes");
      addTask("Clean room", "Weekly cleaning");
      addTask("Read book", "Chapter 5-7");
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      unsubscribe();
    };
  });
</script>

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

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
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
