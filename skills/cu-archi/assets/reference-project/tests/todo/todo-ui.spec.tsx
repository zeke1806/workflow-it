import assert from "node:assert/strict";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { composeStories } from "@storybook/react-vite";
import { describe, it } from "vitest";
import * as listStories from "../../apps/web/src/components/todo/todo-list-page.stories";
import * as deleteScenarioStories from "../../apps/web/src/components/todo/delete-todo-scenario.stories";
import {
  TodoListFeatureInMemory,
  createMockApi,
  createTodo,
} from "../../apps/web/src/components/todo/todo-demo-fixtures";

const { List, Confirmation, ListAfterDeletion } = composeStories(deleteScenarioStories);
const { Empty, Populated, Loading, Error: ErrorStory } = composeStories(listStories);

describe("Todo", () => {
  describe("1. Component rejoué par ses stories", () => {
    it("1.1 affiche le message d'accueil quand il n'y a aucune tâche", () => {
      render(<Empty />);
      assert.ok(screen.getByRole("heading", { name: "De la place pour la suite." }));
    });

    it("1.2 affiche chaque tâche avec ses actions", () => {
      render(<Populated />);
      assert.ok(screen.getByRole("checkbox", { name: "Première tâche" }));
      assert.ok(screen.getByRole("button", { name: "Modifier : Première tâche" }));
      assert.ok(screen.getByRole("button", { name: "Supprimer : Tâche terminée" }));
    });

    it("1.3 annonce le chargement sans afficher l'accueil vide", () => {
      render(<Loading />);
      assert.ok(screen.getByRole("status"));
      assert.equal(screen.queryByRole("heading", { name: "De la place pour la suite." }), null);
    });

    it("1.4 annonce l'erreur dans une alerte", () => {
      render(<ErrorStory />);
      assert.equal(screen.getByRole("alert").textContent, "Une erreur est survenue.");
    });
  });

  describe("2. Scénario suppression rejoué par ses stories", () => {
    it("2.1 liste les deux tâches avant la suppression", () => {
      render(<List />);
      assert.ok(screen.getByRole("checkbox", { name: "Tâche à supprimer" }));
      assert.ok(screen.getByRole("checkbox", { name: "Première tâche" }));
      assert.equal(screen.queryByRole("dialog"), null);
    });

    it("2.2 demande confirmation pour la tâche à supprimer", () => {
      render(<Confirmation />);
      assert.ok(screen.getByRole("dialog", { name: "Supprimer la tâche ?" }));
    });

    it("2.3 ne liste plus que la tâche conservée après la suppression", () => {
      render(<ListAfterDeletion />);
      assert.equal(screen.queryByRole("checkbox", { name: "Tâche à supprimer" }), null);
      assert.ok(screen.getByRole("checkbox", { name: "Première tâche" }));
    });
  });

  describe("3. Consultation de la liste", () => {
    it("3.1 affiche mes tâches dès l'ouverture de la liste", async () => {
      renderTodoListFeature(createMockApi([createTodo({ title: "Rempoter le citronnier" })]));
      assert.ok(await screen.findByRole("checkbox", { name: "Rempoter le citronnier" }));
    });
  });

  describe("4. Actions sur la liste", () => {
    it("4.1 coche une tâche et garde le changement", async () => {
      renderTodoListFeature(createMockApi([createTodo()]));
      await userEvent.click(await screen.findByRole("checkbox", { name: "Première tâche" }));
      const checkbox = await screen.findByRole("checkbox", { name: "Première tâche" });
      assert.equal((checkbox as HTMLInputElement).checked, true);
    });

    it("4.2 ouvre l'écran de création depuis Nouvelle tâche", async () => {
      renderTodoListFeature(createMockApi([]));
      await userEvent.click(await screen.findByRole("button", { name: /Nouvelle tâche/ }));
      assert.ok(await screen.findByText("Écran de gestion"));
    });

    it("4.3 supprime une tâche après confirmation", async () => {
      let todos = [createTodo()];

      renderTodoListFeature(
        createMockApi(todos, {
          list: async () => {
            return todos;
          },

          delete: async (id) => {
            todos = todos.filter((todo) => todo.id !== id);
          },
        }),
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
});

/** Rend la feature de liste dans un routeur en mémoire. */
function renderTodoListFeature(api: ReturnType<typeof createMockApi>) {
  return render(<TodoListFeatureInMemory api={api} />);
}
