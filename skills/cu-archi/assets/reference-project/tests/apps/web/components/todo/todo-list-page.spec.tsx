import assert from "node:assert/strict";
import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import { describe, it } from "vitest";
import * as listStories from "../../../../../apps/web/src/components/todo/todo-list-page.stories";

const {
  Empty,
  Populated,
  DeleteConfirmation,
  Loading,
  Error: ErrorStory,
} = composeStories(listStories);

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

    it("1.5 demande confirmation pour la tâche à supprimer", () => {
      render(<DeleteConfirmation />);
      assert.ok(screen.getByRole("dialog", { name: "Supprimer la tâche ?" }));
    });
  });
});
