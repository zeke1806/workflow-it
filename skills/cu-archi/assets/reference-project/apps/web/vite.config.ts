import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tanstackStart(), react()],

  server: {
    port: 3000,
    strictPort: true,

    proxy: {
      "/api": {
        target: "http://localhost:3001",

        rewrite: (path) => {
          return path.replace(/^\/api/, "");
        },
      },
    },
  },
});
