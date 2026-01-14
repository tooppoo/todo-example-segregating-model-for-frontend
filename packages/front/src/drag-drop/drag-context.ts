import type { DisplayTask } from "../display/display-task.js";
import type { SectionType } from "../display/task-section.js";

export interface DragContext {
  readonly sourceIndex: number;
  readonly sourceSection: SectionType;
  readonly task: DisplayTask;
}

export function createDragContext(
  sourceIndex: number,
  sourceSection: SectionType,
  task: DisplayTask
): DragContext {
  return Object.freeze({
    sourceIndex,
    sourceSection,
    task,
  });
}
