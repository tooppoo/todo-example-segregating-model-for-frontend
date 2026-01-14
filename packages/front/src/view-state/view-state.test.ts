import { describe, it, expect } from "vitest";
import {
  createViewState,
  isDragDropEnabled,
  updateViewState,
} from "./view-state.js";
import { ViewType } from "./view-type.js";
import { SortType } from "./sort-type.js";
import { createFilterState } from "./filter-state.js";
import { Priority } from "../domain/priority.js";

describe("ViewState", () => {
  describe("createViewState", () => {
    it("should create a view state with default values", () => {
      const state = createViewState();

      expect(state.view).toBe(ViewType.INBOX);
      expect(state.sort).toBe(SortType.MANUAL);
      expect(state.filter).toEqual(createFilterState());
    });

    it("should create a view state with provided values", () => {
      const filter = createFilterState({ query: "search" });
      const state = createViewState({
        view: ViewType.TRASH,
        sort: SortType.PRIORITY,
        filter,
      });

      expect(state.view).toBe(ViewType.TRASH);
      expect(state.sort).toBe(SortType.PRIORITY);
      expect(state.filter).toBe(filter);
    });

    it("should create a frozen object", () => {
      const state = createViewState();
      expect(Object.isFrozen(state)).toBe(true);
    });
  });

  describe("isDragDropEnabled", () => {
    it("should return true when sort is MANUAL", () => {
      const state = createViewState({ sort: SortType.MANUAL });
      expect(isDragDropEnabled(state)).toBe(true);
    });

    it("should return false when sort is CREATED_AT", () => {
      const state = createViewState({ sort: SortType.CREATED_AT });
      expect(isDragDropEnabled(state)).toBe(false);
    });

    it("should return false when sort is DUE_AT", () => {
      const state = createViewState({ sort: SortType.DUE_AT });
      expect(isDragDropEnabled(state)).toBe(false);
    });

    it("should return false when sort is PRIORITY", () => {
      const state = createViewState({ sort: SortType.PRIORITY });
      expect(isDragDropEnabled(state)).toBe(false);
    });
  });

  describe("updateViewState", () => {
    it("should update view", () => {
      const state = createViewState({ view: ViewType.INBOX });
      const updated = updateViewState(state, { view: ViewType.TRASH });

      expect(updated.view).toBe(ViewType.TRASH);
    });

    it("should update sort", () => {
      const state = createViewState({ sort: SortType.MANUAL });
      const updated = updateViewState(state, { sort: SortType.PRIORITY });

      expect(updated.sort).toBe(SortType.PRIORITY);
    });

    it("should update filter properties", () => {
      const state = createViewState();
      const updated = updateViewState(state, {
        filter: { query: "search", priority: Priority.HIGH },
      });

      expect(updated.filter.query).toBe("search");
      expect(updated.filter.priority).toBe(Priority.HIGH);
    });

    it("should preserve filter when not updating", () => {
      const filter = createFilterState({ query: "search" });
      const state = createViewState({ filter });
      const updated = updateViewState(state, { view: ViewType.TRASH });

      expect(updated.filter.query).toBe("search");
    });

    it("should preserve other properties when updating filter", () => {
      const state = createViewState({
        view: ViewType.PROJECT,
        sort: SortType.PRIORITY,
      });
      const updated = updateViewState(state, { filter: { query: "test" } });

      expect(updated.view).toBe(ViewType.PROJECT);
      expect(updated.sort).toBe(SortType.PRIORITY);
    });
  });
});
