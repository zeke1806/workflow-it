import type { Meta, StoryObj } from "@storybook/react-vite";
import { TodoListPage } from "./todo-list-page";
import { storyTodoActions, storyTodoState } from "./todo-story-fixtures";

const keptTodo = { id: "1", title: "Première tâche", completed: false, projectId: null };
const deletedTodo = { id: "2", title: "Tâche à supprimer", completed: false, projectId: null };

const meta = {
  title: "Business/Todo/Scénario suppression",
  component: TodoListPage,
  args: { state: storyTodoState, actions: storyTodoActions },
} satisfies Meta<typeof TodoListPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = {
  name: "1. Liste",
  args: { state: { ...storyTodoState, todos: [keptTodo, deletedTodo] } },
};

export const Confirmation: Story = {
  name: "2. Confirmation",
  args: {
    state: { ...storyTodoState, todos: [keptTodo, deletedTodo], deletingId: deletedTodo.id },
  },
};

export const ListAfterDeletion: Story = {
  name: "3. Liste après suppression",
  args: { state: { ...storyTodoState, todos: [keptTodo] } },
};
