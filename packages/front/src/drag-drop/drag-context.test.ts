import { describe, it, expect } from "vitest";
import { createDragContext } from "./drag-context.js";
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

describe("DragContext", () => {
  describe("createDragContext", () => {
    it("should create a drag context with given values", () => {
      const task = createTestTask(1);
      const context = createDragContext(0, "withDue", task);

      expect(context.sourceIndex).toBe(0);
      expect(context.sourceSection).toBe("withDue");
      expect(context.task).toBe(task);
    });

    it("should create a frozen object", () => {
      const task = createTestTask(1);
      const context = createDragContext(0, "withoutDue", task);

      expect(Object.isFrozen(context)).toBe(true);
    });
  });
});
