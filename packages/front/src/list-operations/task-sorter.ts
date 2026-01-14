import type { DisplayTask } from "../display/display-task.js";
import { comparePriority } from "../domain/priority.js";
import { SortType } from "../view-state/sort-type.js";

export function sortTasks(
  tasks: readonly DisplayTask[],
  sortType: SortType
): readonly DisplayTask[] {
  const sorted = [...tasks];

  switch (sortType) {
    case SortType.MANUAL:
      return sortByManualPosition(sorted);
    case SortType.CREATED_AT:
      return sortByCreatedAt(sorted);
    case SortType.DUE_AT:
      return sortByDueAt(sorted);
    case SortType.PRIORITY:
      return sortByPriority(sorted);
  }
}

function sortByManualPosition(tasks: DisplayTask[]): DisplayTask[] {
  return tasks.sort((a, b) => a.manualSortPosition - b.manualSortPosition);
}

function sortByCreatedAt(tasks: DisplayTask[]): DisplayTask[] {
  return tasks.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

function sortByDueAt(tasks: DisplayTask[]): DisplayTask[] {
  return tasks.sort((a, b) => {
    // Tasks without due date go to the end
    if (a.dueAt === null && b.dueAt === null) {
      return 0;
    }
    if (a.dueAt === null) {
      return 1;
    }
    if (b.dueAt === null) {
      return -1;
    }
    return a.dueAt.getTime() - b.dueAt.getTime();
  });
}

function sortByPriority(tasks: DisplayTask[]): DisplayTask[] {
  return tasks.sort((a, b) => comparePriority(a.priority, b.priority));
}
