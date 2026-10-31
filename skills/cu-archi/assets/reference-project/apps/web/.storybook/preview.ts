import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Common",
          ["Inputs", "Buttons", "Containers", "Overlays"],
          "Business",
          ["Todo", "Project"],
        ],
      },
    },
  },
};

export default preview;
