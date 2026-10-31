// Contexte commun aux hooks : racine du projet cible et adoption du plugin.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const readInput = () => JSON.parse(readFileSync(0, "utf8") || "{}");

export const projectRoot = (input) => process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

// Un projet adopte le plugin quand son CLAUDE.md le nomme.
export const adoptsPlugin = (root) => {
  const path = join(root, "CLAUDE.md");
  return existsSync(path) && readFileSync(path, "utf8").includes("workflow-it-plugin");
};

export const readPackage = (root) => {
  const path = join(root, "package.json");
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
};

export const hasFile = (root, matches) => existsSync(root) && readdirSync(root).some(matches);
