import { type DisplayTask, isArchived, updateDisplayTask } from "../display/index.js";
import { addDue, removeDue } from "./due-change-handler.js";

export function setTaskDueInList(
  tasks: DisplayTask[],
  id: number,
  dueAt: Date | null
): DisplayTask[] {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return tasks;
  }

  if (dueAt === null && task.dueAt !== null) {
    const withoutDueTasks = tasks.filter(
      (item) => item.dueAt === null && !isArchived(item)
    );
    const result = removeDue(task, withoutDueTasks);
    return tasks.map((item) => (item.id === id ? result.updatedTask : item));
  }

  if (dueAt !== null && task.dueAt === null) {
    const withDueTasks = tasks.filter(
      (item) => item.dueAt !== null && !isArchived(item)
    );
    const result = addDue(task, dueAt, withDueTasks);
    return tasks.map((item) => (item.id === id ? result.updatedTask : item));
  }

  if (dueAt !== null) {
    return tasks.map((item) =>
      item.id === id ? updateDisplayTask(item, { dueAt }) : item
    );
  }

  return tasks;
}
