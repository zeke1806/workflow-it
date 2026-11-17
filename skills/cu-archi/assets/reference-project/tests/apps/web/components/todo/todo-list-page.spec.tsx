import assert from "node:assert/strict";
import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import { describe, it } from "vitest";
import * as listStories from "../../../../../apps/web/src/components/todo/todo-list-page.stories";
import * as deleteScenarioStories from "../../../../../apps/web/src/components/todo/delete-todo-scenario.stories";

const { List, Confirmation, ListAfterDeletion } = composeStories(deleteScenarioStories);
const { Empty, Populated, Loading, Error: ErrorStory } = composeStories(listStories);

describe("apps/web/components/todo/todo-list-page", () => {
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
});
