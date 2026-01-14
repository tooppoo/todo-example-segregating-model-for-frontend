import { describe, it, expect } from "vitest";
import { Priority, comparePriority, isPriority } from "./priority.js";

describe("Priority", () => {
  describe("Priority values", () => {
    it("should have HIGH value", () => {
      expect(Priority.HIGH).toBe("high");
    });

    it("should have MEDIUM value", () => {
      expect(Priority.MEDIUM).toBe("medium");
    });

    it("should have LOW value", () => {
      expect(Priority.LOW).toBe("low");
    });

    it("should have NONE value", () => {
      expect(Priority.NONE).toBe("none");
    });
  });

  describe("comparePriority", () => {
    it("should return negative when a has higher priority than b", () => {
      expect(comparePriority(Priority.HIGH, Priority.LOW)).toBeLessThan(0);
      expect(comparePriority(Priority.HIGH, Priority.MEDIUM)).toBeLessThan(0);
      expect(comparePriority(Priority.MEDIUM, Priority.LOW)).toBeLessThan(0);
      expect(comparePriority(Priority.LOW, Priority.NONE)).toBeLessThan(0);
    });

    it("should return positive when a has lower priority than b", () => {
      expect(comparePriority(Priority.LOW, Priority.HIGH)).toBeGreaterThan(0);
      expect(comparePriority(Priority.MEDIUM, Priority.HIGH)).toBeGreaterThan(0);
      expect(comparePriority(Priority.LOW, Priority.MEDIUM)).toBeGreaterThan(0);
      expect(comparePriority(Priority.NONE, Priority.LOW)).toBeGreaterThan(0);
    });

    it("should return 0 when priorities are equal", () => {
      expect(comparePriority(Priority.HIGH, Priority.HIGH)).toBe(0);
      expect(comparePriority(Priority.MEDIUM, Priority.MEDIUM)).toBe(0);
      expect(comparePriority(Priority.LOW, Priority.LOW)).toBe(0);
      expect(comparePriority(Priority.NONE, Priority.NONE)).toBe(0);
    });
  });

  describe("isPriority", () => {
    it("should return true for valid priority values", () => {
      expect(isPriority("high")).toBe(true);
      expect(isPriority("medium")).toBe(true);
      expect(isPriority("low")).toBe(true);
      expect(isPriority("none")).toBe(true);
    });

    it("should return false for invalid string values", () => {
      expect(isPriority("invalid")).toBe(false);
      expect(isPriority("HIGH")).toBe(false);
      expect(isPriority("")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isPriority(null)).toBe(false);
      expect(isPriority(undefined)).toBe(false);
      expect(isPriority(123)).toBe(false);
      expect(isPriority({})).toBe(false);
      expect(isPriority([])).toBe(false);
    });
  });
});
