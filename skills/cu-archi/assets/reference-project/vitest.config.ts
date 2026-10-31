import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          include: ["tests/**/*-{tdd,business}.spec.ts"],
          setupFiles: ["tests/isolation-setup.ts"],
        },
      },
      {
        // Tests UI : DOM simulé en mémoire, jamais de navigateur réel.
        plugins: [react()],
        resolve: { dedupe: ["react", "react-dom"] },
        test: {
          name: "ui",
          environment: "happy-dom",
          include: ["tests/**/*-ui.spec.tsx"],
          setupFiles: ["tests/isolation-setup.ts", "tests/ui-setup.ts"],
        },
      },
    ],
  },
});
