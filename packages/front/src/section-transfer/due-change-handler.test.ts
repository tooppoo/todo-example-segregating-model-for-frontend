import { describe, it, expect } from "vitest";
import { addDue, removeDue, changeDue } from "./due-change-handler.js";
import { createDisplayTask } from "../display/display-task.js";
import { Priority } from "../domain/priority.js";

function createTestTask(
  id: number,
  overrides: Partial<Parameters<typeof createDisplayTask>[0]> = {}
) {
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
    ...overrides,
  });
}

describe("DueChangeHandler", () => {
  describe("addDue", () => {
    it("should add due date to task", () => {
      const task = createTestTask(1, { dueAt: null });
      const dueAt = new Date("2026-01-14");
      const withDueTasks: ReturnType<typeof createTestTask>[] = [];

      const result = addDue(task, dueAt, withDueTasks);

      expect(result.updatedTask.dueAt?.getTime()).toBe(dueAt.getTime());
    });

    it("should set transfer from withoutDue to withDue at head", () => {
      const task = createTestTask(1, { dueAt: null });
      const dueAt = new Date("2026-01-14");

      const result = addDue(task, dueAt, []);

      expect(result.transfer.fromSection).toBe("withoutDue");
      expect(result.transfer.toSection).toBe("withDue");
      expect(result.transfer.insertPosition).toBe("head");
    });

    it("should calculate position at head of withDue section", () => {
      const task = createTestTask(1, { dueAt: null });
      const dueAt = new Date("2026-01-14");
      const withDueTasks = [
        createTestTask(2, { dueAt: new Date(), manualSortPosition: 500 }),
        createTestTask(3, { dueAt: new Date(), manualSortPosition: 1000 }),
      ];

      const result = addDue(task, dueAt, withDueTasks);

      // Should be 1000 less than minimum position (500)
      expect(result.newManualSortPosition).toBe(-500);
      expect(result.updatedTask.manualSortPosition).toBe(-500);
    });

    it("should use position 0 - 1000 when withDue is empty", () => {
      const task = createTestTask(1, { dueAt: null });
      const dueAt = new Date("2026-01-14");

      const result = addDue(task, dueAt, []);

      expect(result.newManualSortPosition).toBe(-1000);
    });

    it("should throw error if task already has due date", () => {
      const task = createTestTask(1, { dueAt: new Date() });

      expect(() => addDue(task, new Date("2026-01-14"), [])).toThrow(
        "Task already has a due date"
      );
    });

    it("should create a copy of the due date", () => {
      const task = createTestTask(1, { dueAt: null });
      const dueAt = new Date("2026-01-14");

      const result = addDue(task, dueAt, []);

      dueAt.setFullYear(2020);
      expect(result.updatedTask.dueAt?.getFullYear()).toBe(2026);
    });
  });

  describe("removeDue", () => {
    it("should remove due date from task", () => {
      const task = createTestTask(1, { dueAt: new Date("2026-01-14") });
      const withoutDueTasks: ReturnType<typeof createTestTask>[] = [];

      const result = removeDue(task, withoutDueTasks);

      expect(result.updatedTask.dueAt).toBeNull();
    });

    it("should set transfer from withDue to withoutDue at tail", () => {
      const task = createTestTask(1, { dueAt: new Date("2026-01-14") });

      const result = removeDue(task, []);

      expect(result.transfer.fromSection).toBe("withDue");
      expect(result.transfer.toSection).toBe("withoutDue");
      expect(result.transfer.insertPosition).toBe("tail");
    });

    it("should calculate position at tail of withoutDue section", () => {
      const task = createTestTask(1, { dueAt: new Date("2026-01-14") });
      const withoutDueTasks = [
        createTestTask(2, { dueAt: null, manualSortPosition: 500 }),
        createTestTask(3, { dueAt: null, manualSortPosition: 1000 }),
      ];

      const result = removeDue(task, withoutDueTasks);

      // Should be 1000 more than maximum position (1000)
      expect(result.newManualSortPosition).toBe(2000);
      expect(result.updatedTask.manualSortPosition).toBe(2000);
    });

    it("should use position 0 + 1000 when withoutDue is empty", () => {
      const task = createTestTask(1, { dueAt: new Date("2026-01-14") });

      const result = removeDue(task, []);

      expect(result.newManualSortPosition).toBe(1000);
    });

    it("should throw error if task does not have due date", () => {
      const task = createTestTask(1, { dueAt: null });

      expect(() => removeDue(task, [])).toThrow(
        "Task does not have a due date"
      );
    });
  });

  describe("changeDue", () => {
    it("should change due date of task", () => {
      const task = createTestTask(1, { dueAt: new Date("2026-01-14") });
      const newDueAt = new Date("2026-01-20");

      const result = changeDue(task, newDueAt);

      expect(result.dueAt?.getTime()).toBe(newDueAt.getTime());
    });

    it("should not change manual sort position", () => {
      const task = createTestTask(1, {
        dueAt: new Date("2026-01-14"),
        manualSortPosition: 500,
      });
      const newDueAt = new Date("2026-01-20");

      const result = changeDue(task, newDueAt);

      expect(result.manualSortPosition).toBe(500);
    });

    it("should throw error if task does not have due date", () => {
      const task = createTestTask(1, { dueAt: null });

      expect(() => changeDue(task, new Date("2026-01-20"))).toThrow(
        "Task does not have a due date. Use addDue instead."
      );
    });

    it("should create a copy of the new due date", () => {
      const task = createTestTask(1, { dueAt: new Date("2026-01-14") });
      const newDueAt = new Date("2026-01-20");

      const result = changeDue(task, newDueAt);

      newDueAt.setFullYear(2020);
      expect(result.dueAt?.getFullYear()).toBe(2026);
    });
  });
});
