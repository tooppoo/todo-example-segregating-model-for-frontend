import type { DisplayTask } from "./display-task.js";
import { type TaskSection, createTaskSection } from "./task-section.js";

export interface TaskListView {
  readonly withDue: TaskSection;
  readonly withoutDue: TaskSection;
}

export function createTaskListView(
  withDueTasks: readonly DisplayTask[],
  withoutDueTasks: readonly DisplayTask[]
): TaskListView {
  return Object.freeze({
    withDue: createTaskSection("withDue", withDueTasks),
    withoutDue: createTaskSection("withoutDue", withoutDueTasks),
  });
}

export function getAllTasks(view: TaskListView): readonly DisplayTask[] {
  return [...view.withDue.tasks, ...view.withoutDue.tasks];
}

export function getVisibleTaskIds(view: TaskListView): readonly number[] {
  return getAllTasks(view).map((task) => task.id);
}

export function getTotalTaskCount(view: TaskListView): number {
  return view.withDue.tasks.length + view.withoutDue.tasks.length;
}

export function isEmptyView(view: TaskListView): boolean {
  return getTotalTaskCount(view) === 0;
}
