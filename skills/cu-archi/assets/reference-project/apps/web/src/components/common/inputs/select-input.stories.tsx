import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectInput } from "./select-input";

const meta = {
  title: "Common/Inputs/Select input",
  component: SelectInput,
  args: {
    label: "Projet",
    children: (
      <>
        <option>Aucun projet</option>
        <option>Maison</option>
      </>
    ),
  },
} satisfies Meta<typeof SelectInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };
