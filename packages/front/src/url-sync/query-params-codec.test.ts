import { describe, it, expect } from "vitest";
import {
  encodeViewState,
  decodeQueryParams,
  encodeToRecord,
  decodeFromRecord,
} from "./query-params-codec.js";
import { createQueryParams } from "./query-params.js";
import { createViewState, createFilterState } from "../view-state/index.js";
import { ViewType } from "../view-state/view-type.js";
import { SortType } from "../view-state/sort-type.js";
import { StatusFilter } from "../view-state/status-filter.js";
import { Priority } from "../domain/priority.js";
import { createDueFilter } from "../view-state/due-filter.js";

describe("QueryParamsCodec", () => {
  describe("encodeViewState", () => {
    it("should encode default state to mostly null params", () => {
      const state = createViewState();
      const params = encodeViewState(state);

      expect(params.q).toBeNull();
      expect(params.tags).toBeNull();
      expect(params.priority).toBeNull();
      expect(params.status).toBeNull();
      expect(params.view).toBeNull(); // INBOX is default
      expect(params.sort).toBeNull(); // MANUAL is default
      expect(params.due).toBeNull();
    });

    it("should encode query", () => {
      const state = createViewState({
        filter: createFilterState({ query: "search term" }),
      });
      const params = encodeViewState(state);

      expect(params.q).toBe("search term");
    });

    it("should encode tags as comma-separated string", () => {
      const state = createViewState({
        filter: createFilterState({ tags: ["work", "urgent"] }),
      });
      const params = encodeViewState(state);

      expect(params.tags).toBe("work,urgent");
    });

    it("should encode empty tags as null", () => {
      const state = createViewState({
        filter: createFilterState({ tags: [] }),
      });
      const params = encodeViewState(state);

      expect(params.tags).toBeNull();
    });

    it("should encode priority", () => {
      const state = createViewState({
        filter: createFilterState({ priority: Priority.HIGH }),
      });
      const params = encodeViewState(state);

      expect(params.priority).toBe("high");
    });

    it("should encode status", () => {
      const state = createViewState({
        filter: createFilterState({ status: StatusFilter.ACTIVE }),
      });
      const params = encodeViewState(state);

      expect(params.status).toBe("active");
    });

    it("should encode non-default view", () => {
      const state = createViewState({ view: ViewType.TRASH });
      const params = encodeViewState(state);

      expect(params.view).toBe("trash");
    });

    it("should encode non-default sort", () => {
      const state = createViewState({ sort: SortType.PRIORITY });
      const params = encodeViewState(state);

      expect(params.sort).toBe("priority");
    });

    it("should encode due filter", () => {
      const state = createViewState({
        filter: createFilterState({
          due: createDueFilter("until", new Date("2026-01-14")),
        }),
      });
      const params = encodeViewState(state);

      expect(params.due).toBe("~2026-01-14");
    });
  });

  describe("decodeQueryParams", () => {
    it("should decode empty params to default state", () => {
      const params = createQueryParams();
      const state = decodeQueryParams(params);

      expect(state.view).toBe(ViewType.INBOX);
      expect(state.sort).toBe(SortType.MANUAL);
      expect(state.filter.query).toBeNull();
      expect(state.filter.tags).toEqual([]);
    });

    it("should decode query", () => {
      const params = createQueryParams({ q: "search" });
      const state = decodeQueryParams(params);

      expect(state.filter.query).toBe("search");
    });

    it("should decode tags from comma-separated string", () => {
      const params = createQueryParams({ tags: "work,urgent" });
      const state = decodeQueryParams(params);

      expect(state.filter.tags).toEqual(["work", "urgent"]);
    });

    it("should filter out empty tags", () => {
      const params = createQueryParams({ tags: "work,,urgent," });
      const state = decodeQueryParams(params);

      expect(state.filter.tags).toEqual(["work", "urgent"]);
    });

    it("should decode valid priority", () => {
      const params = createQueryParams({ priority: "high" });
      const state = decodeQueryParams(params);

      expect(state.filter.priority).toBe(Priority.HIGH);
    });

    it("should ignore invalid priority", () => {
      const params = createQueryParams({ priority: "invalid" });
      const state = decodeQueryParams(params);

      expect(state.filter.priority).toBeNull();
    });

    it("should decode valid status", () => {
      const params = createQueryParams({ status: "completed" });
      const state = decodeQueryParams(params);

      expect(state.filter.status).toBe(StatusFilter.COMPLETED);
    });

    it("should ignore invalid status", () => {
      const params = createQueryParams({ status: "invalid" });
      const state = decodeQueryParams(params);

      expect(state.filter.status).toBeNull();
    });

    it("should decode valid view", () => {
      const params = createQueryParams({ view: "trash" });
      const state = decodeQueryParams(params);

      expect(state.view).toBe(ViewType.TRASH);
    });

    it("should default to INBOX for invalid view", () => {
      const params = createQueryParams({ view: "invalid" });
      const state = decodeQueryParams(params);

      expect(state.view).toBe(ViewType.INBOX);
    });

    it("should decode valid sort", () => {
      const params = createQueryParams({ sort: "priority" });
      const state = decodeQueryParams(params);

      expect(state.sort).toBe(SortType.PRIORITY);
    });

    it("should default to MANUAL for invalid sort", () => {
      const params = createQueryParams({ sort: "invalid" });
      const state = decodeQueryParams(params);

      expect(state.sort).toBe(SortType.MANUAL);
    });

    it("should decode due filter", () => {
      const params = createQueryParams({ due: "~2026-01-14" });
      const state = decodeQueryParams(params);

      expect(state.filter.due).not.toBeNull();
      expect(state.filter.due!.type).toBe("until");
    });

    it("should handle invalid due filter", () => {
      const params = createQueryParams({ due: "invalid" });
      const state = decodeQueryParams(params);

      expect(state.filter.due).toBeNull();
    });
  });

  describe("encodeToRecord", () => {
    it("should encode ViewState to record", () => {
      const state = createViewState({
        view: ViewType.TRASH,
        filter: createFilterState({ query: "search" }),
      });
      const record = encodeToRecord(state);

      expect(record["q"]).toBe("search");
      expect(record["view"]).toBe("trash");
    });

    it("should exclude null values from record", () => {
      const state = createViewState();
      const record = encodeToRecord(state);

      expect(Object.keys(record)).toHaveLength(0);
    });
  });

  describe("decodeFromRecord", () => {
    it("should decode record to ViewState", () => {
      const record = {
        q: "search",
        view: "trash",
        sort: "priority",
      };
      const state = decodeFromRecord(record);

      expect(state.filter.query).toBe("search");
      expect(state.view).toBe(ViewType.TRASH);
      expect(state.sort).toBe(SortType.PRIORITY);
    });

    it("should handle empty record", () => {
      const state = decodeFromRecord({});

      expect(state.view).toBe(ViewType.INBOX);
      expect(state.sort).toBe(SortType.MANUAL);
    });

    it("should handle undefined values in record", () => {
      const record = {
        q: undefined,
        view: "inbox",
      };
      const state = decodeFromRecord(record);

      expect(state.filter.query).toBeNull();
      expect(state.view).toBe(ViewType.INBOX);
    });
  });
});
