import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  createTodoInputSchema,
  updateTodoInputSchema,
  todoSchema,
  todoTitleSchema,
  type Todo,
} from "@cu-archi/core";
import { createDependencies } from "../../apps/web/src/services/di";
import type { Api } from "../../apps/web/src/services/adapters/api/api-types";
import { createConnection, createFixture } from "./todo-fixtures";

describe("Todo", () => {
  describe("core", () => {
    describe("1. Contrats partagés", () => {
      it("1.1 refuse les types de champ invalides et conserve les mises à jour partielles", () => {
        assert.equal(createTodoInputSchema.safeParse({ title: 123 }).success, false);
        assert.equal(
          createTodoInputSchema.safeParse({ title: "Draft", completed: "false" }).success,
          false,
        );
        assert.deepEqual(createTodoInputSchema.parse({ title: "Draft" }), {
          title: "Draft",
          projectId: null,
        });
        assert.deepEqual(updateTodoInputSchema.parse({ completed: false }), { completed: false });
      });

      it("1.2 valide une Todo sans modifier l'entrée et retourne une valeur readonly", () => {
        const input = { id: "one", title: "Shared", completed: false, projectId: null };
        const todo = todoSchema.parse(input);
        input.title = "External change";
        assert.equal(todo.title, "Shared");
        assert.equal(Object.isFrozen(todo), true);
      });

      it("1.3 applique le même titre non vide et normalisé à l'entité et aux écritures", () => {
        for (const title of ["", "   ", "\t\n"]) {
          assert.equal(todoTitleSchema.safeParse(title).success, false);
          assert.equal(createTodoInputSchema.safeParse({ title }).success, false);
          assert.equal(updateTodoInputSchema.safeParse({ title }).success, false);
          assert.equal(todoSchema.safeParse({ id: "one", title, completed: false }).success, false);
        }

        assert.equal(todoTitleSchema.parse("  Shared title  "), "Shared title");
        assert.equal(createTodoInputSchema.parse({ title: "  Created  " }).title, "Created");
        assert.equal(updateTodoInputSchema.parse({ title: "  Edited  " }).title, "Edited");
        assert.deepEqual(updateTodoInputSchema.parse({ completed: true }), { completed: true });
      });
    });
  });

  describe("web", () => {
    describe("1. Formulaire et écritures", () => {
      it("1.1 gère le formulaire, la création, la modification, la complétion et la suppression via l'API", async () => {
        let rows: readonly Todo[] = [];

        const fixture = createFixture({
          list: async () => {
            return rows;
          },

          create: async (input) => {
            const todo = { id: "one", title: input.title, completed: false, projectId: null };
            rows = [todo];

            return todo;
          },

          update: async (id, input) => {
            const todo = { ...rows[0]!, ...input, id };
            rows = [todo];

            return todo;
          },

          delete: async () => {
            rows = [];
          },
        });

        const initialState = fixture.state();
        fixture.actions.changeTitle("  First  ");
        await fixture.actions.submit();
        assert.equal(fixture.state().todos[0]?.title, "First");
        assert.equal(fixture.state().form.title, "");

        await fixture.actions.openTodo("one");
        fixture.actions.changeTitle("Updated");
        await fixture.actions.submit();
        await fixture.actions.toggle("one");
        assert.equal(fixture.state().todos[0]?.completed, true);
        assert.equal(fixture.state().todos[0]?.title, "Updated");

        fixture.actions.requestRemove("one");
        await fixture.actions.confirmRemove();
        assert.deepEqual(fixture.state().todos, []);
        assert.deepEqual(initialState.form, { id: null, title: "", projectId: null });
        assert.deepEqual(initialState.todos, []);
      });

      it("1.2 conserve la saisie après échec et empêche les titres vides et les doubles soumissions", async () => {
        let calls = 0;

        let rejectCreate: (error: Error) => void = () => {};

        const fixture = createFixture({
          create: () => {
            calls++;

            return new Promise((_resolve, reject) => {
              rejectCreate = reject;
            });
          },
        });

        await fixture.actions.submit();
        assert.equal(calls, 0);

        fixture.actions.changeTitle("Draft");
        const pending = fixture.actions.submit();
        await fixture.actions.submit();
        assert.equal(calls, 1);

        rejectCreate(new Error("Offline"));
        await pending;
        assert.equal(fixture.state().form.title, "Draft");
        assert.equal(fixture.state().saving, false);
        assert.equal(fixture.state().error, "Offline");
      });

      it("1.3 exige une confirmation de suppression et garde la modale après échec", async () => {
        let calls = 0;

        const fixture = createFixture({
          delete: async () => {
            calls++;
            throw new Error("Offline");
          },
        });

        fixture.actions.requestRemove("one");
        assert.equal(calls, 0);

        fixture.actions.cancelRemove();
        await fixture.actions.confirmRemove();
        assert.equal(calls, 0);

        fixture.actions.requestRemove("one");
        await fixture.actions.confirmRemove();
        assert.equal(calls, 1);
        assert.equal(fixture.state().deletingId, "one");
        assert.deepEqual(fixture.state().busyIds, []);
        assert.equal(fixture.state().error, "Offline");
      });

      it("1.4 utilise les bindings de navigation et charge une tâche existante depuis son identifiant d'URL", async () => {
        const paths: string[] = [];
        const todo = { id: "a/b", title: "Existing", completed: false, projectId: null };

        const fixture = createFixture(
          {
            list: async () => {
              return [todo];
            },
          },
          {
            openCreate: () => {
              paths.push("create");
            },

            openEdit: (id) => {
              paths.push(`edit:${id}`);
            },

            returnToList: () => {
              paths.push("list");
            },
          },
        );

        fixture.actions.newTodo();
        fixture.actions.edit(todo.id);
        assert.deepEqual(paths, ["create", "edit:a/b"]);

        await fixture.actions.openTodo(todo.id);
        assert.deepEqual(fixture.state().form, { id: todo.id, title: "Existing", projectId: null });
        assert.equal(fixture.state().formReady, true);

        fixture.actions.cancel();
        assert.equal(paths.at(-1), "list");
      });

      it("1.5 bloque l'enregistrement d'une tâche absente", async () => {
        let updates = 0;

        const fixture = createFixture({
          list: async () => {
            return [];
          },

          update: async () => {
            updates++;
            throw new Error("Unexpected write");
          },
        });

        await fixture.actions.openTodo("missing");
        assert.equal(fixture.state().formReady, false);
        assert.equal(fixture.state().error, "Cette tâche n’existe pas.");

        fixture.actions.changeTitle("Attempt");
        await fixture.actions.submit();
        assert.equal(updates, 0);
      });

      it("1.6 bloque la soumission avant le chargement de la tâche à modifier", async () => {
        let writes = 0;

        const fixture = createFixture(
          {
            create: async () => {
              writes++;
              throw new Error("Unexpected creation");
            },

            update: async () => {
              writes++;
              throw new Error("Unexpected update");
            },
          },
          {},
          "existing-id",
        );

        fixture.actions.changeTitle("Premature edit");
        await fixture.actions.submit();
        assert.equal(writes, 0);
        assert.equal(fixture.state().form.id, "existing-id");
        assert.equal(fixture.state().loading, true);
        assert.equal(fixture.state().formReady, false);
      });

      it("1.7 laisse un brouillon vide modifiable et valide le titre à la soumission, en création comme en modification", async () => {
        const writes: string[] = [];

        const fixture = createFixture({
          create: async (input) => {
            writes.push(input.title);

            return { id: "one", title: input.title, completed: false, projectId: null };
          },

          list: async () => {
            return [{ id: "one", title: "Created title", completed: false, projectId: null }];
          },

          update: async (id, input) => {
            writes.push(input.title!);

            return { id, title: input.title!, completed: false, projectId: null };
          },
        });

        for (const title of ["", "   ", "\t\n"]) {
          fixture.actions.changeTitle(title);
          assert.equal(fixture.state().form.title, title);

          await fixture.actions.submit();
          assert.deepEqual(writes, []);
          assert.equal(fixture.state().error, "Saisissez un titre.");
          assert.equal(fixture.state().saving, false);
        }

        fixture.actions.changeTitle("  Created title  ");
        await fixture.actions.submit();
        assert.deepEqual(writes, ["Created title"]);

        await fixture.actions.openTodo("one");
        fixture.actions.changeTitle("   ");
        await fixture.actions.submit();
        assert.deepEqual(writes, ["Created title"]);
        assert.equal(fixture.state().form.id, "one");

        fixture.actions.changeTitle("  Edited title  ");
        await fixture.actions.submit();
        assert.deepEqual(writes, ["Created title", "Edited title"]);
      });

      it("1.8 initialise le formulaire depuis les bindings de sa connexion", async () => {
        const todo = {
          id: "configured",
          title: "Configured task",
          completed: false,
          projectId: null,
        };
        let reads = 0;
        const api = {
          list: async () => {
            reads++;

            return [todo];
          },
        };
        const editing = createFixture(api, {}, todo.id);
        await editing.actions.initializeForm();
        assert.equal(editing.state().form.id, todo.id);
        assert.equal(editing.state().form.title, todo.title);
        assert.equal(editing.state().formReady, true);

        const creating = createFixture(api);
        await creating.actions.initializeForm();
        assert.equal(creating.state().form.id, null);
        assert.equal(creating.state().formReady, true);
        assert.equal(reads, 1);
      });
    });

    describe("2. Chargements et connexions", () => {
      it("2.1 ignore les réponses de liste obsolètes et les chargements annulés", async () => {
        const requests: ((todos: readonly Todo[]) => void)[] = [];

        const fixture = createFixture({
          list: () => {
            return new Promise((resolve) => requests.push(resolve));
          },
        });

        const first = fixture.actions.load();
        fixture.actions.changeSearch("Latest");
        const second = fixture.actions.load();
        const latest = { id: "two", title: "Latest", completed: false, projectId: null };
        requests[1]!([latest]);
        await second;
        requests[0]!([]);
        await first;
        assert.deepEqual(fixture.state().todos, [latest]);

        const cancelled = fixture.actions.load();
        fixture.actions.cancelLoad();
        requests[2]!([]);
        await cancelled;
        assert.deepEqual(fixture.state().todos, [latest]);
      });

      it("2.2 isole état, navigation et annulation de chargement entre connexions au même service", async () => {
        const requests: ((todos: readonly Todo[]) => void)[] = [];
        const firstPaths: string[] = [];
        const secondPaths: string[] = [];

        const api: Api = {
          project: {
            list: async () => {
              return [];
            },
            create: async () => {
              throw new Error("Not configured");
            },
            update: async () => {
              throw new Error("Not configured");
            },
          },
          todo: {
            list: () => {
              return new Promise((resolve) => requests.push(resolve));
            },

            create: async (input) => {
              return { id: "one", title: input.title, completed: false, projectId: null };
            },

            update: async (id) => {
              return { id, title: "Updated", completed: false, projectId: null };
            },

            delete: async () => {},
          },
        };
        const dependencies = createDependencies({ api });

        const todoService = dependencies.todo;

        const first = createConnection(todoService, {
          openCreate: () => {
            firstPaths.push("create");
          },
        });

        const second = createConnection(todoService, {
          openEdit: (id) => {
            secondPaths.push(`edit:${id}`);
          },
        });

        assert.notEqual(first.state(), second.state());
        assert.notEqual(first.state().form, second.state().form);

        first.actions.changeTitle("First draft");
        first.actions.newTodo();
        second.actions.edit("two");
        assert.equal(second.state().form.title, "");
        assert.deepEqual(firstPaths, ["create"]);
        assert.deepEqual(secondPaths, ["edit:two"]);

        const firstLoad = first.actions.load();
        const secondLoad = second.actions.load();
        first.actions.cancelLoad();
        requests[0]!([{ id: "one", title: "Cancelled", completed: false, projectId: null }]);
        requests[1]!([{ id: "two", title: "Second", completed: false, projectId: null }]);
        await Promise.all([firstLoad, secondLoad]);
        assert.deepEqual(first.state().todos, []);
        assert.equal(second.state().todos[0]?.id, "two");
      });

      it("2.3 ignore les effets post-enregistrement si la feature est quittée pendant l'enregistrement", async () => {
        let finishCreate: (todo: Todo) => void = () => {};

        let listCalls = 0;
        const paths: string[] = [];

        const fixture = createFixture(
          {
            create: () => {
              return new Promise((resolve) => {
                finishCreate = resolve;
              });
            },

            list: async () => {
              listCalls++;

              return [];
            },
          },
          {
            returnToList: () => {
              paths.push("list");
            },
          },
        );

        fixture.actions.changeTitle("Draft");
        const pending = fixture.actions.submit();
        const lastActiveState = fixture.state();
        fixture.deactivate();
        finishCreate({ id: "one", title: "Draft", completed: false, projectId: null });
        await pending;
        assert.deepEqual(paths, []);
        assert.equal(listCalls, 0);
        assert.equal(fixture.state(), lastActiveState);
      });

      it("2.4 ignore la navigation si la feature est quittée pendant le rafraîchissement post-enregistrement", async () => {
        let finishList: (todos: readonly Todo[]) => void = () => {};

        const paths: string[] = [];

        const fixture = createFixture(
          {
            create: async (input) => {
              return { id: "one", title: input.title, completed: false, projectId: null };
            },

            list: () => {
              return new Promise((resolve) => {
                finishList = resolve;
              });
            },
          },
          {
            returnToList: () => {
              paths.push("list");
            },
          },
        );

        fixture.actions.changeTitle("Draft");
        const pending = fixture.actions.submit();
        await Promise.resolve();
        assert.equal(fixture.state().loading, true);

        const lastActiveState = fixture.state();
        fixture.deactivate();
        finishList([]);
        await pending;
        assert.deepEqual(paths, []);
        assert.equal(fixture.state(), lastActiveState);
      });
    });

    describe("3. Immutabilité et complétion", () => {
      it("3.1 met à jour les champs du formulaire sans muter les états précédents ni copier les branches non concernées", () => {
        const fixture = createFixture({});
        const initial = fixture.state();
        fixture.actions.changeTitle("Draft");
        const titled = fixture.state();
        assert.notEqual(titled, initial);
        assert.notEqual(titled.form, initial.form);
        assert.equal(initial.form.title, "");
        assert.equal(titled.form.title, "Draft");
        assert.equal(titled.todos, initial.todos);
        assert.equal(titled.busyIds, initial.busyIds);

        fixture.actions.changeSearch("Query");
        fixture.actions.requestRemove("one");
        const current = fixture.state();
        assert.equal(initial.search, "");
        assert.equal(titled.search, "");
        assert.equal(titled.deletingId, null);
        assert.equal(current.form, titled.form);
        assert.equal(current.search, "Query");
        assert.equal(current.deletingId, "one");
      });

      it("3.2 laisse inchangés les tableaux busyIds précédents après une mutation asynchrone", async () => {
        let finishDelete: () => void = () => {};

        const fixture = createFixture({
          delete: () => {
            return new Promise<void>((resolve) => {
              finishDelete = resolve;
            });
          },
        });

        fixture.actions.requestRemove("one");
        const before = fixture.state();
        const pending = fixture.actions.confirmRemove();
        const during = fixture.state();
        assert.deepEqual(before.busyIds, []);
        assert.deepEqual(during.busyIds, ["one"]);
        assert.notEqual(during.busyIds, before.busyIds);

        finishDelete();
        await pending;
        assert.deepEqual(during.busyIds, ["one"]);
        assert.equal(before.deletingId, "one");
        assert.deepEqual(fixture.state().busyIds, []);
        assert.equal(fixture.state().deletingId, null);
      });

      it("3.3 toggle met à jour sa seule ligne immédiatement, sans recharger toute la liste", async () => {
        let finishUpdate: (todo: Todo) => void = () => {};
        let listCalls = 0;
        const first = { id: "one", title: "First", completed: false, projectId: null };
        const second = { id: "two", title: "Second", completed: false, projectId: null };

        const fixture = createFixture({
          list: async () => {
            listCalls++;

            return [first, second];
          },

          update: () => {
            return new Promise((resolve) => {
              finishUpdate = resolve;
            });
          },
        });

        await fixture.actions.load();
        const before = fixture.state();
        const pending = fixture.actions.toggle("one");
        assert.equal(fixture.state().todos[0]?.completed, true);
        assert.equal(fixture.state().loading, false);
        assert.equal(fixture.state().todos[1], second);
        assert.equal(before.todos[0]?.completed, false);

        finishUpdate({ id: "one", title: "First", completed: true, projectId: null });
        await pending;
        assert.equal(listCalls, 1);
        assert.equal(fixture.state().todos[0]?.completed, true);
        assert.deepEqual(fixture.state().busyIds, []);
      });

      it("3.4 toggle restaure la ligne précédente si l'enregistrement échoue", async () => {
        let rejectUpdate: (error: Error) => void = () => {};
        const todo = { id: "one", title: "First", completed: false, projectId: null };

        const fixture = createFixture({
          list: async () => {
            return [todo];
          },

          update: () => {
            return new Promise((_resolve, reject) => {
              rejectUpdate = reject;
            });
          },
        });

        await fixture.actions.load();
        const pending = fixture.actions.toggle("one");
        assert.equal(fixture.state().todos[0]?.completed, true);

        rejectUpdate(new Error("Offline"));
        await pending;
        assert.equal(fixture.state().todos[0], todo);
        assert.equal(fixture.state().error, "Offline");
        assert.deepEqual(fixture.state().busyIds, []);
      });
    });
  });
});
