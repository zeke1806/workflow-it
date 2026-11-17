import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageLayout } from "./page-layout";

const meta = {
  title: "Common/Layout/Page layout",
  component: PageLayout,
  args: { title: "Titre de page", children: "Contenu de la page" },
} satisfies Meta<typeof PageLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
