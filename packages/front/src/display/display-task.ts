import type { Priority } from "../domain/priority.js";
import type { Tag } from "../domain/tag.js";

export interface DisplayTask {
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly priority: Priority;
  readonly tags: readonly Tag[];
  readonly dueAt: Date | null;
  readonly createdAt: Date;
  readonly manualSortPosition: number;
  readonly completedAt: Date | null;
  readonly archivedAt: Date | null;
}

export function createDisplayTask(
  params: Omit<DisplayTask, "tags"> & { tags?: readonly Tag[] }
): DisplayTask {
  return Object.freeze({
    id: params.id,
    slug: params.slug,
    title: params.title,
    description: params.description,
    priority: params.priority,
    tags: Object.freeze(params.tags ?? []),
    dueAt: params.dueAt ? new Date(params.dueAt.getTime()) : null,
    createdAt: new Date(params.createdAt.getTime()),
    manualSortPosition: params.manualSortPosition,
    completedAt: params.completedAt ? new Date(params.completedAt.getTime()) : null,
    archivedAt: params.archivedAt ? new Date(params.archivedAt.getTime()) : null,
  });
}

export function hasDue(task: DisplayTask): boolean {
  return task.dueAt !== null;
}

export function isArchived(task: DisplayTask): boolean {
  return task.archivedAt !== null;
}

export function updateDisplayTask(
  task: DisplayTask,
  updates: Partial<Omit<DisplayTask, "id">>
): DisplayTask {
  return createDisplayTask({
    ...task,
    ...updates,
  });
}
