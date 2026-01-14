import { describe, it, expect } from "vitest";
import {
  createTaskSection,
  isSectionEmpty,
  getSectionTaskCount,
} from "./task-section.js";
import { createDisplayTask } from "./display-task.js";
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

describe("TaskSection", () => {
  describe("createTaskSection", () => {
    it("should create a withDue section with default label", () => {
      const section = createTaskSection("withDue", []);

      expect(section.type).toBe("withDue");
      expect(section.label).toBe("期限あり");
      expect(section.tasks).toEqual([]);
    });

    it("should create a withoutDue section with default label", () => {
      const section = createTaskSection("withoutDue", []);

      expect(section.type).toBe("withoutDue");
      expect(section.label).toBe("期限なし");
    });

    it("should create a section with custom label", () => {
      const section = createTaskSection("withDue", [], "Custom Label");

      expect(section.label).toBe("Custom Label");
    });

    it("should create a section with tasks", () => {
      const tasks = [createTestTask(1), createTestTask(2)];
      const section = createTaskSection("withDue", tasks);

      expect(section.tasks).toHaveLength(2);
      expect(section.tasks[0]?.id).toBe(1);
      expect(section.tasks[1]?.id).toBe(2);
    });

    it("should create a frozen object", () => {
      const section = createTaskSection("withDue", []);
      expect(Object.isFrozen(section)).toBe(true);
    });

    it("should freeze the tasks array", () => {
      const section = createTaskSection("withDue", [createTestTask(1)]);
      expect(Object.isFrozen(section.tasks)).toBe(true);
    });

    it("should create a copy of the tasks array", () => {
      const tasks = [createTestTask(1)];
      const section = createTaskSection("withDue", tasks);

      expect(section.tasks).not.toBe(tasks);
      expect(section.tasks).toEqual(tasks);
    });
  });

  describe("isSectionEmpty", () => {
    it("should return true for empty section", () => {
      const section = createTaskSection("withDue", []);
      expect(isSectionEmpty(section)).toBe(true);
    });

    it("should return false for section with tasks", () => {
      const section = createTaskSection("withDue", [createTestTask(1)]);
      expect(isSectionEmpty(section)).toBe(false);
    });
  });

  describe("getSectionTaskCount", () => {
    it("should return 0 for empty section", () => {
      const section = createTaskSection("withDue", []);
      expect(getSectionTaskCount(section)).toBe(0);
    });

    it("should return correct count for section with tasks", () => {
      const section = createTaskSection("withDue", [
        createTestTask(1),
        createTestTask(2),
        createTestTask(3),
      ]);
      expect(getSectionTaskCount(section)).toBe(3);
    });
  });
});
