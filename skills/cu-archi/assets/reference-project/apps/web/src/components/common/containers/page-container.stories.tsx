import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageContainer } from "./page-container";

const meta = {
  title: "Common/Containers/Page container",
  component: PageContainer,
  args: { title: "Titre de page", children: "Contenu de la page" },
} satisfies Meta<typeof PageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
