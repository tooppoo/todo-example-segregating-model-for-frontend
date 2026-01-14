import { describe, it, expect } from "vitest";
import { StatusFilter, isStatusFilter } from "./status-filter.js";

describe("StatusFilter", () => {
  describe("StatusFilter values", () => {
    it("should have ACTIVE value", () => {
      expect(StatusFilter.ACTIVE).toBe("active");
    });

    it("should have COMPLETED value", () => {
      expect(StatusFilter.COMPLETED).toBe("completed");
    });
  });

  describe("isStatusFilter", () => {
    it("should return true for valid status filter values", () => {
      expect(isStatusFilter("active")).toBe(true);
      expect(isStatusFilter("completed")).toBe(true);
    });

    it("should return false for invalid string values", () => {
      expect(isStatusFilter("invalid")).toBe(false);
      expect(isStatusFilter("ACTIVE")).toBe(false);
      expect(isStatusFilter("")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isStatusFilter(null)).toBe(false);
      expect(isStatusFilter(undefined)).toBe(false);
      expect(isStatusFilter(123)).toBe(false);
      expect(isStatusFilter({})).toBe(false);
    });
  });
});
