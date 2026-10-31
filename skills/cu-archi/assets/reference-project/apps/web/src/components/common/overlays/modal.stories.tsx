import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal } from "./modal";

const meta = {
  title: "Common/Overlays/Modal",
  component: Modal,

  args: {
    title: "Titre de la modale",
    children: <button type="button">Action</button>,

    open: true,

    onClose: () => {},
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Closed: Story = { args: { open: false } };
