// Vérification imposée par le plugin à la livraison finale seulement :
// un `git commit` sur une branche `claude/scrum-*`. Les commits du travail
// (worktrees, intégration, TDD des skills Matt Pocock) ne sont pas contrôlés.
// Sortie code 2 + stderr : le message revient à l'IA et le commit est bloqué.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { adoptsPlugin, projectRoot, readInput, readPackage } from "./project.mjs";

const input = readInput();
const root = projectRoot(input);

if (!adoptsPlugin(root)) process.exit(0);
if (!/\bgit\s+commit\b/.test(input.tool_input?.command ?? "")) process.exit(0);

const branch = spawnSync("git", ["-C", root, "branch", "--show-current"], { encoding: "utf8" }).stdout.trim();
if (!/^claude\/scrum-/.test(branch)) process.exit(0);

const pkg = readPackage(root);
if (!pkg) process.exit(0);
const scripts = pkg.scripts ?? {};
const pm = existsSync(join(root, "pnpm-lock.yaml")) || existsSync(join(root, "pnpm-workspace.yaml")) ? "pnpm" : "npm";

if (!scripts.lint) {
  console.error("Vérification absente : mettre en place lint et Prettier (voir cu-archi, Contrôle automatique) avant de livrer.");
  process.exit(2);
}

// `check` du projet de référence inclut déjà lint et check:architecture.
const steps = ["check", ...(scripts.check ? [] : ["lint", "check:architecture"]), "format:check", "test", "build", "build-storybook"];

for (const step of steps) {
  if (!scripts[step]) continue;
  const run = spawnSync(pm, ["run", step], { cwd: root, encoding: "utf8" });
  if (run.status !== 0) {
    const output = `${run.stdout}${run.stderr}`.trim().split("\n").slice(-40).join("\n");
    console.error(`Échec de \`${pm} run ${step}\` :\n${output}`);
    process.exit(2);
  }
}
