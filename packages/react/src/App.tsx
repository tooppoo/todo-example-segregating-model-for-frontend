import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { decodeFromRecord, encodeToRecord } from "@todo-example/front";
import FilterBar from "./components/FilterBar";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import ViewSelector from "./components/ViewSelector";
import { TodoStoreProvider, useTodoStore } from "./stores/useTodoStore";
import "./App.css";

function AppContent(): JSX.Element {
  const { setViewState, viewState, tasks, addTask } = useTodoStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsString = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(paramsString);
    const record: Record<string, string | undefined> = {};
    for (const [key, value] of params.entries()) {
      record[key] = value;
    }
    const nextViewState = decodeFromRecord(record);
    setViewState(nextViewState);
  }, [paramsString, setViewState]);

  useEffect(() => {
    const query = encodeToRecord(viewState);
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        filtered[key] = value;
      }
    }
    const nextParams = new URLSearchParams(filtered);
    const nextString = nextParams.toString();
    if (nextString !== paramsString) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [viewState, paramsString, setSearchParams]);

  useEffect(() => {
    if (tasks.length > 0) {
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    addTask("Buy groceries", "Milk, bread, eggs", tomorrow);
    addTask("Finish report", "Q4 sales report", nextWeek);
    addTask("Call mom", "Birthday wishes");
    addTask("Clean room", "Weekly cleaning");
    addTask("Read book", "Chapter 5-7");
  }, [tasks.length, addTask]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>TODO App</h1>
        <ViewSelector />
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <FilterBar />
        </aside>

        <section className="content">
          <TaskForm />
          <TaskList />
        </section>
      </main>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <TodoStoreProvider>
      <AppContent />
    </TodoStoreProvider>
  );
}
