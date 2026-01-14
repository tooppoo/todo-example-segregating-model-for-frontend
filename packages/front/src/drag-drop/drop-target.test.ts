import { describe, it, expect } from "vitest";
import { createDropTarget } from "./drop-target.js";

describe("DropTarget", () => {
  describe("createDropTarget", () => {
    it("should create a drop target with given values", () => {
      const target = createDropTarget(2, "withDue");

      expect(target.targetIndex).toBe(2);
      expect(target.targetSection).toBe("withDue");
    });

    it("should create a frozen object", () => {
      const target = createDropTarget(0, "withoutDue");

      expect(Object.isFrozen(target)).toBe(true);
    });
  });
});
