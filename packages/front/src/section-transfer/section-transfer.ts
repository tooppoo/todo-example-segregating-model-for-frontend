import type { DisplayTask } from "../display/display-task.js";
import type { SectionType } from "../display/task-section.js";

export type InsertPosition = "head" | "tail";

export interface SectionTransfer {
  readonly task: DisplayTask;
  readonly fromSection: SectionType;
  readonly toSection: SectionType;
  readonly insertPosition: InsertPosition;
}

export function createSectionTransfer(
  task: DisplayTask,
  fromSection: SectionType,
  toSection: SectionType,
  insertPosition: InsertPosition
): SectionTransfer {
  return Object.freeze({
    task,
    fromSection,
    toSection,
    insertPosition,
  });
}
