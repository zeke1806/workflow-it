import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Storybook renders components without loading the Start server plugin.
export default defineConfig({ plugins: [react()] });
