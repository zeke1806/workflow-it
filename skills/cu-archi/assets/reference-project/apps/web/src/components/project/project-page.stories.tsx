import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectPage } from "./project-page";
import { storyProjectActions, storyProjectState, storyProjects } from "./project-story-fixtures";

const meta = {
  title: "Business/Project/Projects",
  component: ProjectPage,
  args: { state: storyProjectState, actions: storyProjectActions },
} satisfies Meta<typeof ProjectPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Populated: Story = {
  args: { state: { ...storyProjectState, projects: storyProjects } },
};

export const Renaming: Story = {
  args: {
    state: { ...storyProjectState, projects: storyProjects, form: { id: "home", name: "Maison" } },
  },
};

export const Loading: Story = { args: { state: { ...storyProjectState, loading: true } } };

export const Error: Story = {
  args: {
    state: {
      ...storyProjectState,
      error: "Une erreur est survenue. Réessayez.",
    },
  },
};

export const Saving: Story = {
  args: { state: { ...storyProjectState, saving: true, form: { id: null, name: "Maison" } } },
};

export const Archiving: Story = {
  args: { state: { ...storyProjectState, projects: storyProjects, busyId: "home" } },
};

export const LongName: Story = {
  args: {
    state: {
      ...storyProjectState,
      projects: [
        {
          id: "long",
          name: "Un projet au nom très long pour préparer toutes les prochaines étapes de notre aménagement",
          archived: false,
        },
      ],
    },
  },
};
