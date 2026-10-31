import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { isAppError } from "@cu-archi/core";
import { createApiService } from "../../apps/web/src/services/adapters/api/api-service";
import { createDependencies } from "../../apps/web/src/services/di";

describe("SCRUM-2610311428 : Appeler l'API depuis le front", () => {
  describe("web", () => {
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

        const api = createApiService({ baseUrl: "/api/", fetchClient });
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
        assert.equal(
          requests[1]?.options?.body,
          JSON.stringify({ title: "Hello", projectId: null }),
        );

        assert.equal(
          Object.isFrozen(
            await createApiService({
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
        const unavailable = createApiService({
          fetchClient: async () => {
            return new Response(null, { status: 503 });
          },
        });

        await assert.rejects(
          unavailable.todo.list(),
          (error: unknown) => isAppError(error) && error.status === 503,
        );

        const malformed = createApiService({
          fetchClient: async () => {
            return Response.json({ id: "one", title: "Hello", completed: "false" });
          },
        });

        await assert.rejects(malformed.todo.create({ title: "Hello" }));
      });
    });

    describe("2. DI front", () => {
      it("2.1 compose l'adapter API injecté dans les services Todo et Project", () => {
        let requests = 0;

        const api = createApiService({
          fetchClient: async () => {
            requests += 1;

            return Response.json([]);
          },
        });
        const dependencies = createDependencies({ api });

        assert.equal(requests, 0);
        assert.deepEqual(Object.keys(dependencies), ["todo", "project"]);
        assert.equal(typeof dependencies.todo.connect, "function");
        assert.equal(typeof dependencies.project.listOptions, "function");
        assert.equal(Object.isFrozen(dependencies.todo), true);
        assert.equal(Object.isFrozen(dependencies), true);
      });
    });
  });
});
