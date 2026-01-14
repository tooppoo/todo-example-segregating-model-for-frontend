import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
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
  tasks: DisplayTask[];
  viewState: ViewState;
  taskListView: TaskListView;
  dragDropEnabled: boolean;
  globalOrder: number[];

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

  setViewState: (
    state: Partial<Omit<ViewState, "filter">> & { filter?: Partial<FilterState> }
  ) => void;
  setView: (view: ViewType) => void;
  setSort: (sort: SortType) => void;
  setSearchQuery: (query: string | null) => void;

  handleDragDrop: (drag: DragContext, drop: DropTarget) => void;
}

const TodoStoreContext = createContext<TodoStore | null>(null);

let nextId = 1;

function useTodoStoreInternal(): TodoStore {
  const [tasks, setTasks] = useState<DisplayTask[]>([]);
  const [viewState, setViewStateInternal] = useState<ViewState>(createViewState());
  const [globalOrder, setGlobalOrder] = useState<number[]>([]);

  const activeTasks = useMemo(
    () => tasks.filter((task) => !isArchived(task)),
    [tasks]
  );

  const trashedTasks = useMemo(
    () => tasks.filter((task) => isArchived(task)),
    [tasks]
  );

  const currentTasks = useMemo(
    () => (viewState.view === ViewType.TRASH ? trashedTasks : activeTasks),
    [viewState.view, trashedTasks, activeTasks]
  );

  const orderedTasks = useMemo(() => {
    const orderMap = new Map(globalOrder.map((id, idx) => [id, idx]));
    return [...currentTasks].sort((a, b) => {
      const aOrder = orderMap.get(a.id) ?? a.manualSortPosition;
      const bOrder = orderMap.get(b.id) ?? b.manualSortPosition;
      return aOrder - bOrder;
    });
  }, [currentTasks, globalOrder]);

  const taskListView = useMemo(
    () => buildTaskListView(orderedTasks, viewState),
    [orderedTasks, viewState]
  );

  const dragDropEnabled = useMemo(
    () => isDragDropEnabled(viewState),
    [viewState]
  );

  const addTask = useCallback(
    (title: string, description = "", dueAt: Date | null = null): DisplayTask => {
      const id = nextId++;
      const now = new Date();
      const position = tasks.length * 1000;

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

      setTasks((prev) => [...prev, task]);
      setGlobalOrder((prev) => [...prev, id]);

      return task;
    },
    [tasks.length]
  );

  const updateTask = useCallback(
    (id: number, updates: Partial<Omit<DisplayTask, "id">>): void => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? updateDisplayTask(task, updates) : task
        )
      );
    },
    []
  );

  const deleteTask = useCallback((id: number): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? updateDisplayTask(task, { archivedAt: new Date() }) : task
      )
    );
  }, []);

  const restoreTask = useCallback((id: number): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? updateDisplayTask(task, { archivedAt: null }) : task
      )
    );
  }, []);

  const completeTask = useCallback((id: number): void => {
    setTasks((prev) => {
      const task = prev.find((item) => item.id === id);
      if (!task || task.completedAt !== null) {
        return prev;
      }
      return prev.map((item) =>
        item.id === id ? updateDisplayTask(item, { completedAt: new Date() }) : item
      );
    });
  }, []);

  const uncompleteTask = useCallback((id: number): void => {
    setTasks((prev) => {
      const task = prev.find((item) => item.id === id);
      if (!task || task.completedAt === null) {
        return prev;
      }
      return prev.map((item) =>
        item.id === id ? updateDisplayTask(item, { completedAt: null }) : item
      );
    });
  }, []);

  const isTaskCompleted = useCallback((task: DisplayTask): boolean => {
    return task.completedAt !== null;
  }, []);

  const setTaskDue = useCallback((id: number, dueAt: Date | null): void => {
    setTasks((prev) => {
      const task = prev.find((item) => item.id === id);
      if (!task) {
        return prev;
      }

      if (dueAt === null && task.dueAt !== null) {
        const withoutDueTasks = prev.filter(
          (item) => item.dueAt === null && !isArchived(item)
        );
        const result = removeDue(task, withoutDueTasks);
        return prev.map((item) =>
          item.id === id ? result.updatedTask : item
        );
      }

      if (dueAt !== null && task.dueAt === null) {
        const withDueTasks = prev.filter(
          (item) => item.dueAt !== null && !isArchived(item)
        );
        const result = addDue(task, dueAt, withDueTasks);
        return prev.map((item) =>
          item.id === id ? result.updatedTask : item
        );
      }

      if (dueAt !== null) {
        return prev.map((item) =>
          item.id === id ? updateDisplayTask(item, { dueAt }) : item
        );
      }

      return prev;
    });
  }, []);

  const setTaskPriority = useCallback((id: number, priority: Priority): void => {
    updateTask(id, { priority });
  }, [updateTask]);

  const setTaskTags = useCallback((id: number, tags: Tag[]): void => {
    updateTask(id, { tags });
  }, [updateTask]);

  const setViewState = useCallback(
    (
      state: Partial<Omit<ViewState, "filter">> & {
        filter?: Partial<FilterState>;
      }
    ): void => {
      setViewStateInternal((current) => updateViewState(current, state));
    },
    []
  );

  const setView = useCallback(
    (view: ViewType): void => {
      setViewState({ view });
    },
    [setViewState]
  );

  const setSort = useCallback(
    (sort: SortType): void => {
      setViewState({ sort });
    },
    [setViewState]
  );

  const setSearchQuery = useCallback(
    (query: string | null): void => {
      setViewState({ filter: { query } });
    },
    [setViewState]
  );

  const handleDragDrop = useCallback(
    (drag: DragContext, drop: DropTarget): void => {
      if (!dragDropEnabled) {
        return;
      }

      const visibleTasks = [
        ...taskListView.withDue.tasks,
        ...taskListView.withoutDue.tasks,
      ];

      const result = resolveManualOrder(globalOrder, visibleTasks, drag, drop);
      setGlobalOrder([...result.newGlobalOrder]);

      const positions = calculateNewPositions(result.newGlobalOrder);
      setTasks((prev) =>
        prev.map((item) => {
          const newPosition = positions.get(item.id);
          if (newPosition !== undefined) {
            return updateDisplayTask(item, { manualSortPosition: newPosition });
          }
          return item;
        })
      );
    },
    [dragDropEnabled, globalOrder, taskListView]
  );

  return useMemo(
    () => ({
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
    }),
    [
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
    ]
  );
}

export function TodoStoreProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const store = useTodoStoreInternal();
  return (
    <TodoStoreContext.Provider value={store}>
      {children}
    </TodoStoreContext.Provider>
  );
}

export function useTodoStore(): TodoStore {
  const store = useContext(TodoStoreContext);
  if (!store) {
    throw new Error("TodoStoreContext is not available");
  }
  return store;
}

export type { DisplayTask, ViewState, TaskListView, DragContext, DropTarget, SectionType };
export { Priority, ViewType, SortType };
