import { describe, it, expect } from "vitest";
import { createTag } from "./tag.js";

describe("Tag", () => {
  describe("createTag", () => {
    it("should create a tag with the given parameters", () => {
      const tag = createTag({
        id: 1,
        slug: "work",
        name: "Work",
      });

      expect(tag.id).toBe(1);
      expect(tag.slug).toBe("work");
      expect(tag.name).toBe("Work");
    });

    it("should create a frozen object", () => {
      const tag = createTag({
        id: 1,
        slug: "work",
        name: "Work",
      });

      expect(Object.isFrozen(tag)).toBe(true);
    });
  });
});
