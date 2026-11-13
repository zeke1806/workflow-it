import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { core } from "@cu-archi/core";
import { createFetchApiService } from "../../../../../../apps/web/src/services/adapters/api/fetch-api-service.js";
import { assertAppError, createMemoryFetch, memoryUrl as url } from "../../../../apps-fixtures.js";

describe("apps/web/services/adapters/api/fetch-api-service", () => {
  describe("1. Requêtes HTTP", () => {
    it("1.1 traduit les opérations Todo en requêtes HTTP et valide leurs réponses", async () => {
      const todo = { id: "one", title: "Hello", completed: false, projectId: null };
      const updated = { ...todo, completed: true };
      const requests: { url: string; options?: RequestInit }[] = [];
      const responses = [
        Response.json([todo]),
        Response.json(todo),
        Response.json(updated),
        new Response(null, { status: 204 }),
      ];

      const fetchClient: typeof fetch = async (input, options) => {
        requests.push({ url: String(input), options });
        const response = responses.shift();
        assert.ok(response);

        return response;
      };

      const api = createFetchApiService({ baseUrl: "/api/", fetchClient });
      assert.deepEqual(await api.todo.list({ search: "A & B" }), [todo]);
      assert.deepEqual(await api.todo.create({ title: "Hello" }), todo);
      assert.deepEqual(await api.todo.update("one", { completed: true }), updated);

      await api.todo.delete("a/b");
      assert.deepEqual(
        requests.map((request) => [request.url, request.options?.method]),
        [
          ["/api/todos?search=A+%26+B", "GET"],
          ["/api/todos", "POST"],
          ["/api/todos/one", "PATCH"],
          ["/api/todos/a%2Fb", "DELETE"],
        ],
      );
      assert.equal(requests[1]?.options?.body, JSON.stringify({ title: "Hello", projectId: null }));

      assert.equal(
        Object.isFrozen(
          await createFetchApiService({
            fetchClient: async () => {
              return Response.json(todo);
            },
          }).todo.create({
            title: "Hello",
          }),
        ),
        true,
      );
    });

    it("1.2 rejette les erreurs HTTP et les données Todo malformées", async () => {
      const unavailable = createFetchApiService({
        fetchClient: async () => {
          return new Response(null, { status: 503 });
        },
      });

      await assert.rejects(
        unavailable.todo.list(),
        (error: unknown) => core.errorsService.isAppError(error) && error.status === 503,
      );

      const malformed = createFetchApiService({
        fetchClient: async () => {
          return Response.json({ id: "one", title: "Hello", completed: "false" });
        },
      });

      await assert.rejects(malformed.todo.create({ title: "Hello" }));
    });
  });

  describe("2. Forme d'erreur unique", () => {
    it("2.1 le client API front rejette avec une AppError reconstruite depuis la réponse", async () => {
      const api = createFetchApiService({ baseUrl: url, fetchClient: createMemoryFetch() });
      await assert.rejects(api.todo.delete("missing"), (error: unknown) => {
        assertAppError(error, "Todo not found", 404);

        return true;
      });
    });

    it("2.2 le client API front complète le statut absent depuis la réponse HTTP", async () => {
      const api = createFetchApiService({
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

    it("2.3 le client API front traduit une réponse illisible en Internal error avec son statut", async () => {
      const api = createFetchApiService({
        fetchClient: async () => {
          return new Response(null, { status: 503 });
        },
      });
      await assert.rejects(api.todo.list(), (error: unknown) => {
        assertAppError(error, "Internal error", 503);

        return true;
      });
    });
  });
});
