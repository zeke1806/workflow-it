import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { appErrors, createAppError } from "@cu-archi/core";
import { readErrorText } from "../../apps/web/src/services/errors/errors-service.js";
import {
  createMemoryFetch,
  memoryUrl as url,
} from "../scrum-2610311427/scrum-2610311427-fixtures.js";

describe("SCRUM-2610242126 : Centraliser les erreurs métier", () => {
  describe("core", () => {
    describe("1. Catalogue", () => {
      it("1.1 chaque erreur métier a un message anglais unique et un statut HTTP", () => {
        const definitions = Object.values(appErrors);
        const messages = new Set<string>();

        for (const definition of definitions) {
          assert.match(definition.message, /^[A-Z][a-z ]+$/);
          assert.ok(definition.status >= 400 && definition.status < 600);
          messages.add(definition.message);
        }

        assert.equal(messages.size, definitions.length);
      });
    });
  });

  describe("api", () => {
    describe("1. Catalogue", () => {
      it("1.1 l'API renvoie le message et le statut du catalogue", async () => {
        const fetch = createMemoryFetch();
        const response = await fetch(`${url}/todos/missing`, { method: "DELETE" });
        const body = await response.json();

        assert.equal(response.status, appErrors.todoNotFound.status);
        assert.equal(body.message, appErrors.todoNotFound.message);
      });
    });
  });

  describe("web", () => {
    describe("1. Texte affiché", () => {
      it("1.1 le front affiche le texte de sa correspondance, sinon le fallback", () => {
        const texts = { [appErrors.todoNotFound.message]: "Cette tâche n’existe pas." };

        assert.equal(
          readErrorText(createAppError(appErrors.todoNotFound, "id: t1"), texts, "Erreur."),
          "Cette tâche n’existe pas.",
        );
        assert.equal(
          readErrorText(createAppError(appErrors.internal, "boom"), texts, "Erreur."),
          "Erreur.",
        );
      });
    });
  });
});
