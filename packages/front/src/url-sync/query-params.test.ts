import { describe, it, expect } from "vitest";
import { createQueryParams, parseFromRecord, toRecord } from "./query-params.js";

describe("QueryParams", () => {
  describe("createQueryParams", () => {
    it("should create query params with default null values", () => {
      const params = createQueryParams();

      expect(params.q).toBeNull();
      expect(params.tags).toBeNull();
      expect(params.priority).toBeNull();
      expect(params.status).toBeNull();
      expect(params.view).toBeNull();
      expect(params.sort).toBeNull();
      expect(params.due).toBeNull();
    });

    it("should create query params with provided values", () => {
      const params = createQueryParams({
        q: "search",
        tags: "work,urgent",
        priority: "high",
        status: "active",
        view: "inbox",
        sort: "manual",
        due: "2026-01-14",
      });

      expect(params.q).toBe("search");
      expect(params.tags).toBe("work,urgent");
      expect(params.priority).toBe("high");
      expect(params.status).toBe("active");
      expect(params.view).toBe("inbox");
      expect(params.sort).toBe("manual");
      expect(params.due).toBe("2026-01-14");
    });

    it("should create a frozen object", () => {
      const params = createQueryParams();
      expect(Object.isFrozen(params)).toBe(true);
    });
  });

  describe("parseFromRecord", () => {
    it("should parse all fields from record", () => {
      const record = {
        q: "search",
        tags: "work",
        priority: "high",
        status: "active",
        view: "inbox",
        sort: "manual",
        due: "2026-01-14",
      };

      const params = parseFromRecord(record);

      expect(params.q).toBe("search");
      expect(params.tags).toBe("work");
      expect(params.priority).toBe("high");
      expect(params.status).toBe("active");
      expect(params.view).toBe("inbox");
      expect(params.sort).toBe("manual");
      expect(params.due).toBe("2026-01-14");
    });

    it("should handle undefined values", () => {
      const record = {
        q: undefined,
        tags: undefined,
      };

      const params = parseFromRecord(record);

      expect(params.q).toBeNull();
      expect(params.tags).toBeNull();
    });

    it("should handle empty record", () => {
      const params = parseFromRecord({});

      expect(params.q).toBeNull();
      expect(params.tags).toBeNull();
      expect(params.priority).toBeNull();
    });
  });

  describe("toRecord", () => {
    it("should convert params to record", () => {
      const params = createQueryParams({
        q: "search",
        tags: "work,urgent",
        priority: "high",
        status: "active",
        view: "trash",
        sort: "priority",
        due: "2026-01-14",
      });

      const record = toRecord(params);

      expect(record["q"]).toBe("search");
      expect(record["tags"]).toBe("work,urgent");
      expect(record["priority"]).toBe("high");
      expect(record["status"]).toBe("active");
      expect(record["view"]).toBe("trash");
      expect(record["sort"]).toBe("priority");
      expect(record["due"]).toBe("2026-01-14");
    });

    it("should exclude null values", () => {
      const params = createQueryParams({
        q: "search",
        tags: null,
      });

      const record = toRecord(params);

      expect(record["q"]).toBe("search");
      expect("tags" in record).toBe(false);
    });

    it("should return empty record for all null params", () => {
      const params = createQueryParams();
      const record = toRecord(params);

      expect(Object.keys(record)).toHaveLength(0);
    });
  });
});
