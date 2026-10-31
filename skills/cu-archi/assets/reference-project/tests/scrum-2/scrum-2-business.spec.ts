import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { createTodoService } from "../../apps/web/src/services/todo/todo-service/index.js";
import { createMemoryApi } from "../api/api-fixtures.js";
import { createConnection } from "../todo/todo-fixtures.js";

describe("SCRUM-2 : Isoler les tests et regrouper les comportements par spec", () => {
  describe("web", () => {
    describe("1. Gérer les tâches de bout en bout", () => {
      it("1.1 crée, modifie, termine et supprime une tâche", async () => {
        const fixture = createFixture();
        fixture.actions.changeTitle("  Préparer une partie  ");
        await fixture.actions.submit();
        const created = fixture.state().todos[0]!;
        assert.equal(created.title, "Préparer une partie");
        assert.equal(created.completed, false);

        await fixture.actions.openTodo(created.id);
        fixture.actions.changeTitle("Analyser une partie");
        await fixture.actions.submit();
        await fixture.actions.toggle(created.id);
        assert.deepEqual(fixture.state().todos, [
          { ...created, title: "Analyser une partie", completed: true, projectId: null },
        ]);
        assert.equal(created.completed, false);

        fixture.actions.requestRemove(created.id);
        await fixture.actions.confirmRemove();
        assert.deepEqual(fixture.state().todos, []);
      });

      it("1.2 conserve les tâches après une saisie invalide et sépare deux installations", async () => {
        const first = createFixture();
        const second = createFixture();
        first.actions.changeTitle("Tâche conservée");
        await first.actions.submit();
        const before = first.state().todos;
        first.actions.changeTitle("   ");
        await first.actions.submit();
        assert.deepEqual(first.state().todos, before);
        assert.ok(first.state().error);

        await second.actions.load();
        assert.deepEqual(second.state().todos, []);
      });
    });
  });
});

function createFixture() {
  const api = createMemoryApi();

  return createConnection(
    createTodoService(api.todo, {
      listOptions: async () => {
        return api.project.list();
      },
    }),
  );
}
