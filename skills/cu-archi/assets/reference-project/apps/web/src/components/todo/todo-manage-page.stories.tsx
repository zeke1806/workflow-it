import type { Meta, StoryObj } from "@storybook/react-vite";
import { TodoManagePage } from "./todo-manage-page";
import { storyProjects, storyTodoActions, storyTodoState } from "./todo-story-fixtures";

const meta = {
  title: "Business/Todo/Management",
  component: TodoManagePage,
  args: { state: storyTodoState, actions: storyTodoActions },
} satisfies Meta<typeof TodoManagePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Creation: Story = {};

export const Editing: Story = {
  args: {
    state: { ...storyTodoState, form: { id: "1", title: "Première tâche", projectId: null } },
  },
};

export const Saving: Story = {
  args: {
    state: {
      ...storyTodoState,
      saving: true,
      form: { id: null, title: "Nouvelle tâche", projectId: null },
    },
  },
};

export const NotFound: Story = {
  args: {
    state: {
      ...storyTodoState,
      form: { id: "missing", title: "", projectId: null },
      formReady: false,
      loading: false,
      error: "Cette tâche n’existe pas.",
    },
  },
};

export const WithProject: Story = {
  args: {
    state: {
      ...storyTodoState,
      projects: storyProjects,
      form: { id: null, title: "Rempoter le citronnier", projectId: "home" },
    },
  },
};

export const ArchivedProject: Story = {
  args: {
    state: {
      ...storyTodoState,
      projects: storyProjects,
      form: { id: "two", title: "Retrouver le carnet de voyage", projectId: "holidays" },
    },
  },
};

export const LoadingProjects: Story = {
  args: { state: { ...storyTodoState, loading: true, formReady: false } },
};

export const ProjectLoadError: Story = {
  args: {
    state: {
      ...storyTodoState,
      formReady: false,
      error: "Une erreur est survenue.",
    },
  },
};
