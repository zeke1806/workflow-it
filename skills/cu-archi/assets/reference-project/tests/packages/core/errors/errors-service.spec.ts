import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { core } from "@cu-archi/core";
import { appErrors } from "@cu-archi/core/errors";

describe("packages/core/errors/errors-service", () => {
  describe("1. Forme d'erreur unique", () => {
    it("1.1 crée une AppError depuis une erreur du catalogue, avec son message et son statut", () => {
      assert.deepEqual(core.errorsService.createAppError(appErrors.projectArchived, "id: p1"), {
        message: "Project archived",
        description: "id: p1",
        status: 409,
      });
    });
  });

  describe("2. Texte affiché", () => {
    it("2.1 le front affiche le texte de sa correspondance, sinon le fallback", () => {
      const texts = { [appErrors.todoNotFound.message]: "Cette tâche n’existe pas." };

      assert.equal(
        core.errorsService.readErrorText({
          error: core.errorsService.createAppError(appErrors.todoNotFound, "id: t1"),
          texts,
          fallback: "Erreur.",
        }),
        "Cette tâche n’existe pas.",
      );
      assert.equal(
        core.errorsService.readErrorText({
          error: core.errorsService.createAppError(appErrors.internal, "boom"),
          texts,
          fallback: "Erreur.",
        }),
        "Erreur.",
      );
    });
  });
});
