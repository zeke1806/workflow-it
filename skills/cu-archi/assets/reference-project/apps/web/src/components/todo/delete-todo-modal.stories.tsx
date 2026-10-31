import type { Meta, StoryObj } from "@storybook/react-vite";
import { DeleteTodoModal } from "./delete-todo-modal";

const meta = {
  title: "Business/Todo/Delete modal",
  component: DeleteTodoModal,

  args: {
    title: "Première tâche",
    busy: false,
    error: null,
    open: true,

    onCancel: () => {},

    onConfirm: () => {},
  },
} satisfies Meta<typeof DeleteTodoModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Confirmation: Story = {};

export const Deleting: Story = { args: { busy: true } };

export const Error: Story = { args: { error: "Cette tâche n’existe pas." } };
