import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";
import { appErrors, createAppError, type AppError } from "@cu-archi/core";
import { createApp } from "../../apps/api/src/app.js";
import { createDependencies } from "../../apps/api/src/services/di.js";
import {
  createSQLiteRepositoryService,
  migrateSQLiteDatabase,
} from "../../apps/api/src/services/adapters/repository/sqlite-repository-service.js";
import { createCryptoIdService } from "../../apps/api/src/services/adapters/id/crypto-id-service.js";
import type { Repository } from "../../apps/api/src/services/adapters/repository/repository-types.js";
import { createApiService } from "../../apps/web/src/services/adapters/api/api-service.js";
import { createFixture as createTodoFixture } from "../scrum-2610311425/scrum-2610311425-fixtures.js";
import { connectProject } from "../scrum-2610311426/scrum-2610311426-fixtures.js";
import {
  createMemoryFetch,
  createTransport,
  jsonHeaders as json,
  memoryUrl as url,
} from "../scrum-2610311427/scrum-2610311427-fixtures.js";
import {
  MemorySQLite,
  createSequentialIdService,
} from "../scrum-2610311429/scrum-2610311429-fixtures.js";

describe("SCRUM-2610241926 : Aligner l'exemple ToDo sur CU Archi", () => {
  describe("core", () => {
    describe("1. Forme d'erreur unique", () => {
      it("1.1 crée une AppError depuis une erreur du catalogue, avec son message et son statut", () => {
        assert.deepEqual(createAppError(appErrors.projectArchived, "id: p1"), {
          message: "Project archived",
          description: "id: p1",
          status: 409,
        });
      });
    });
  });

  describe("api", () => {
    describe("1. Forme d'erreur unique", () => {
      it("1.1 répond Invalid input (400) pour une entrée ou un JSON invalide", async () => {
        const fetch = createMemoryFetch();
        const invalid = await fetch(`${url}/todos`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({ title: 123 }),
        });
        assert.equal(invalid.status, 400);

        assertAppError(await invalid.json(), "Invalid input", 400);
        const invalidJson = await fetch(`${url}/todos`, {
          method: "POST",
          headers: json,
          body: "{",
        });
        assert.equal(invalidJson.status, 400);

        assertAppError(await invalidJson.json(), "Invalid input", 400);
      });

      it("1.2 répond 404 avec l'erreur métier de la tâche, du projet ou de la route introuvable", async () => {
        const fetch = createMemoryFetch();
        const missingTodo = await fetch(`${url}/todos/missing`, { method: "DELETE" });
        assert.equal(missingTodo.status, 404);

        assertAppError(await missingTodo.json(), "Todo not found", 404);
        const missingProject = await fetch(`${url}/projects/missing`, {
          method: "PATCH",
          headers: json,
          body: JSON.stringify({ name: "Absent" }),
        });
        assert.equal(missingProject.status, 404);

        assertAppError(await missingProject.json(), "Project not found", 404);
        const unknownRoute = await fetch(`${url}/unknown`);
        assert.equal(unknownRoute.status, 404);

        assertAppError(await unknownRoute.json(), "Route not found", 404);
      });

      it("1.3 répond Project archived (409) pour une affectation à un projet archivé", async () => {
        const fetch = createMemoryFetch();
        const project = await (
          await fetch(`${url}/projects`, {
            method: "POST",
            headers: json,
            body: JSON.stringify({ name: "Ancien" }),
          })
        ).json();
        await fetch(`${url}/projects/${project.id}`, {
          method: "PATCH",
          headers: json,
          body: JSON.stringify({ archived: true }),
        });
        const created = await fetch(`${url}/todos`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({ title: "Tâche", projectId: project.id }),
        });
        assert.equal(created.status, 409);

        assertAppError(await created.json(), "Project archived", 409);
      });

      it("1.4 répond Internal error (500) pour une erreur inconnue, sans la divulguer", async () => {
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

    describe("2. Adapter id", () => {
      it("2.1 génère les identifiants des tâches et des projets via l'adapter id injecté", async () => {
        const database = new MemorySQLite();
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

      it("2.2 l'adapter crypto crée des UUID distincts", () => {
        const id = createCryptoIdService();

        const first = id.create();
        const second = id.create();

        assert.match(
          first,
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        );
        assert.notEqual(first, second);
        assert.equal(Object.isFrozen(id), true);
      });
    });
  });

  describe("web", () => {
    describe("1. Forme d'erreur unique", () => {
      it("1.1 le client API front rejette avec une AppError reconstruite depuis la réponse", async () => {
        const api = createApiService({ baseUrl: url, fetchClient: createMemoryFetch() });
        await assert.rejects(api.todo.delete("missing"), (error: unknown) => {
          assertAppError(error, "Todo not found", 404);

          return true;
        });
      });

      it("1.2 le client API front complète le statut absent depuis la réponse HTTP", async () => {
        const api = createApiService({
          fetchClient: async () => {
            return Response.json(
              { message: "Project archived", description: "Sans statut" },
              { status: 409 },
            );
          },
        });
        await assert.rejects(api.todo.list(), (error: unknown) => {
          assert.deepEqual(error, {
            message: "Project archived",
            description: "Sans statut",
            status: 409,
          });

          return true;
        });
      });

      it("1.3 le client API front traduit une réponse illisible en Internal error avec son statut", async () => {
        const api = createApiService({
          fetchClient: async () => {
            return new Response(null, { status: 503 });
          },
        });
        await assert.rejects(api.todo.list(), (error: unknown) => {
          assertAppError(error, "Internal error", 503);

          return true;
        });
      });

      it("1.4 chaque service front choisit son texte d'après le message de l'AppError", async () => {
        const todo = createTodoFixture(
          {
            list: async () => {
              return [{ id: "t1", title: "Ranger", completed: false, projectId: null }];
            },

            update: async () => {
              throw createAppError(appErrors.projectArchived, "id: p1");
            },

            delete: async () => {
              throw createAppError(appErrors.todoNotFound, "id: t1");
            },
          },
          {},
          "t1",
        );
        await todo.actions.initializeForm();
        todo.actions.changeProject("p1");
        await todo.actions.submit();
        assert.equal(todo.state().error, "Ce projet est archivé : p1. Choisissez un projet actif.");

        todo.actions.requestRemove("t1");
        await todo.actions.confirmRemove();
        assert.equal(todo.state().error, "Cette tâche n’existe pas.");

        const failingTodo = createTodoFixture({
          list: async () => {
            throw createAppError(appErrors.internal, "boom");
          },
        });
        await failingTodo.actions.load();
        assert.equal(failingTodo.state().error, "Une erreur est survenue.");

        const project = connectProject({
          list: async () => {
            return [{ id: "home", name: "Maison", archived: false }];
          },

          update: async () => {
            throw createAppError(appErrors.projectNotFound, "id: home");
          },
        });
        await project.actions.load();
        await project.actions.archive("home");
        assert.equal(project.state().error, "Ce projet n’existe pas : home");

        const failingProject = connectProject({
          list: async () => {
            throw "inconnu";
          },
        });
        await failingProject.actions.load();
        assert.equal(failingProject.state().error, "Une erreur est survenue. Réessayez.");
      });
    });
  });
});

function assertAppError(value: unknown, message: AppError["message"], status: number) {
  assert.ok(typeof value === "object" && value !== null);

  const error = value as AppError;
  assert.equal(error.message, message);
  assert.equal(error.status, status);
  assert.equal(typeof error.description, "string");
  assert.deepEqual(Object.keys(error).sort(), ["description", "message", "status"]);
}
