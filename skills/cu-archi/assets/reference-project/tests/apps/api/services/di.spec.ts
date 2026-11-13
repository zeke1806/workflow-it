import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { createDependencies } from "../../../../apps/api/src/services/di.js";
import {
  createSQLiteRepositoryService,
  migrateSQLiteDatabase,
} from "../../../../apps/api/src/services/adapters/repository/sqlite-repository-service.js";
import { createMemorySQLite, createSequentialIdService } from "../api-fixtures.js";

describe("apps/api/services/di", () => {
  describe("1. Composition", () => {
    it("1.1 compose le service Todo avec le contrat repository injecté", async () => {
      const database = createMemorySQLite();
      const repository = createSQLiteRepositoryService(
        createSequentialIdService(),
        migrateSQLiteDatabase(database.client),
      );
      const dependencies = createDependencies({ repository });

      const todo = await dependencies.todo.create({ title: "Injected Todo" });
      assert.deepEqual(Object.keys(dependencies), ["todo", "project"]);
      assert.deepEqual(await dependencies.todo.list({ search: "Injected" }), [todo]);

      const updated = await dependencies.todo.update(todo.id, { completed: true });
      assert.equal(updated.completed, true);

      await dependencies.todo.delete(todo.id);
      assert.deepEqual(await dependencies.todo.list(), []);
      await assert.rejects(dependencies.todo.update(todo.id, { title: "Missing" }), {
        message: "Todo not found",
      });
      assert.equal(Object.isFrozen(dependencies.todo), true);
      assert.equal(Object.isFrozen(dependencies), true);
    });

    it("1.2 génère les identifiants des tâches et des projets via l'adapter id injecté", async () => {
      const database = createMemorySQLite();
      const repository = createSQLiteRepositoryService(
        createSequentialIdService(),
        migrateSQLiteDatabase(database.client),
      );
      const dependencies = createDependencies({ repository });

      const project = await dependencies.project.create({ name: "Maison" });
      const todo = await dependencies.todo.create({ title: "Ranger", projectId: project.id });

      assert.equal(project.id, "id-1");
      assert.equal(todo.id, "id-2");
      assert.equal(todo.projectId, "id-1");
    });
  });
});
