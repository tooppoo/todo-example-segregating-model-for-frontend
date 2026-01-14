import { describe, it, expect } from "vitest";
import {
  createFilterState,
  isEmptyFilter,
  updateFilterState,
} from "./filter-state.js";
import { Priority } from "../domain/priority.js";
import { StatusFilter } from "./status-filter.js";
import { createDueFilter } from "./due-filter.js";

describe("FilterState", () => {
  describe("createFilterState", () => {
    it("should create a filter state with default values", () => {
      const filter = createFilterState();

      expect(filter.query).toBeNull();
      expect(filter.tags).toEqual([]);
      expect(filter.priority).toBeNull();
      expect(filter.status).toBeNull();
      expect(filter.due).toBeNull();
    });

    it("should create a filter state with provided values", () => {
      const due = createDueFilter("exact", new Date("2026-01-14"));
      const filter = createFilterState({
        query: "search term",
        tags: ["work", "urgent"],
        priority: Priority.HIGH,
        status: StatusFilter.ACTIVE,
        due,
      });

      expect(filter.query).toBe("search term");
      expect(filter.tags).toEqual(["work", "urgent"]);
      expect(filter.priority).toBe(Priority.HIGH);
      expect(filter.status).toBe(StatusFilter.ACTIVE);
      expect(filter.due).toBe(due);
    });

    it("should create a frozen object", () => {
      const filter = createFilterState();
      expect(Object.isFrozen(filter)).toBe(true);
    });

    it("should freeze the tags array", () => {
      const filter = createFilterState({ tags: ["work"] });
      expect(Object.isFrozen(filter.tags)).toBe(true);
    });
  });

  describe("isEmptyFilter", () => {
    it("should return true for empty filter", () => {
      const filter = createFilterState();
      expect(isEmptyFilter(filter)).toBe(true);
    });

    it("should return false when query is set", () => {
      const filter = createFilterState({ query: "search" });
      expect(isEmptyFilter(filter)).toBe(false);
    });

    it("should return false when tags are set", () => {
      const filter = createFilterState({ tags: ["work"] });
      expect(isEmptyFilter(filter)).toBe(false);
    });

    it("should return false when priority is set", () => {
      const filter = createFilterState({ priority: Priority.HIGH });
      expect(isEmptyFilter(filter)).toBe(false);
    });

    it("should return false when status is set", () => {
      const filter = createFilterState({ status: StatusFilter.ACTIVE });
      expect(isEmptyFilter(filter)).toBe(false);
    });

    it("should return false when due is set", () => {
      const filter = createFilterState({
        due: createDueFilter("exact", new Date("2026-01-14")),
      });
      expect(isEmptyFilter(filter)).toBe(false);
    });
  });

  describe("updateFilterState", () => {
    it("should update query", () => {
      const filter = createFilterState({ query: "old" });
      const updated = updateFilterState(filter, { query: "new" });

      expect(updated.query).toBe("new");
    });

    it("should update tags", () => {
      const filter = createFilterState({ tags: ["old"] });
      const updated = updateFilterState(filter, { tags: ["new"] });

      expect(updated.tags).toEqual(["new"]);
    });

    it("should preserve other properties when updating", () => {
      const filter = createFilterState({
        query: "search",
        priority: Priority.HIGH,
      });
      const updated = updateFilterState(filter, { query: "new search" });

      expect(updated.query).toBe("new search");
      expect(updated.priority).toBe(Priority.HIGH);
    });
  });
});
