import { describe, it, expect } from "vitest";
import { SortType, isSortType } from "./sort-type.js";

describe("SortType", () => {
  describe("SortType values", () => {
    it("should have MANUAL value", () => {
      expect(SortType.MANUAL).toBe("manual");
    });

    it("should have CREATED_AT value", () => {
      expect(SortType.CREATED_AT).toBe("createdAt");
    });

    it("should have DUE_AT value", () => {
      expect(SortType.DUE_AT).toBe("dueAt");
    });

    it("should have PRIORITY value", () => {
      expect(SortType.PRIORITY).toBe("priority");
    });
  });

  describe("isSortType", () => {
    it("should return true for valid sort type values", () => {
      expect(isSortType("manual")).toBe(true);
      expect(isSortType("createdAt")).toBe(true);
      expect(isSortType("dueAt")).toBe(true);
      expect(isSortType("priority")).toBe(true);
    });

    it("should return false for invalid string values", () => {
      expect(isSortType("invalid")).toBe(false);
      expect(isSortType("MANUAL")).toBe(false);
      expect(isSortType("")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isSortType(null)).toBe(false);
      expect(isSortType(undefined)).toBe(false);
      expect(isSortType(123)).toBe(false);
      expect(isSortType({})).toBe(false);
    });
  });
});
