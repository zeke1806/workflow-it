import type { Meta, StoryObj } from "@storybook/react-vite";
import { TodoListPage } from "./todo-list-page";
import { storyProjects, storyTodoActions, storyTodoState } from "./todo-story-fixtures";

const meta = {
  title: "Business/Todo/Listing",
  component: TodoListPage,
  args: { state: storyTodoState, actions: storyTodoActions },
} satisfies Meta<typeof TodoListPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Populated: Story = {
  args: {
    state: {
      ...storyTodoState,
      todos: [
        { id: "1", title: "Première tâche", completed: false, projectId: null },
        { id: "2", title: "Tâche terminée", completed: true, projectId: null },
      ],
    },
  },
};

export const Loading: Story = { args: { state: { ...storyTodoState, loading: true } } };

export const Error: Story = {
  args: { state: { ...storyTodoState, error: "Une erreur est survenue." } },
};

export const WithProjects: Story = {
  args: {
    state: {
      ...storyTodoState,
      projects: storyProjects,
      todos: [
        { id: "one", title: "Rempoter le citronnier", completed: false, projectId: "home" },
        {
          id: "two",
          title: "Retrouver le carnet de voyage",
          completed: true,
          projectId: "holidays",
        },
      ],
    },
  },
};

export const ArchivedProjectFilter: Story = {
  args: {
    state: {
      ...storyTodoState,
      projects: storyProjects,
      projectFilter: "holidays",
      todos: [
        {
          id: "two",
          title: "Retrouver le carnet de voyage",
          completed: true,
          projectId: "holidays",
        },
      ],
    },
  },
};
