import { describe, it, expect } from "vitest";
import {
  createTaskListView,
  getAllTasks,
  getVisibleTaskIds,
  getTotalTaskCount,
  isEmptyView,
} from "./task-list-view.js";
import { createDisplayTask } from "./display-task.js";
import { Priority } from "../domain/priority.js";

function createTestTask(id: number, hasDue: boolean = false) {
  return createDisplayTask({
    id,
    slug: `task-${id}`,
    title: `Task ${id}`,
    description: "",
    priority: Priority.NONE,
    createdAt: new Date("2026-01-01"),
    manualSortPosition: id * 100,
    dueAt: hasDue ? new Date("2026-01-14") : null,
    archivedAt: null,
  });
}

describe("TaskListView", () => {
  describe("createTaskListView", () => {
    it("should create a view with two sections", () => {
      const withDue = [createTestTask(1, true)];
      const withoutDue = [createTestTask(2, false)];
      const view = createTaskListView(withDue, withoutDue);

      expect(view.withDue.type).toBe("withDue");
      expect(view.withDue.tasks).toHaveLength(1);
      expect(view.withoutDue.type).toBe("withoutDue");
      expect(view.withoutDue.tasks).toHaveLength(1);
    });

    it("should create a frozen object", () => {
      const view = createTaskListView([], []);
      expect(Object.isFrozen(view)).toBe(true);
    });

    it("should create empty sections when no tasks provided", () => {
      const view = createTaskListView([], []);

      expect(view.withDue.tasks).toHaveLength(0);
      expect(view.withoutDue.tasks).toHaveLength(0);
    });
  });

  describe("getAllTasks", () => {
    it("should return all tasks from both sections", () => {
      const view = createTaskListView(
        [createTestTask(1, true), createTestTask(2, true)],
        [createTestTask(3, false)]
      );

      const allTasks = getAllTasks(view);

      expect(allTasks).toHaveLength(3);
      expect(allTasks[0]?.id).toBe(1);
      expect(allTasks[1]?.id).toBe(2);
      expect(allTasks[2]?.id).toBe(3);
    });

    it("should return empty array for empty view", () => {
      const view = createTaskListView([], []);
      expect(getAllTasks(view)).toHaveLength(0);
    });

    it("should return tasks in order: withDue first, then withoutDue", () => {
      const view = createTaskListView(
        [createTestTask(1, true)],
        [createTestTask(2, false)]
      );

      const allTasks = getAllTasks(view);

      expect(allTasks[0]?.id).toBe(1);
      expect(allTasks[1]?.id).toBe(2);
    });
  });

  describe("getVisibleTaskIds", () => {
    it("should return all task ids", () => {
      const view = createTaskListView(
        [createTestTask(1, true)],
        [createTestTask(2, false), createTestTask(3, false)]
      );

      const ids = getVisibleTaskIds(view);

      expect(ids).toEqual([1, 2, 3]);
    });

    it("should return empty array for empty view", () => {
      const view = createTaskListView([], []);
      expect(getVisibleTaskIds(view)).toEqual([]);
    });
  });

  describe("getTotalTaskCount", () => {
    it("should return total count of tasks from both sections", () => {
      const view = createTaskListView(
        [createTestTask(1, true), createTestTask(2, true)],
        [createTestTask(3, false)]
      );

      expect(getTotalTaskCount(view)).toBe(3);
    });

    it("should return 0 for empty view", () => {
      const view = createTaskListView([], []);
      expect(getTotalTaskCount(view)).toBe(0);
    });
  });

  describe("isEmptyView", () => {
    it("should return true for empty view", () => {
      const view = createTaskListView([], []);
      expect(isEmptyView(view)).toBe(true);
    });

    it("should return false when withDue has tasks", () => {
      const view = createTaskListView([createTestTask(1, true)], []);
      expect(isEmptyView(view)).toBe(false);
    });

    it("should return false when withoutDue has tasks", () => {
      const view = createTaskListView([], [createTestTask(1, false)]);
      expect(isEmptyView(view)).toBe(false);
    });

    it("should return false when both sections have tasks", () => {
      const view = createTaskListView(
        [createTestTask(1, true)],
        [createTestTask(2, false)]
      );
      expect(isEmptyView(view)).toBe(false);
    });
  });
});
