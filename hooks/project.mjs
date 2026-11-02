// Contexte commun aux hooks : racine du projet cible et adoption du plugin.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const readInput = () => JSON.parse(readFileSync(0, "utf8") || "{}");

export const projectRoot = (input) => process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

// Un projet adopte le plugin quand son CLAUDE.md ou son AGENTS.md le nomme.
export const adoptsPlugin = (root) =>
  ["CLAUDE.md", "AGENTS.md"].some((name) => {
    const path = join(root, name);
    return existsSync(path) && readFileSync(path, "utf8").includes("workflow-it-plugin");
  });

export const readPackage = (root) => {
  const path = join(root, "package.json");
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
};

export const hasFile = (root, matches) => existsSync(root) && readdirSync(root).some(matches);

// Source unique des scripts attendus du projet (préflight et livraison).
export const requiredScripts = ["lint", "format:check", "test", "build", "check:architecture"];

// `check` du projet de référence inclut déjà lint et le contrôle d'architecture.
export const deliverySteps = (scripts) => [
  "check",
  ...(scripts.check ? [] : ["lint", "check:architecture"]),
  "format:check",
  "test",
  "build",
];

// `git commit` en début de commande simple, options globales (-C, -c, --x) admises, hors --dry-run.
const GIT_COMMIT = /^git(?:\s+(?:-[Cc]\s+(?:"[^"]*"|'[^']*'|\S+)|--[\w-]+(?:=\S+)?))*\s+commit(?:\s|$)/;
export const isGitCommit = (command) =>
  command
    .split(/&&|\|\||;|\n/)
    .map((part) => part.trim())
    .some((part) => GIT_COMMIT.test(part) && !/\s--dry-run\b/.test(part));
