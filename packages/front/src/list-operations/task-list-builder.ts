import type { DisplayTask } from "../display/display-task.js";
import {
  type TaskListView,
  createTaskListView,
} from "../display/task-list-view.js";
import type { ViewState } from "../view-state/view-state.js";
import { applyFilter } from "./task-filter.js";
import { sortTasks } from "./task-sorter.js";

export function buildTaskListView(
  tasks: readonly DisplayTask[],
  state: ViewState
): TaskListView {
  // 1. Apply filter
  const filteredTasks = applyFilter(tasks, state.filter);

  // 2. Split by due date section
  const { withDue, withoutDue } = splitByDueSection(filteredTasks);

  // 3. Sort each section
  const sortedWithDue = sortTasks(withDue, state.sort);
  const sortedWithoutDue = sortTasks(withoutDue, state.sort);

  return createTaskListView(sortedWithDue, sortedWithoutDue);
}

function splitByDueSection(tasks: readonly DisplayTask[]): {
  withDue: readonly DisplayTask[];
  withoutDue: readonly DisplayTask[];
} {
  const withDue: DisplayTask[] = [];
  const withoutDue: DisplayTask[] = [];

  for (const task of tasks) {
    if (task.dueAt !== null) {
      withDue.push(task);
    } else {
      withoutDue.push(task);
    }
  }

  return { withDue, withoutDue };
}
