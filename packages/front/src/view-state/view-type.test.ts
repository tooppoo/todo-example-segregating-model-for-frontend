import { describe, it, expect } from "vitest";
import { ViewType, isViewType } from "./view-type.js";

describe("ViewType", () => {
  describe("ViewType values", () => {
    it("should have INBOX value", () => {
      expect(ViewType.INBOX).toBe("inbox");
    });

    it("should have PROJECT value", () => {
      expect(ViewType.PROJECT).toBe("project");
    });

    it("should have TRASH value", () => {
      expect(ViewType.TRASH).toBe("trash");
    });
  });

  describe("isViewType", () => {
    it("should return true for valid view type values", () => {
      expect(isViewType("inbox")).toBe(true);
      expect(isViewType("project")).toBe(true);
      expect(isViewType("trash")).toBe(true);
    });

    it("should return false for invalid string values", () => {
      expect(isViewType("invalid")).toBe(false);
      expect(isViewType("INBOX")).toBe(false);
      expect(isViewType("")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isViewType(null)).toBe(false);
      expect(isViewType(undefined)).toBe(false);
      expect(isViewType(123)).toBe(false);
      expect(isViewType({})).toBe(false);
    });
  });
});
