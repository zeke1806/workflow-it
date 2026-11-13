import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { createCryptoIdService } from "../../../../../../apps/api/src/services/adapters/id/crypto-id-service.js";

describe("apps/api/services/adapters/id/crypto-id-service", () => {
  describe("1. Identifiants", () => {
    it("1.1 l'adapter crypto crée des UUID distincts", () => {
      const id = createCryptoIdService();

      const first = id.create();
      const second = id.create();

      assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      assert.notEqual(first, second);
      assert.equal(Object.isFrozen(id), true);
    });
  });
});
