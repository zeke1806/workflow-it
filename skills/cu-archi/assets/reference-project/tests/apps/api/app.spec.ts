import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";
import { appErrors } from "@cu-archi/core/errors";
import { todoSchema } from "@cu-archi/core/todo";
import { createApp } from "../../../apps/api/src/app.js";
import { createDependencies } from "../../../apps/api/src/services/di.js";
import type { Repository } from "../../../apps/api/src/services/adapters/repository/repository-types.js";
import {
  assertAppError,
  createMemoryFetch,
  createTransport,
  jsonHeaders as headers,
  memoryUrl as url,
} from "../apps-fixtures.js";

describe("apps/api/app", () => {
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

  describe("2. Forme d'erreur unique", () => {
    it("2.1 répond Invalid input (400) pour une entrée ou un JSON invalide", async () => {
      const fetch = createMemoryFetch();
      const invalid = await fetch(`${url}/todos`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title: 123 }),
      });
      assert.equal(invalid.status, 400);

      assertAppError(await invalid.json(), "Invalid input", 400);
      const invalidJson = await fetch(`${url}/todos`, {
        method: "POST",
        headers,
        body: "{",
      });
      assert.equal(invalidJson.status, 400);

      assertAppError(await invalidJson.json(), "Invalid input", 400);
    });

    it("2.2 répond 404 avec l'erreur métier de la tâche, du projet ou de la route introuvable", async () => {
      const fetch = createMemoryFetch();
      const missingTodo = await fetch(`${url}/todos/missing`, { method: "DELETE" });
      assert.equal(missingTodo.status, 404);

      assertAppError(await missingTodo.json(), "Todo not found", 404);
      const missingProject = await fetch(`${url}/projects/missing`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ name: "Absent" }),
      });
      assert.equal(missingProject.status, 404);

      assertAppError(await missingProject.json(), "Project not found", 404);
      const unknownRoute = await fetch(`${url}/unknown`);
      assert.equal(unknownRoute.status, 404);

      assertAppError(await unknownRoute.json(), "Route not found", 404);
    });

    it("2.3 répond Project archived (409) pour une affectation à un projet archivé", async () => {
      const fetch = createMemoryFetch();
      const project = await (
        await fetch(`${url}/projects`, {
          method: "POST",
          headers,
          body: JSON.stringify({ name: "Ancien" }),
        })
      ).json();
      await fetch(`${url}/projects/${project.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ archived: true }),
      });
      const created = await fetch(`${url}/todos`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title: "Tâche", projectId: project.id }),
      });
      assert.equal(created.status, 409);

      assertAppError(await created.json(), "Project archived", 409);
    });

    it("2.4 répond Internal error (500) pour une erreur inconnue, sans la divulguer", async () => {
      const logged = vi.spyOn(console, "error").mockImplementation(() => {});
      const failing = {
        todo: {
          list: async () => {
            throw new Error("secret interne");
          },
        },
        project: {},
      } as unknown as Repository;
      const fetch = createTransport(createApp(createDependencies({ repository: failing })));
      const response = await fetch(`${url}/todos`);
      assert.equal(response.status, 500);

      const body = await response.json();
      assertAppError(body, "Internal error", 500);
      assert.doesNotMatch(JSON.stringify(body), /secret interne/);
      assert.equal(logged.mock.calls.length, 1);
    });
  });

  describe("3. Catalogue", () => {
    it("3.1 l'API renvoie le message et le statut du catalogue", async () => {
      const fetch = createMemoryFetch();
      const response = await fetch(`${url}/todos/missing`, { method: "DELETE" });
      const body = await response.json();

      assert.equal(response.status, appErrors.todoNotFound.status);
      assert.equal(body.message, appErrors.todoNotFound.message);
    });
  });
});
