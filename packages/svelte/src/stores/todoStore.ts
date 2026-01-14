import { derived, get, writable } from "svelte/store";
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
  setTaskDueInList,
  updateDisplayTask,
  isArchived,
} from "@todo-example/front";

let nextId = 1;

export const tasks = writable<DisplayTask[]>([]);
export const viewState = writable<ViewState>(createViewState());
export const globalOrder = writable<number[]>([]);

const activeTasks = derived(tasks, ($tasks) =>
  $tasks.filter((task) => !isArchived(task))
);

const trashedTasks = derived(tasks, ($tasks) =>
  $tasks.filter((task) => isArchived(task))
);

const currentTasks = derived(
  [viewState, activeTasks, trashedTasks],
  ([$viewState, $activeTasks, $trashedTasks]) =>
    $viewState.view === ViewType.TRASH ? $trashedTasks : $activeTasks
);

const orderedTasks = derived(
  [currentTasks, globalOrder],
  ([$currentTasks, $globalOrder]) => {
    const orderMap = new Map($globalOrder.map((id, idx) => [id, idx]));
    return [...$currentTasks].sort((a, b) => {
      const aOrder = orderMap.get(a.id) ?? a.manualSortPosition;
      const bOrder = orderMap.get(b.id) ?? b.manualSortPosition;
      return aOrder - bOrder;
    });
  }
);

export const taskListView = derived(
  [orderedTasks, viewState],
  ([$orderedTasks, $viewState]) =>
    buildTaskListView($orderedTasks, $viewState)
);

export const dragDropEnabled = derived(viewState, ($viewState) =>
  isDragDropEnabled($viewState)
);

export function addTask(
  title: string,
  description = "",
  dueAt: Date | null = null
): DisplayTask {
  const id = nextId++;
  const now = new Date();
  const position = get(tasks).length * 1000;

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

  tasks.update((prev) => [...prev, task]);
  globalOrder.update((prev) => [...prev, id]);

  return task;
}

export function updateTask(
  id: number,
  updates: Partial<Omit<DisplayTask, "id">>
): void {
  tasks.update((prev) =>
    prev.map((task) =>
      task.id === id ? updateDisplayTask(task, updates) : task
    )
  );
}

export function deleteTask(id: number): void {
  tasks.update((prev) =>
    prev.map((task) =>
      task.id === id ? updateDisplayTask(task, { archivedAt: new Date() }) : task
    )
  );
}

export function restoreTask(id: number): void {
  tasks.update((prev) =>
    prev.map((task) =>
      task.id === id ? updateDisplayTask(task, { archivedAt: null }) : task
    )
  );
}

export function completeTask(id: number): void {
  tasks.update((prev) => {
    const task = prev.find((item) => item.id === id);
    if (!task || task.completedAt !== null) {
      return prev;
    }
    return prev.map((item) =>
      item.id === id ? updateDisplayTask(item, { completedAt: new Date() }) : item
    );
  });
}

export function uncompleteTask(id: number): void {
  tasks.update((prev) => {
    const task = prev.find((item) => item.id === id);
    if (!task || task.completedAt === null) {
      return prev;
    }
    return prev.map((item) =>
      item.id === id ? updateDisplayTask(item, { completedAt: null }) : item
    );
  });
}

export function isTaskCompleted(task: DisplayTask): boolean {
  return task.completedAt !== null;
}

export function setTaskDue(id: number, dueAt: Date | null): void {
  tasks.update((prev) => setTaskDueInList(prev, id, dueAt));
}

export function setTaskPriority(id: number, priority: Priority): void {
  updateTask(id, { priority });
}

export function setTaskTags(id: number, tags: Tag[]): void {
  updateTask(id, { tags });
}

export function setViewState(
  state: Partial<Omit<ViewState, "filter">> & { filter?: Partial<FilterState> }
): void {
  viewState.update((current) => updateViewState(current, state));
}

export function setView(view: ViewType): void {
  setViewState({ view });
}

export function setSort(sort: SortType): void {
  setViewState({ sort });
}

export function setSearchQuery(query: string | null): void {
  setViewState({ filter: { query } });
}

export function handleDragDrop(drag: DragContext, drop: DropTarget): void {
  if (!get(dragDropEnabled)) {
    return;
  }

  const currentView = get(taskListView);
  const visibleTasks = [
    ...currentView.withDue.tasks,
    ...currentView.withoutDue.tasks,
  ];

  const result = resolveManualOrder(get(globalOrder), visibleTasks, drag, drop);
  globalOrder.set([...result.newGlobalOrder]);

  const positions = calculateNewPositions(result.newGlobalOrder);
  tasks.update((prev) =>
    prev.map((item) => {
      const newPosition = positions.get(item.id);
      if (newPosition !== undefined) {
        return updateDisplayTask(item, { manualSortPosition: newPosition });
      }
      return item;
    })
  );
}

export type { DisplayTask, ViewState, TaskListView, DragContext, DropTarget, SectionType };
export { Priority, ViewType, SortType };
