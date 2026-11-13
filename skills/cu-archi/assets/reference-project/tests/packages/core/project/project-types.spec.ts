import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  createProjectInputSchema,
  updateProjectInputSchema,
  projectSchema,
} from "@cu-archi/core/project";

describe("packages/core/project/project-types", () => {
  describe("1. Contrats partagés", () => {
    it("1.1 partage la validation des noms et conserve les mises à jour partielles", () => {
      for (const name of ["", "   ", "\t\n"]) {
        assert.equal(createProjectInputSchema.safeParse({ name }).success, false);
        assert.equal(updateProjectInputSchema.safeParse({ name }).success, false);
      }

      assert.deepEqual(createProjectInputSchema.parse({ name: "  Maison  " }), {
        name: "Maison",
      });
      assert.deepEqual(updateProjectInputSchema.parse({ archived: true }), { archived: true });
      assert.equal(updateProjectInputSchema.safeParse({ archived: false }).success, false);
    });

    it("1.2 retourne un projet readonly sans modifier son entrée", () => {
      const input = { id: "home", name: "Maison", archived: false };
      const project = projectSchema.parse(input);
      input.name = "Travail";
      assert.equal(project.name, "Maison");
      assert.equal(Object.isFrozen(project), true);
    });
  });
});
