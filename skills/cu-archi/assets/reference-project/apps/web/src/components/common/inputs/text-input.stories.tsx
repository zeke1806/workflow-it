import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextInput } from "./text-input";

const meta = {
  title: "Common/Inputs/Text input",
  component: TextInput,
  args: { label: "Titre", placeholder: "Saisissez un titre" },
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };
