import type { DisplayTask } from "../display/display-task.js";

export interface ReorderResult {
  readonly movedTask: DisplayTask;
  readonly newGlobalOrder: readonly number[];
}

export function createReorderResult(
  movedTask: DisplayTask,
  newGlobalOrder: readonly number[]
): ReorderResult {
  return Object.freeze({
    movedTask,
    newGlobalOrder: Object.freeze([...newGlobalOrder]),
  });
}
