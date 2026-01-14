import { describe, it, expect } from "vitest";
import { createReorderResult } from "./reorder-result.js";
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
    completedAt: null,
    archivedAt: null,
  });
}

describe("ReorderResult", () => {
  describe("createReorderResult", () => {
    it("should create a reorder result with given values", () => {
      const task = createTestTask(1);
      const newOrder = [3, 1, 2];
      const result = createReorderResult(task, newOrder);

      expect(result.movedTask).toBe(task);
      expect(result.newGlobalOrder).toEqual([3, 1, 2]);
    });

    it("should create a frozen object", () => {
      const task = createTestTask(1);
      const result = createReorderResult(task, [1, 2, 3]);

      expect(Object.isFrozen(result)).toBe(true);
    });

    it("should freeze the newGlobalOrder array", () => {
      const task = createTestTask(1);
      const result = createReorderResult(task, [1, 2, 3]);

      expect(Object.isFrozen(result.newGlobalOrder)).toBe(true);
    });

    it("should create a copy of the order array", () => {
      const task = createTestTask(1);
      const newOrder = [1, 2, 3];
      const result = createReorderResult(task, newOrder);

      newOrder.push(4);

      expect(result.newGlobalOrder).toEqual([1, 2, 3]);
    });
  });
});
