import { describe, it, expect } from "vitest";
import {
  createDueFilter,
  matchesDueFilter,
  parseDueFilter,
  formatDueFilter,
} from "./due-filter.js";

describe("DueFilter", () => {
  describe("createDueFilter", () => {
    it("should create an exact due filter", () => {
      const date = new Date("2026-01-14");
      const filter = createDueFilter("exact", date);

      expect(filter.type).toBe("exact");
      expect(filter.date.getTime()).toBe(date.getTime());
    });

    it("should create an until due filter", () => {
      const date = new Date("2026-01-14");
      const filter = createDueFilter("until", date);

      expect(filter.type).toBe("until");
      expect(filter.date.getTime()).toBe(date.getTime());
    });

    it("should create a frozen object", () => {
      const filter = createDueFilter("exact", new Date("2026-01-14"));
      expect(Object.isFrozen(filter)).toBe(true);
    });

    it("should create a copy of the date", () => {
      const date = new Date("2026-01-14");
      const filter = createDueFilter("exact", date);
      date.setFullYear(2020);

      expect(filter.date.getFullYear()).toBe(2026);
    });
  });

  describe("matchesDueFilter", () => {
    describe("exact filter", () => {
      it("should return true when dates match", () => {
        const filter = createDueFilter("exact", new Date("2026-01-14"));
        const dueAt = new Date("2026-01-14T10:30:00");

        expect(matchesDueFilter(filter, dueAt)).toBe(true);
      });

      it("should return false when dates do not match", () => {
        const filter = createDueFilter("exact", new Date("2026-01-14"));
        const dueAt = new Date("2026-01-15");

        expect(matchesDueFilter(filter, dueAt)).toBe(false);
      });
    });

    describe("until filter", () => {
      it("should return true when dueAt is before filter date", () => {
        const filter = createDueFilter("until", new Date("2026-01-14"));
        const dueAt = new Date("2026-01-13");

        expect(matchesDueFilter(filter, dueAt)).toBe(true);
      });

      it("should return true when dueAt equals filter date", () => {
        const filter = createDueFilter("until", new Date("2026-01-14"));
        const dueAt = new Date("2026-01-14T23:59:59");

        expect(matchesDueFilter(filter, dueAt)).toBe(true);
      });

      it("should return false when dueAt is after filter date", () => {
        const filter = createDueFilter("until", new Date("2026-01-14"));
        const dueAt = new Date("2026-01-15");

        expect(matchesDueFilter(filter, dueAt)).toBe(false);
      });
    });

    it("should return false when dueAt is null", () => {
      const filter = createDueFilter("exact", new Date("2026-01-14"));
      expect(matchesDueFilter(filter, null)).toBe(false);
    });
  });

  describe("parseDueFilter", () => {
    it("should parse exact date format", () => {
      const filter = parseDueFilter("2026-01-14");

      expect(filter).not.toBeNull();
      expect(filter!.type).toBe("exact");
      expect(filter!.date.getFullYear()).toBe(2026);
      expect(filter!.date.getMonth()).toBe(0); // January
      expect(filter!.date.getDate()).toBe(14);
    });

    it("should parse until date format with tilde prefix", () => {
      const filter = parseDueFilter("~2026-01-14");

      expect(filter).not.toBeNull();
      expect(filter!.type).toBe("until");
      expect(filter!.date.getFullYear()).toBe(2026);
    });

    it("should return null for empty string", () => {
      expect(parseDueFilter("")).toBeNull();
    });

    it("should return null for invalid date", () => {
      expect(parseDueFilter("invalid-date")).toBeNull();
      expect(parseDueFilter("~invalid")).toBeNull();
    });
  });

  describe("formatDueFilter", () => {
    it("should format exact filter without prefix", () => {
      const filter = createDueFilter("exact", new Date("2026-01-14"));
      expect(formatDueFilter(filter)).toBe("2026-01-14");
    });

    it("should format until filter with tilde prefix", () => {
      const filter = createDueFilter("until", new Date("2026-01-14"));
      expect(formatDueFilter(filter)).toBe("~2026-01-14");
    });
  });
});
