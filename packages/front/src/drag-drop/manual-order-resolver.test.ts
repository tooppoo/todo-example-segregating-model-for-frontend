import { describe, it, expect } from "vitest";
import {
  resolveManualOrder,
  calculateNewPositions,
} from "./manual-order-resolver.js";
import { createDragContext } from "./drag-context.js";
import { createDropTarget } from "./drop-target.js";
import { createDisplayTask } from "../display/display-task.js";
import { Priority } from "../domain/priority.js";

function createTestTask(id: number) {
  return createDisplayTask({
    id,
    slug: `task-${id}`,
    title: `Task ${id}`,
    description: "",
    priority: Priority.NONE,
    createdAt: new Date("2026-01-01"),
    manualSortPosition: id * 100,
    dueAt: null,
    archivedAt: null,
  });
}

describe("ManualOrderResolver", () => {
  describe("resolveManualOrder", () => {
    it("should reorder within same section moving down", () => {
      const tasks = [createTestTask(1), createTestTask(2), createTestTask(3)];
      const globalOrder = [1, 2, 3];

      const drag = createDragContext(0, "withDue", tasks[0]!);
      const drop = createDropTarget(2, "withDue");

      const result = resolveManualOrder(globalOrder, tasks, drag, drop);

      // Task 1 moves from index 0 to after index 1 (before removal adjustment)
      // After removal of task 1, targetIndex 2 becomes 1, so task 1 is inserted at position 1
      expect(result.newGlobalOrder).toEqual([2, 1, 3]);
      expect(result.movedTask.id).toBe(1);
    });

    it("should reorder within same section moving up", () => {
      const tasks = [createTestTask(1), createTestTask(2), createTestTask(3)];
      const globalOrder = [1, 2, 3];

      const drag = createDragContext(2, "withDue", tasks[2]!);
      const drop = createDropTarget(0, "withDue");

      const result = resolveManualOrder(globalOrder, tasks, drag, drop);

      // Task 3 moves from index 2 to index 0
      expect(result.newGlobalOrder).toEqual([3, 1, 2]);
    });

    it("should handle filtered view with hidden elements", () => {
      // Global: A(1), B(2), C(3), D(4), E(5), F(6)
      // Visible: A(1), D(4), F(6)
      // Move: A → after F, so visible becomes D, F, A
      // Expected global: B, C, D, E, F, A

      const visibleTasks = [
        createTestTask(1),
        createTestTask(4),
        createTestTask(6),
      ];
      const globalOrder = [1, 2, 3, 4, 5, 6];

      const drag = createDragContext(0, "withDue", visibleTasks[0]!);
      const drop = createDropTarget(3, "withDue"); // After last element

      const result = resolveManualOrder(globalOrder, visibleTasks, drag, drop);

      // Visible order changes: [1, 4, 6] -> [4, 6, 1]
      // Hidden elements B(2), C(3), E(5) stay in place
      expect(result.newGlobalOrder).toEqual([4, 2, 3, 6, 5, 1]);
    });

    it("should handle task not found in visible list", () => {
      const tasks = [createTestTask(1), createTestTask(2)];
      const globalOrder = [1, 2, 3];

      // Create drag context with a task that's not in visible list
      const notVisibleTask = createTestTask(3);
      const drag = createDragContext(0, "withDue", notVisibleTask);
      const drop = createDropTarget(1, "withDue");

      const result = resolveManualOrder(globalOrder, tasks, drag, drop);

      // Order should remain unchanged since task isn't visible
      expect(result.newGlobalOrder).toEqual([1, 2, 3]);
    });

    it("should handle cross-section move", () => {
      const tasks = [createTestTask(1), createTestTask(2), createTestTask(3)];
      const globalOrder = [1, 2, 3];

      const drag = createDragContext(0, "withDue", tasks[0]!);
      const drop = createDropTarget(1, "withoutDue"); // Different section

      const result = resolveManualOrder(globalOrder, tasks, drag, drop);

      // Task 1 moves to new position
      expect(result.movedTask.id).toBe(1);
    });

    it("should handle moving to beginning of section", () => {
      const tasks = [createTestTask(1), createTestTask(2), createTestTask(3)];
      const globalOrder = [1, 2, 3];

      const drag = createDragContext(1, "withDue", tasks[1]!);
      const drop = createDropTarget(0, "withDue");

      const result = resolveManualOrder(globalOrder, tasks, drag, drop);

      expect(result.newGlobalOrder).toEqual([2, 1, 3]);
    });

    it("should handle moving to end of section", () => {
      const tasks = [createTestTask(1), createTestTask(2), createTestTask(3)];
      const globalOrder = [1, 2, 3];

      const drag = createDragContext(0, "withDue", tasks[0]!);
      const drop = createDropTarget(3, "withDue");

      const result = resolveManualOrder(globalOrder, tasks, drag, drop);

      expect(result.newGlobalOrder).toEqual([2, 3, 1]);
    });
  });

  describe("calculateNewPositions", () => {
    it("should assign positions with 1000 gap", () => {
      const order = [3, 1, 2];
      const positions = calculateNewPositions(order);

      expect(positions.get(3)).toBe(0);
      expect(positions.get(1)).toBe(1000);
      expect(positions.get(2)).toBe(2000);
    });

    it("should handle empty order", () => {
      const positions = calculateNewPositions([]);

      expect(positions.size).toBe(0);
    });

    it("should handle single element", () => {
      const positions = calculateNewPositions([42]);

      expect(positions.get(42)).toBe(0);
      expect(positions.size).toBe(1);
    });
  });
});
