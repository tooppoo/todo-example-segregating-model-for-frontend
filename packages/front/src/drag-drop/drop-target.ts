import type { SectionType } from "../display/task-section.js";

export interface DropTarget {
  readonly targetIndex: number;
  readonly targetSection: SectionType;
}

export function createDropTarget(
  targetIndex: number,
  targetSection: SectionType
): DropTarget {
  return Object.freeze({
    targetIndex,
    targetSection,
  });
}
