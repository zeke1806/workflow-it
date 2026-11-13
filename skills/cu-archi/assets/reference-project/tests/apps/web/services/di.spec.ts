import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { createFetchApiService } from "../../../../apps/web/src/services/adapters/api/fetch-api-service.js";
import { createDependencies } from "../../../../apps/web/src/services/di.js";

describe("apps/web/services/di", () => {
  describe("1. Composition", () => {
    it("1.1 compose l'adapter API injecté dans les services Todo et Project", () => {
      let requests = 0;

      const api = createFetchApiService({
        fetchClient: async () => {
          requests += 1;

          return Response.json([]);
        },
      });
      const dependencies = createDependencies({ api });

      assert.equal(requests, 0);
      assert.deepEqual(Object.keys(dependencies), ["todo", "project"]);
      assert.equal(typeof dependencies.todo.connect, "function");
      assert.equal(typeof dependencies.project.listAllOptions, "function");
      assert.equal(Object.isFrozen(dependencies.todo), true);
      assert.equal(Object.isFrozen(dependencies), true);
    });
  });
});
