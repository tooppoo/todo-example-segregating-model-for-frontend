import { describe, it, expect } from "vitest";
import {
  createDisplayTask,
  hasDue,
  isArchived,
  updateDisplayTask,
} from "./display-task.js";
import { Priority } from "../domain/priority.js";
import { createTag } from "../domain/tag.js";

function createTestTask(
  overrides: Partial<Parameters<typeof createDisplayTask>[0]> = {}
) {
  return createDisplayTask({
    id: 1,
    slug: "task-1",
    title: "Test Task",
    description: "Test description",
    priority: Priority.MEDIUM,
    createdAt: new Date("2026-01-01"),
    manualSortPosition: 0,
    dueAt: null,
    archivedAt: null,
    ...overrides,
  });
}

describe("DisplayTask", () => {
  describe("createDisplayTask", () => {
    it("should create a display task with required fields", () => {
      const task = createTestTask();

      expect(task.id).toBe(1);
      expect(task.slug).toBe("task-1");
      expect(task.title).toBe("Test Task");
      expect(task.description).toBe("Test description");
      expect(task.priority).toBe(Priority.MEDIUM);
      expect(task.manualSortPosition).toBe(0);
    });

    it("should create a task with empty tags by default", () => {
      const task = createTestTask();
      expect(task.tags).toEqual([]);
    });

    it("should create a task with provided tags", () => {
      const tags = [createTag({ id: 1, slug: "work", name: "Work" })];
      const task = createTestTask({ tags });

      expect(task.tags).toEqual(tags);
    });

    it("should create a frozen object", () => {
      const task = createTestTask();
      expect(Object.isFrozen(task)).toBe(true);
    });

    it("should freeze the tags array", () => {
      const task = createTestTask({ tags: [] });
      expect(Object.isFrozen(task.tags)).toBe(true);
    });

    it("should create a copy of dates", () => {
      const dueAt = new Date("2026-01-14");
      const createdAt = new Date("2026-01-01");
      const archivedAt = new Date("2026-01-10");

      const task = createTestTask({ dueAt, createdAt, archivedAt });

      dueAt.setFullYear(2020);
      createdAt.setFullYear(2020);
      archivedAt.setFullYear(2020);

      expect(task.dueAt?.getFullYear()).toBe(2026);
      expect(task.createdAt.getFullYear()).toBe(2026);
      expect(task.archivedAt?.getFullYear()).toBe(2026);
    });

    it("should handle null dueAt", () => {
      const task = createTestTask({ dueAt: null });
      expect(task.dueAt).toBeNull();
    });

    it("should handle null archivedAt", () => {
      const task = createTestTask({ archivedAt: null });
      expect(task.archivedAt).toBeNull();
    });
  });

  describe("hasDue", () => {
    it("should return true when dueAt is set", () => {
      const task = createTestTask({ dueAt: new Date("2026-01-14") });
      expect(hasDue(task)).toBe(true);
    });

    it("should return false when dueAt is null", () => {
      const task = createTestTask({ dueAt: null });
      expect(hasDue(task)).toBe(false);
    });
  });

  describe("isArchived", () => {
    it("should return true when archivedAt is set", () => {
      const task = createTestTask({ archivedAt: new Date("2026-01-10") });
      expect(isArchived(task)).toBe(true);
    });

    it("should return false when archivedAt is null", () => {
      const task = createTestTask({ archivedAt: null });
      expect(isArchived(task)).toBe(false);
    });
  });

  describe("updateDisplayTask", () => {
    it("should update title", () => {
      const task = createTestTask({ title: "Old Title" });
      const updated = updateDisplayTask(task, { title: "New Title" });

      expect(updated.title).toBe("New Title");
    });

    it("should update dueAt", () => {
      const task = createTestTask({ dueAt: null });
      const newDueAt = new Date("2026-01-14");
      const updated = updateDisplayTask(task, { dueAt: newDueAt });

      expect(updated.dueAt?.getTime()).toBe(newDueAt.getTime());
    });

    it("should preserve id", () => {
      const task = createTestTask({ id: 42 });
      const updated = updateDisplayTask(task, { title: "New Title" });

      expect(updated.id).toBe(42);
    });

    it("should preserve other fields when updating", () => {
      const task = createTestTask({
        title: "Original",
        description: "Original description",
        priority: Priority.HIGH,
      });
      const updated = updateDisplayTask(task, { title: "Updated" });

      expect(updated.description).toBe("Original description");
      expect(updated.priority).toBe(Priority.HIGH);
    });
  });
});
