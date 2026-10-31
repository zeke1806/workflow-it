import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor } from "storybook/test";
import { slowUser } from "../../../.storybook/demo-setup";
import { createMockApi, createTodo, TodoListPageInMemory } from "./todo-demo-fixtures";

// Liste mutable en mémoire : la suppression de la démo n'atteint aucun serveur.
let todos = [createTodo()];

const api = createMockApi(todos, {
  list: async () => {
    return todos;
  },

  delete: async (id) => {
    todos = todos.filter((todo) => todo.id !== id);
  },
});

const meta = {
  title: "Business/Todo/Démo suppression",
  component: TodoListPageInMemory,
  args: { api },
  beforeEach: () => {
    todos = [createTodo()];
  },
} satisfies Meta<typeof TodoListPageInMemory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Parcours: Story = {
  play: async ({ step }) => {
    const user = slowUser();

    await step("Ouvrir la confirmation", async () => {
      await user.click(await screen.findByRole("button", { name: "Supprimer : Première tâche" }));
    });

    await step("Confirmer la suppression", async () => {
      await user.click(await screen.findByRole("button", { name: "Confirmer la suppression" }));
    });

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "De la place pour la suite." })).toBeTruthy(),
    );
  },
};
