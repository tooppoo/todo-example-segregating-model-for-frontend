import { ref, computed, type Ref, type ComputedRef } from "vue";
import {
  type DisplayTask,
  type ViewState,
  type TaskListView,
  type DragContext,
  type DropTarget,
  type SectionType,
  type Tag,
  type FilterState,
  Priority,
  ViewType,
  SortType,
  createDisplayTask,
  createViewState,
  buildTaskListView,
  isDragDropEnabled,
  updateViewState,
  resolveManualOrder,
  calculateNewPositions,
  addDue,
  removeDue,
  updateDisplayTask,
  isArchived,
} from "@todo-example/front";

export interface TodoStore {
  tasks: Ref<DisplayTask[]>;
  viewState: Ref<ViewState>;
  taskListView: ComputedRef<TaskListView>;
  dragDropEnabled: ComputedRef<boolean>;
  globalOrder: Ref<number[]>;

  addTask: (title: string, description?: string, dueAt?: Date | null) => DisplayTask;
  updateTask: (id: number, updates: Partial<Omit<DisplayTask, "id">>) => void;
  deleteTask: (id: number) => void;
  restoreTask: (id: number) => void;
  completeTask: (id: number) => void;
  uncompleteTask: (id: number) => void;
  isTaskCompleted: (task: DisplayTask) => boolean;
  setTaskDue: (id: number, dueAt: Date | null) => void;
  setTaskPriority: (id: number, priority: Priority) => void;
  setTaskTags: (id: number, tags: Tag[]) => void;

  setViewState: (state: Partial<Omit<ViewState, "filter">> & { filter?: Partial<FilterState> }) => void;
  setView: (view: ViewType) => void;
  setSort: (sort: SortType) => void;
  setSearchQuery: (query: string | null) => void;

  handleDragDrop: (drag: DragContext, drop: DropTarget) => void;
}

let nextId = 1;

export function useTodoStore(): TodoStore {
  const tasks = ref<DisplayTask[]>([]);
  const viewState = ref<ViewState>(createViewState());
  const globalOrder = ref<number[]>([]);

  const activeTasks = computed(() =>
    tasks.value.filter((t) => !isArchived(t))
  );

  const trashedTasks = computed(() =>
    tasks.value.filter((t) => isArchived(t))
  );

  const currentTasks = computed(() =>
    viewState.value.view === ViewType.TRASH
      ? trashedTasks.value
      : activeTasks.value
  );

  const orderedTasks = computed(() => {
    const orderMap = new Map(globalOrder.value.map((id, idx) => [id, idx]));
    return [...currentTasks.value].sort((a, b) => {
      const aOrder = orderMap.get(a.id) ?? a.manualSortPosition;
      const bOrder = orderMap.get(b.id) ?? b.manualSortPosition;
      return aOrder - bOrder;
    });
  });

  const taskListView = computed(() =>
    buildTaskListView(orderedTasks.value, viewState.value)
  );

  const dragDropEnabled = computed(() =>
    isDragDropEnabled(viewState.value)
  );

  function addTask(
    title: string,
    description = "",
    dueAt: Date | null = null
  ): DisplayTask {
    const id = nextId++;
    const now = new Date();
    const position = tasks.value.length * 1000;

    const task = createDisplayTask({
      id,
      slug: `task-${id}`,
      title,
      description,
      priority: Priority.NONE,
      tags: [],
      dueAt,
      createdAt: now,
      manualSortPosition: position,
      completedAt: null,
      archivedAt: null,
    });

    tasks.value = [...tasks.value, task];
    globalOrder.value = [...globalOrder.value, id];

    return task;
  }

  function updateTask(id: number, updates: Partial<Omit<DisplayTask, "id">>): void {
    tasks.value = tasks.value.map((t) =>
      t.id === id ? updateDisplayTask(t, updates) : t
    );
  }

  function deleteTask(id: number): void {
    tasks.value = tasks.value.map((t) =>
      t.id === id ? updateDisplayTask(t, { archivedAt: new Date() }) : t
    );
  }

  function restoreTask(id: number): void {
    tasks.value = tasks.value.map((t) =>
      t.id === id ? updateDisplayTask(t, { archivedAt: null }) : t
    );
  }

  function completeTask(id: number): void {
    const task = tasks.value.find((t) => t.id === id);
    if (task && task.completedAt === null) {
      updateTask(id, { completedAt: new Date() });
    }
  }

  function uncompleteTask(id: number): void {
    const task = tasks.value.find((t) => t.id === id);
    if (task && task.completedAt !== null) {
      updateTask(id, { completedAt: null });
    }
  }

  function isTaskCompleted(task: DisplayTask): boolean {
    return task.completedAt !== null;
  }

  function setTaskDue(id: number, dueAt: Date | null): void {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return;

    if (dueAt === null && task.dueAt !== null) {
      // Remove due date
      const withoutDueTasks = tasks.value.filter(
        (t) => t.dueAt === null && !isArchived(t)
      );
      const result = removeDue(task, withoutDueTasks);
      tasks.value = tasks.value.map((t) =>
        t.id === id ? result.updatedTask : t
      );
    } else if (dueAt !== null && task.dueAt === null) {
      // Add due date
      const withDueTasks = tasks.value.filter(
        (t) => t.dueAt !== null && !isArchived(t)
      );
      const result = addDue(task, dueAt, withDueTasks);
      tasks.value = tasks.value.map((t) =>
        t.id === id ? result.updatedTask : t
      );
    } else if (dueAt !== null) {
      // Change due date (same section)
      updateTask(id, { dueAt });
    }
  }

  function setTaskPriority(id: number, priority: Priority): void {
    updateTask(id, { priority });
  }

  function setTaskTags(id: number, tags: Tag[]): void {
    updateTask(id, { tags });
  }

  function setViewState(state: Partial<Omit<ViewState, "filter">> & { filter?: Partial<FilterState> }): void {
    viewState.value = updateViewState(viewState.value, state);
  }

  function setView(view: ViewType): void {
    setViewState({ view });
  }

  function setSort(sort: SortType): void {
    setViewState({ sort });
  }

  function setSearchQuery(query: string | null): void {
    setViewState({ filter: { query } });
  }

  function handleDragDrop(drag: DragContext, drop: DropTarget): void {
    if (!dragDropEnabled.value) return;

    const visibleTasks = [
      ...taskListView.value.withDue.tasks,
      ...taskListView.value.withoutDue.tasks,
    ];

    const result = resolveManualOrder(
      globalOrder.value,
      visibleTasks,
      drag,
      drop
    );

    globalOrder.value = [...result.newGlobalOrder];

    // Update manualSortPosition for persistence
    const positions = calculateNewPositions(result.newGlobalOrder);
    tasks.value = tasks.value.map((t) => {
      const newPosition = positions.get(t.id);
      if (newPosition !== undefined) {
        return updateDisplayTask(t, { manualSortPosition: newPosition });
      }
      return t;
    });
  }

  return {
    tasks,
    viewState,
    taskListView,
    dragDropEnabled,
    globalOrder,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    completeTask,
    uncompleteTask,
    isTaskCompleted,
    setTaskDue,
    setTaskPriority,
    setTaskTags,
    setViewState,
    setView,
    setSort,
    setSearchQuery,
    handleDragDrop,
  };
}

export type { DisplayTask, ViewState, TaskListView, DragContext, DropTarget, SectionType };
export { Priority, ViewType, SortType };
