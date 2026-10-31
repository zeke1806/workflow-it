import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { todoSchema } from "@cu-archi/core";
import { createDependencies } from "../../apps/api/src/services/di.js";
import {
  createSQLiteRepositoryService,
  migrateSQLiteDatabase,
} from "../../apps/api/src/services/adapters/repository/sqlite-repository-service.js";
import { MemorySQLite, createSequentialIdService } from "../repository/repository-fixtures.js";
import { createMemoryFetch, jsonHeaders as headers, memoryUrl as url } from "./api-fixtures.js";

describe("API", () => {
  describe("api", () => {
    describe("1. Routes HTTP", () => {
      it("1.1 sert le CRUD et la recherche à travers un seul assemblage de dépendances", async () => {
        const fetch = createMemoryFetch();
        const health = await fetch(`${url}/health`);
        assert.deepEqual(await health.json(), { status: "ok" });

        const created = await fetch(`${url}/todos`, {
          method: "POST",
          headers,
          body: JSON.stringify({ title: "HTTP Todo" }),
        });
        assert.equal(created.status, 201);

        const todo = todoSchema.parse(await created.json());
        const listed = await fetch(`${url}/todos?search=HTTP`);
        assert.deepEqual(await listed.json(), [todo]);

        const noMatch = await fetch(`${url}/todos?search=missing`);
        assert.deepEqual(await noMatch.json(), []);

        const updated = await fetch(`${url}/todos/${todo.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ completed: true }),
        });
        assert.equal(updated.status, 200);
        assert.deepEqual(await updated.json(), { ...todo, completed: true });

        const deleted = await fetch(`${url}/todos/${todo.id}`, { method: "DELETE" });
        assert.equal(deleted.status, 204);
        assert.equal(await deleted.text(), "");

        const empty = await fetch(`${url}/todos`);
        assert.deepEqual(await empty.json(), []);
      });

      it("1.2 répond 400 pour une entrée invalide et 404 pour une tâche ou une route absente", async () => {
        const fetch = createMemoryFetch();
        const invalid = await fetch(`${url}/todos`, {
          method: "POST",
          headers,
          body: JSON.stringify({ title: 123 }),
        });
        assert.equal(invalid.status, 400);

        const invalidSearch = await fetch(`${url}/todos?search=x&search=y`);
        assert.equal(invalidSearch.status, 400);

        const invalidJson = await fetch(`${url}/todos`, { method: "POST", headers, body: "{" });
        assert.equal(invalidJson.status, 400);

        const missing = await fetch(`${url}/todos/missing`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ completed: true }),
        });
        assert.equal(missing.status, 404);

        const missingDelete = await fetch(`${url}/todos/missing`, { method: "DELETE" });
        assert.equal(missingDelete.status, 404);

        const unknownRoute = await fetch(`${url}/unknown`);
        assert.equal(unknownRoute.status, 404);

        const empty = await fetch(`${url}/todos`);
        assert.deepEqual(await empty.json(), []);
      });

      it("1.3 applique le contrat de titre partagé à la création et à la modification", async () => {
        const fetch = createMemoryFetch();
        for (const title of ["", "   ", "\t\n"]) {
          const invalid = await fetch(`${url}/todos`, {
            method: "POST",
            headers,
            body: JSON.stringify({ title }),
          });
          assert.equal(invalid.status, 400);
        }

        const created = await fetch(`${url}/todos`, {
          method: "POST",
          headers,
          body: JSON.stringify({ title: "  HTTP title  " }),
        });
        assert.equal(created.status, 201);

        const todo = todoSchema.parse(await created.json());
        assert.equal(todo.title, "HTTP title");

        for (const title of ["", "   "]) {
          const invalid = await fetch(`${url}/todos/${todo.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ title }),
          });
          assert.equal(invalid.status, 400);
        }

        const updated = await fetch(`${url}/todos/${todo.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ title: "  Edited title  " }),
        });
        assert.equal(updated.status, 200);
        assert.equal(todoSchema.parse(await updated.json()).title, "Edited title");
      });
    });

    describe("2. DI", () => {
      it("2.1 compose le service Todo avec le contrat repository injecté", async () => {
        const database = new MemorySQLite();
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
    });
  });
});
