import type { DisplayTask } from "../display/display-task.js";
import type { DragContext } from "./drag-context.js";
import type { DropTarget } from "./drop-target.js";
import { type ReorderResult, createReorderResult } from "./reorder-result.js";

/**
 * Resolves the new global order after a drag-and-drop operation.
 *
 * This handles the complex case where D&D happens in a filtered view:
 * - The visible order V changes to V'
 * - The global order S must be updated to S' such that:
 *   1. V' elements maintain their relative order in S'
 *   2. Hidden elements maintain their relative order from S
 *   3. When the relationship between visible and hidden elements is ambiguous,
 *      preserve the original order
 */
export function resolveManualOrder(
  globalOrder: readonly number[],
  visibleTasks: readonly DisplayTask[],
  drag: DragContext,
  drop: DropTarget
): ReorderResult {
  const visibleIds = visibleTasks.map((t) => t.id);
  const visibleSet = new Set(visibleIds);

  // Create new visible order after the move
  const newVisibleOrder = computeNewVisibleOrder(visibleIds, drag, drop);

  // Merge back into global order
  const newGlobalOrder = mergeIntoGlobalOrder(
    globalOrder,
    visibleSet,
    newVisibleOrder
  );

  return createReorderResult(drag.task, newGlobalOrder);
}

function computeNewVisibleOrder(
  visibleIds: readonly number[],
  drag: DragContext,
  drop: DropTarget
): number[] {
  const result = [...visibleIds];
  const draggedId = drag.task.id;

  // Find current index in visible list
  const currentIndex = result.indexOf(draggedId);
  if (currentIndex === -1) {
    return result;
  }

  // Remove from current position
  result.splice(currentIndex, 1);

  // Calculate target index considering section boundaries
  // For simplicity, we treat the entire visible list as one sequence
  // The actual target index comes from the drop target
  let targetIndex = drop.targetIndex;

  // If dropping in a different section, adjust the index
  if (drag.sourceSection !== drop.targetSection) {
    // This is a simplified approach - in practice, you'd need
    // to calculate the actual flat index based on section sizes
    targetIndex = Math.min(targetIndex, result.length);
  } else {
    // Adjust for the removal if moving down within same section
    if (currentIndex < targetIndex) {
      targetIndex = Math.max(0, targetIndex - 1);
    }
  }

  // Insert at new position
  result.splice(targetIndex, 0, draggedId);

  return result;
}

/**
 * Merges the new visible order back into the global order while
 * preserving the relative order of hidden elements.
 *
 * Algorithm:
 * 1. Iterate through the global order
 * 2. For visible elements, insert them in their new order
 * 3. For hidden elements, keep them in their original relative position
 */
function mergeIntoGlobalOrder(
  globalOrder: readonly number[],
  visibleSet: Set<number>,
  newVisibleOrder: readonly number[]
): number[] {
  const result: number[] = [];
  let visibleIndex = 0;

  for (const id of globalOrder) {
    if (visibleSet.has(id)) {
      // Insert the next visible element in new order
      const nextVisibleId = newVisibleOrder[visibleIndex];
      if (nextVisibleId !== undefined) {
        result.push(nextVisibleId);
        visibleIndex++;
      }
    } else {
      // Keep hidden element in place
      result.push(id);
    }
  }

  return result;
}

/**
 * Calculates new manual sort positions based on the new order.
 * Positions are assigned as integers with gaps to allow future insertions.
 */
export function calculateNewPositions(
  newOrder: readonly number[]
): Map<number, number> {
  const positions = new Map<number, number>();
  const gap = 1000; // Gap between positions for future insertions

  newOrder.forEach((id, index) => {
    positions.set(id, index * gap);
  });

  return positions;
}
