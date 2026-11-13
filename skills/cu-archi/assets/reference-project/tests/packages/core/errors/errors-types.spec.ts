import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { appErrors } from "@cu-archi/core/errors";

describe("packages/core/errors/errors-types", () => {
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
