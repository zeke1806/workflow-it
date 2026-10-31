// Vérification automatique imposée par le plugin dans les projets cible.
//   edit   : après Edit/Write, lint + contrôle d'architecture (rapide).
//   commit : avant `git commit`, vérifications complètes ; bloque si échec.
// Sortie code 2 + stderr : le message revient à l'IA.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { adoptsPlugin, projectRoot, readInput, readPackage } from "./project.mjs";

const mode = process.argv[2];
const input = readInput();
const root = projectRoot(input);

if (!adoptsPlugin(root)) process.exit(0);

if (mode === "commit" && !/\bgit\s+commit\b/.test(input.tool_input?.command ?? "")) process.exit(0);

const pkg = readPackage(root);
if (!pkg) process.exit(0);
const scripts = pkg.scripts ?? {};
const pm = existsSync(join(root, "pnpm-lock.yaml")) || existsSync(join(root, "pnpm-workspace.yaml")) ? "pnpm" : "npm";

const steps =
  mode === "edit"
    ? ["lint", "check:architecture"]
    : ["check", "lint", "format:check", "test", "build", "build-storybook"];

if (mode === "commit" && !scripts.lint) {
  console.error("Vérification absente : mettre en place lint, Prettier et Husky (voir cu-archi, Contrôle automatique) avant de committer.");
  process.exit(2);
}

// `check` du projet de référence inclut déjà lint et check:architecture.
const skipped = mode === "commit" && scripts.check ? new Set(["lint"]) : new Set();

for (const step of steps) {
  if (!scripts[step] || skipped.has(step)) continue;
  const run = spawnSync(pm, ["run", step], { cwd: root, encoding: "utf8" });
  if (run.status !== 0) {
    const output = `${run.stdout}${run.stderr}`.trim().split("\n").slice(-40).join("\n");
    console.error(`Échec de \`${pm} run ${step}\` :\n${output}`);
    process.exit(2);
  }
}
