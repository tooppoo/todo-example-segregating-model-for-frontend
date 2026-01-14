import { describe, it, expect } from "vitest";
import { buildTaskListView } from "./task-list-builder.js";
import { createDisplayTask } from "../display/display-task.js";
import { createViewState, createFilterState } from "../view-state/index.js";
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
    completedAt: null,
    archivedAt: null,
    ...overrides,
  });
}

describe("TaskListBuilder", () => {
  describe("buildTaskListView", () => {
    it("should split tasks into withDue and withoutDue sections", () => {
      const tasks = [
        createTestTask(1, { dueAt: new Date("2026-01-14") }),
        createTestTask(2, { dueAt: null }),
        createTestTask(3, { dueAt: new Date("2026-01-15") }),
      ];
      const state = createViewState();

      const view = buildTaskListView(tasks, state);

      expect(view.withDue.tasks).toHaveLength(2);
      expect(view.withoutDue.tasks).toHaveLength(1);
    });

    it("should apply filter before splitting", () => {
      const tasks = [
        createTestTask(1, {
          title: "Buy groceries",
          dueAt: new Date("2026-01-14"),
        }),
        createTestTask(2, { title: "Read book", dueAt: null }),
        createTestTask(3, { title: "Buy coffee", dueAt: null }),
      ];
      const state = createViewState({
        filter: createFilterState({ query: "Buy" }),
      });

      const view = buildTaskListView(tasks, state);

      expect(view.withDue.tasks).toHaveLength(1);
      expect(view.withDue.tasks[0]?.id).toBe(1);
      expect(view.withoutDue.tasks).toHaveLength(1);
      expect(view.withoutDue.tasks[0]?.id).toBe(3);
    });

    it("should sort each section independently", () => {
      const tasks = [
        createTestTask(1, {
          dueAt: new Date("2026-01-14"),
          manualSortPosition: 300,
        }),
        createTestTask(2, { dueAt: null, manualSortPosition: 100 }),
        createTestTask(3, {
          dueAt: new Date("2026-01-15"),
          manualSortPosition: 100,
        }),
        createTestTask(4, { dueAt: null, manualSortPosition: 200 }),
      ];
      const state = createViewState({ sort: SortType.MANUAL });

      const view = buildTaskListView(tasks, state);

      // withDue sorted by manualSortPosition
      expect(view.withDue.tasks[0]?.id).toBe(3);
      expect(view.withDue.tasks[1]?.id).toBe(1);

      // withoutDue sorted by manualSortPosition
      expect(view.withoutDue.tasks[0]?.id).toBe(2);
      expect(view.withoutDue.tasks[1]?.id).toBe(4);
    });

    it("should handle empty task list", () => {
      const state = createViewState();

      const view = buildTaskListView([], state);

      expect(view.withDue.tasks).toHaveLength(0);
      expect(view.withoutDue.tasks).toHaveLength(0);
    });

    it("should handle all tasks having due dates", () => {
      const tasks = [
        createTestTask(1, { dueAt: new Date("2026-01-14") }),
        createTestTask(2, { dueAt: new Date("2026-01-15") }),
      ];
      const state = createViewState();

      const view = buildTaskListView(tasks, state);

      expect(view.withDue.tasks).toHaveLength(2);
      expect(view.withoutDue.tasks).toHaveLength(0);
    });

    it("should handle all tasks without due dates", () => {
      const tasks = [
        createTestTask(1, { dueAt: null }),
        createTestTask(2, { dueAt: null }),
      ];
      const state = createViewState();

      const view = buildTaskListView(tasks, state);

      expect(view.withDue.tasks).toHaveLength(0);
      expect(view.withoutDue.tasks).toHaveLength(2);
    });

    it("should apply priority sort to both sections", () => {
      const tasks = [
        createTestTask(1, {
          dueAt: new Date("2026-01-14"),
          priority: Priority.LOW,
        }),
        createTestTask(2, {
          dueAt: new Date("2026-01-15"),
          priority: Priority.HIGH,
        }),
        createTestTask(3, { dueAt: null, priority: Priority.MEDIUM }),
        createTestTask(4, { dueAt: null, priority: Priority.HIGH }),
      ];
      const state = createViewState({ sort: SortType.PRIORITY });

      const view = buildTaskListView(tasks, state);

      expect(view.withDue.tasks[0]?.id).toBe(2); // HIGH
      expect(view.withDue.tasks[1]?.id).toBe(1); // LOW

      expect(view.withoutDue.tasks[0]?.id).toBe(4); // HIGH
      expect(view.withoutDue.tasks[1]?.id).toBe(3); // MEDIUM
    });
  });
});
