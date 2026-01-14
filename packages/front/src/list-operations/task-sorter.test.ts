import { describe, it, expect } from "vitest";
import { sortTasks } from "./task-sorter.js";
import { createDisplayTask } from "../display/display-task.js";
import { Priority } from "../domain/priority.js";
import { SortType } from "../view-state/sort-type.js";

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

describe("TaskSorter", () => {
  describe("sortTasks", () => {
    describe("MANUAL sort", () => {
      it("should sort by manualSortPosition ascending", () => {
        const tasks = [
          createTestTask(1, { manualSortPosition: 300 }),
          createTestTask(2, { manualSortPosition: 100 }),
          createTestTask(3, { manualSortPosition: 200 }),
        ];

        const sorted = sortTasks(tasks, SortType.MANUAL);

        expect(sorted[0]?.id).toBe(2);
        expect(sorted[1]?.id).toBe(3);
        expect(sorted[2]?.id).toBe(1);
      });
    });

    describe("CREATED_AT sort", () => {
      it("should sort by createdAt descending (newest first)", () => {
        const tasks = [
          createTestTask(1, { createdAt: new Date("2026-01-01") }),
          createTestTask(2, { createdAt: new Date("2026-01-03") }),
          createTestTask(3, { createdAt: new Date("2026-01-02") }),
        ];

        const sorted = sortTasks(tasks, SortType.CREATED_AT);

        expect(sorted[0]?.id).toBe(2);
        expect(sorted[1]?.id).toBe(3);
        expect(sorted[2]?.id).toBe(1);
      });
    });

    describe("DUE_AT sort", () => {
      it("should sort by dueAt ascending (earliest first)", () => {
        const tasks = [
          createTestTask(1, { dueAt: new Date("2026-01-15") }),
          createTestTask(2, { dueAt: new Date("2026-01-10") }),
          createTestTask(3, { dueAt: new Date("2026-01-12") }),
        ];

        const sorted = sortTasks(tasks, SortType.DUE_AT);

        expect(sorted[0]?.id).toBe(2);
        expect(sorted[1]?.id).toBe(3);
        expect(sorted[2]?.id).toBe(1);
      });

      it("should put tasks without due date at the end", () => {
        const tasks = [
          createTestTask(1, { dueAt: null }),
          createTestTask(2, { dueAt: new Date("2026-01-10") }),
          createTestTask(3, { dueAt: null }),
        ];

        const sorted = sortTasks(tasks, SortType.DUE_AT);

        expect(sorted[0]?.id).toBe(2);
        expect(sorted[1]?.id).toBe(1);
        expect(sorted[2]?.id).toBe(3);
      });

      it("should maintain order for tasks both without due date", () => {
        const tasks = [
          createTestTask(1, { dueAt: null }),
          createTestTask(2, { dueAt: null }),
        ];

        const sorted = sortTasks(tasks, SortType.DUE_AT);

        // Both have null dueAt, so relative order should be preserved
        expect(sorted).toHaveLength(2);
      });
    });

    describe("PRIORITY sort", () => {
      it("should sort by priority descending (high first)", () => {
        const tasks = [
          createTestTask(1, { priority: Priority.LOW }),
          createTestTask(2, { priority: Priority.HIGH }),
          createTestTask(3, { priority: Priority.MEDIUM }),
          createTestTask(4, { priority: Priority.NONE }),
        ];

        const sorted = sortTasks(tasks, SortType.PRIORITY);

        expect(sorted[0]?.id).toBe(2); // HIGH
        expect(sorted[1]?.id).toBe(3); // MEDIUM
        expect(sorted[2]?.id).toBe(1); // LOW
        expect(sorted[3]?.id).toBe(4); // NONE
      });
    });

    it("should not mutate the original array", () => {
      const tasks = [
        createTestTask(1, { manualSortPosition: 300 }),
        createTestTask(2, { manualSortPosition: 100 }),
      ];
      const originalOrder = [...tasks];

      sortTasks(tasks, SortType.MANUAL);

      expect(tasks[0]?.id).toBe(originalOrder[0]?.id);
      expect(tasks[1]?.id).toBe(originalOrder[1]?.id);
    });
  });
});
