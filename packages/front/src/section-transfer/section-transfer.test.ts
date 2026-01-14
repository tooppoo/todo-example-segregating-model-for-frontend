import { describe, it, expect } from "vitest";
import { createSectionTransfer } from "./section-transfer.js";
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

describe("SectionTransfer", () => {
  describe("createSectionTransfer", () => {
    it("should create a section transfer with given values", () => {
      const task = createTestTask(1);
      const transfer = createSectionTransfer(
        task,
        "withoutDue",
        "withDue",
        "head"
      );

      expect(transfer.task).toBe(task);
      expect(transfer.fromSection).toBe("withoutDue");
      expect(transfer.toSection).toBe("withDue");
      expect(transfer.insertPosition).toBe("head");
    });

    it("should create transfer for removing due date", () => {
      const task = createTestTask(1);
      const transfer = createSectionTransfer(
        task,
        "withDue",
        "withoutDue",
        "tail"
      );

      expect(transfer.fromSection).toBe("withDue");
      expect(transfer.toSection).toBe("withoutDue");
      expect(transfer.insertPosition).toBe("tail");
    });

    it("should create a frozen object", () => {
      const task = createTestTask(1);
      const transfer = createSectionTransfer(
        task,
        "withoutDue",
        "withDue",
        "head"
      );

      expect(Object.isFrozen(transfer)).toBe(true);
    });
  });
});
