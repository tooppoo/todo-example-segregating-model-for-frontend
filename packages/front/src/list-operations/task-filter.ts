import type { DisplayTask } from "../display/display-task.js";
import type { FilterState } from "../view-state/filter-state.js";
import { matchesDueFilter } from "../view-state/due-filter.js";
import { StatusFilter } from "../view-state/status-filter.js";

export function applyFilter(
  tasks: readonly DisplayTask[],
  filter: FilterState
): readonly DisplayTask[] {
  return tasks.filter((task) => matchesFilter(task, filter));
}

export function matchesFilter(task: DisplayTask, filter: FilterState): boolean {
  if (!matchesQuery(task, filter.query)) {
    return false;
  }

  if (!matchesTags(task, filter.tags)) {
    return false;
  }

  if (!matchesPriority(task, filter.priority)) {
    return false;
  }

  if (!matchesStatus(task, filter.status)) {
    return false;
  }

  if (!matchesDue(task, filter.due)) {
    return false;
  }

  return true;
}

function matchesQuery(task: DisplayTask, query: string | null): boolean {
  if (query === null || query.trim() === "") {
    return true;
  }

  const lowerQuery = query.toLowerCase();
  return (
    task.title.toLowerCase().includes(lowerQuery) ||
    task.description.toLowerCase().includes(lowerQuery)
  );
}

function matchesTags(
  task: DisplayTask,
  tagSlugs: readonly string[]
): boolean {
  if (tagSlugs.length === 0) {
    return true;
  }

  const taskTagSlugs = new Set(task.tags.map((t) => t.slug));
  return tagSlugs.every((slug) => taskTagSlugs.has(slug));
}

function matchesPriority(
  task: DisplayTask,
  priority: FilterState["priority"]
): boolean {
  if (priority === null) {
    return true;
  }

  return task.priority === priority;
}

function matchesStatus(
  task: DisplayTask,
  status: FilterState["status"]
): boolean {
  if (status === null) {
    return true;
  }

  const isTaskCompleted = task.completedAt !== null;

  switch (status) {
    case StatusFilter.ACTIVE:
      return !isTaskCompleted;
    case StatusFilter.COMPLETED:
      return isTaskCompleted;
  }
}

function matchesDue(
  task: DisplayTask,
  due: FilterState["due"]
): boolean {
  if (due === null) {
    return true;
  }

  return matchesDueFilter(due, task.dueAt);
}
