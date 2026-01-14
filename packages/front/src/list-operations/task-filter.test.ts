import { describe, it, expect } from "vitest";
import { applyFilter, matchesFilter } from "./task-filter.js";
import { createDisplayTask } from "../display/display-task.js";
import { createFilterState } from "../view-state/filter-state.js";
import { createDueFilter } from "../view-state/due-filter.js";
import { Priority } from "../domain/priority.js";
import { StatusFilter } from "../view-state/status-filter.js";
import { createTag } from "../domain/tag.js";

function createTestTask(
  id: number,
  overrides: Partial<Parameters<typeof createDisplayTask>[0]> = {}
) {
  return createDisplayTask({
    id,
    slug: `task-${id}`,
    title: `Task ${id}`,
    description: `Description ${id}`,
    priority: Priority.NONE,
    createdAt: new Date("2026-01-01"),
    manualSortPosition: id * 100,
    dueAt: null,
    completedAt: null,
    archivedAt: null,
    ...overrides,
  });
}

describe("TaskFilter", () => {
  describe("applyFilter", () => {
    it("should return all tasks when filter is empty", () => {
      const tasks = [createTestTask(1), createTestTask(2), createTestTask(3)];
      const filter = createFilterState();

      const result = applyFilter(tasks, filter);

      expect(result).toHaveLength(3);
    });

    it("should filter tasks matching all criteria", () => {
      const tasks = [
        createTestTask(1, { title: "Buy groceries", priority: Priority.HIGH }),
        createTestTask(2, { title: "Read book", priority: Priority.LOW }),
        createTestTask(3, { title: "Buy coffee", priority: Priority.HIGH }),
      ];
      const filter = createFilterState({
        query: "Buy",
        priority: Priority.HIGH,
      });

      const result = applyFilter(tasks, filter);

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe(1);
      expect(result[1]?.id).toBe(3);
    });
  });

  describe("matchesFilter", () => {
    describe("query filter", () => {
      it("should match when query is null", () => {
        const task = createTestTask(1);
        const filter = createFilterState({ query: null });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match when query is empty string", () => {
        const task = createTestTask(1);
        const filter = createFilterState({ query: "" });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match when query is whitespace only", () => {
        const task = createTestTask(1);
        const filter = createFilterState({ query: "   " });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match title case-insensitively", () => {
        const task = createTestTask(1, { title: "Buy Groceries" });
        const filter = createFilterState({ query: "buy" });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match description case-insensitively", () => {
        const task = createTestTask(1, { description: "Need to buy milk" });
        const filter = createFilterState({ query: "BUY" });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should not match when query is not found", () => {
        const task = createTestTask(1, {
          title: "Read book",
          description: "Fiction",
        });
        const filter = createFilterState({ query: "grocery" });

        expect(matchesFilter(task, filter)).toBe(false);
      });
    });

    describe("tags filter", () => {
      it("should match when tags filter is empty", () => {
        const task = createTestTask(1);
        const filter = createFilterState({ tags: [] });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match when task has all required tags", () => {
        const task = createTestTask(1, {
          tags: [
            createTag({ id: 1, slug: "work", name: "Work" }),
            createTag({ id: 2, slug: "urgent", name: "Urgent" }),
          ],
        });
        const filter = createFilterState({ tags: ["work", "urgent"] });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match when task has more tags than required", () => {
        const task = createTestTask(1, {
          tags: [
            createTag({ id: 1, slug: "work", name: "Work" }),
            createTag({ id: 2, slug: "urgent", name: "Urgent" }),
            createTag({ id: 3, slug: "home", name: "Home" }),
          ],
        });
        const filter = createFilterState({ tags: ["work"] });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should not match when task is missing a required tag", () => {
        const task = createTestTask(1, {
          tags: [createTag({ id: 1, slug: "work", name: "Work" })],
        });
        const filter = createFilterState({ tags: ["work", "urgent"] });

        expect(matchesFilter(task, filter)).toBe(false);
      });
    });

    describe("priority filter", () => {
      it("should match when priority filter is null", () => {
        const task = createTestTask(1, { priority: Priority.HIGH });
        const filter = createFilterState({ priority: null });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match when priority equals filter", () => {
        const task = createTestTask(1, { priority: Priority.HIGH });
        const filter = createFilterState({ priority: Priority.HIGH });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should not match when priority differs", () => {
        const task = createTestTask(1, { priority: Priority.LOW });
        const filter = createFilterState({ priority: Priority.HIGH });

        expect(matchesFilter(task, filter)).toBe(false);
      });
    });

    describe("status filter", () => {
      it("should match when status filter is null", () => {
        const task = createTestTask(1);
        const filter = createFilterState({ status: null });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match active tasks when filter is ACTIVE", () => {
        const task = createTestTask(1, { completedAt: null });
        const filter = createFilterState({ status: StatusFilter.ACTIVE });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should not match completed tasks when filter is ACTIVE", () => {
        const task = createTestTask(1, { completedAt: new Date() });
        const filter = createFilterState({ status: StatusFilter.ACTIVE });

        expect(matchesFilter(task, filter)).toBe(false);
      });

      it("should match completed tasks when filter is COMPLETED", () => {
        const task = createTestTask(1, { completedAt: new Date() });
        const filter = createFilterState({ status: StatusFilter.COMPLETED });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should not match active tasks when filter is COMPLETED", () => {
        const task = createTestTask(1, { completedAt: null });
        const filter = createFilterState({ status: StatusFilter.COMPLETED });

        expect(matchesFilter(task, filter)).toBe(false);
      });
    });

    describe("due filter", () => {
      it("should match when due filter is null", () => {
        const task = createTestTask(1, { dueAt: new Date("2026-01-14") });
        const filter = createFilterState({ due: null });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match when due date matches exact filter", () => {
        const task = createTestTask(1, { dueAt: new Date("2026-01-14") });
        const filter = createFilterState({
          due: createDueFilter("exact", new Date("2026-01-14")),
        });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should match when due date is before until filter", () => {
        const task = createTestTask(1, { dueAt: new Date("2026-01-10") });
        const filter = createFilterState({
          due: createDueFilter("until", new Date("2026-01-14")),
        });

        expect(matchesFilter(task, filter)).toBe(true);
      });

      it("should not match when task has no due date", () => {
        const task = createTestTask(1, { dueAt: null });
        const filter = createFilterState({
          due: createDueFilter("exact", new Date("2026-01-14")),
        });

        expect(matchesFilter(task, filter)).toBe(false);
      });
    });
  });
});
