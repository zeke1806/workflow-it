import assert from "node:assert/strict";
import { composeStories } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it } from "vitest";
import {
  TodoListPageInMemory,
  createMockApi,
  createTodo,
} from "../../../../../apps/web/src/components/todo/todo-demo-fixtures";
import * as deleteDemo from "../../../../../apps/web/src/components/todo/delete-todo-demo.stories";

const { Parcours: DeleteParcours } = composeStories(deleteDemo);

describe("apps/web/components/todo/todo-list-page-container", () => {
  describe("1. Consultation de la liste", () => {
    it("1.1 affiche mes tâches dès l'ouverture de la liste", async () => {
      render(
        <TodoListPageInMemory
          api={createMockApi([createTodo({ title: "Rempoter le citronnier" })])}
        />,
      );
      assert.ok(await screen.findByRole("checkbox", { name: "Rempoter le citronnier" }));
    });
  });

  describe("2. Actions sur la liste", () => {
    it("2.1 coche une tâche et garde le changement", async () => {
      render(<TodoListPageInMemory api={createMockApi([createTodo()])} />);
      await userEvent.click(await screen.findByRole("checkbox", { name: "Première tâche" }));
      const checkbox = await screen.findByRole("checkbox", { name: "Première tâche" });
      assert.equal((checkbox as HTMLInputElement).checked, true);
    });

    it("2.2 ouvre l'écran de création depuis Nouvelle tâche", async () => {
      let openedCreate = false;

      render(
        <TodoListPageInMemory
          api={createMockApi([])}
          bindings={{
            openCreate: () => {
              openedCreate = true;
            },
          }}
        />,
      );
      await userEvent.click(await screen.findByRole("button", { name: /Nouvelle tâche/ }));
      assert.equal(openedCreate, true);
    });

    it("2.3 supprime une tâche après confirmation", async () => {
      let todos = [createTodo()];

      render(
        <TodoListPageInMemory
          api={createMockApi(todos, {
            list: async () => {
              return todos;
            },

            delete: async (id) => {
              todos = todos.filter((todo) => todo.id !== id);
            },
          })}
        />,
      );

      await userEvent.click(
        await screen.findByRole("button", { name: "Supprimer : Première tâche" }),
      );
      await userEvent.click(
        await screen.findByRole("button", { name: "Confirmer la suppression" }),
      );
      assert.ok(await screen.findByRole("heading", { name: "De la place pour la suite." }));
    });
  });

  describe("3. Démos rejouées", () => {
    it("3.1 supprime une tâche après confirmation (démo Suppression)", async () => {
      const { container } = render(<DeleteParcours />);
      await DeleteParcours.play?.({ canvasElement: container });
    });
  });
});
