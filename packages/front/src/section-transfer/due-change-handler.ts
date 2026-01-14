import {
  type DisplayTask,
  updateDisplayTask,
} from "../display/display-task.js";
import {
  type SectionTransfer,
  createSectionTransfer,
} from "./section-transfer.js";

export interface DueChangeResult {
  readonly updatedTask: DisplayTask;
  readonly transfer: SectionTransfer;
  readonly newManualSortPosition: number;
}

/**
 * Handle adding a due date to a task.
 * Task moves from "withoutDue" section to "withDue" section.
 * Inserted at the HEAD of the target section.
 */
export function addDue(
  task: DisplayTask,
  dueAt: Date,
  withDueTasks: readonly DisplayTask[]
): DueChangeResult {
  if (task.dueAt !== null) {
    throw new Error("Task already has a due date");
  }

  // Calculate new position at the head of withDue section
  const minPosition = getMinPosition(withDueTasks);
  const newPosition = minPosition - 1000;

  const updatedTask = updateDisplayTask(task, {
    dueAt: new Date(dueAt.getTime()),
    manualSortPosition: newPosition,
  });

  const transfer = createSectionTransfer(
    task,
    "withoutDue",
    "withDue",
    "head"
  );

  return {
    updatedTask,
    transfer,
    newManualSortPosition: newPosition,
  };
}

/**
 * Handle removing a due date from a task.
 * Task moves from "withDue" section to "withoutDue" section.
 * Inserted at the TAIL of the target section.
 */
export function removeDue(
  task: DisplayTask,
  withoutDueTasks: readonly DisplayTask[]
): DueChangeResult {
  if (task.dueAt === null) {
    throw new Error("Task does not have a due date");
  }

  // Calculate new position at the tail of withoutDue section
  const maxPosition = getMaxPosition(withoutDueTasks);
  const newPosition = maxPosition + 1000;

  const updatedTask = updateDisplayTask(task, {
    dueAt: null,
    manualSortPosition: newPosition,
  });

  const transfer = createSectionTransfer(
    task,
    "withDue",
    "withoutDue",
    "tail"
  );

  return {
    updatedTask,
    transfer,
    newManualSortPosition: newPosition,
  };
}

/**
 * Handle changing the due date of a task (without section change).
 */
export function changeDue(task: DisplayTask, newDueAt: Date): DisplayTask {
  if (task.dueAt === null) {
    throw new Error("Task does not have a due date. Use addDue instead.");
  }

  return updateDisplayTask(task, {
    dueAt: new Date(newDueAt.getTime()),
  });
}

function getMinPosition(tasks: readonly DisplayTask[]): number {
  if (tasks.length === 0) {
    return 0;
  }
  return Math.min(...tasks.map((t) => t.manualSortPosition));
}

function getMaxPosition(tasks: readonly DisplayTask[]): number {
  if (tasks.length === 0) {
    return 0;
  }
  return Math.max(...tasks.map((t) => t.manualSortPosition));
}
