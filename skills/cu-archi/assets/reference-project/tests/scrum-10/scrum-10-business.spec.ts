import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { createTodoService } from "../../apps/web/src/services/todo/todo-service/index";
import { createConnection } from "../todo/todo-fixtures";

// Même définition de service, contextes et ports d’état indépendants.
describe("SCRUM-10 : Séparer les dépendances et le contexte de connexion", () => {
  describe("web", () => {
    describe("1. Dépendances séparées", () => {
      it("1.1 prépare deux tâches à modifier indépendamment et bloque l’enregistrement avant leur chargement", async () => {
        let writes = 0;
        let reads = 0;
        const todos = [
          { id: "first", title: "Première tâche", completed: false, projectId: null },
          { id: "second", title: "Deuxième tâche", completed: false, projectId: null },
        ];
        const service = createTodoService(
          {
            list: async () => {
              reads++;

              return todos;
            },
            create: async () => {
              writes++;
              throw new Error("Écriture inattendue");
            },
            update: async () => {
              writes++;
              throw new Error("Écriture inattendue");
            },
            delete: async () => {},
          },
          {
            listOptions: async () => {
              return [];
            },
          },
        );
        const first = createConnection(service, { initialId: "first" });
        const second = createConnection(service, { initialId: "second" });
        const creating = createConnection(service, {});
        assert.equal(first.state().form.id, "first");
        assert.equal(second.state().form.id, "second");
        assert.equal(first.state().formReady, false);
        assert.equal(creating.state().form.id, null);
        assert.equal(creating.state().formReady, true);
        assert.equal(reads, 0);

        first.actions.changeTitle("Saisie prématurée");
        await first.actions.submit();
        assert.equal(writes, 0);

        await Promise.all([first.actions.initializeForm(), second.actions.initializeForm()]);
        assert.equal(reads, 2);
        assert.equal(first.state().form.title, "Première tâche");
        assert.equal(second.state().form.title, "Deuxième tâche");

        first.actions.changeTitle("Brouillon isolé");
        assert.equal(second.state().form.title, "Deuxième tâche");
        assert.equal(creating.state().form.title, "");
      });
    });
  });
});
