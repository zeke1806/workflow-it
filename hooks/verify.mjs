// Vérification imposée par le plugin à la livraison finale seulement :
// un `git commit` sur une branche `claude/scrum-*`. Les commits du travail
// (worktrees, intégration, TDD des skills Matt Pocock) ne sont pas contrôlés.
// Sortie code 2 + stderr : le message revient à l'IA et le commit est bloqué.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { adoptsPlugin, deliverySteps, isGitCommit, projectRoot, readInput, readPackage } from "./project.mjs";

const input = readInput();
const root = projectRoot(input);

if (!adoptsPlugin(root)) process.exit(0);
if (!isGitCommit(input.tool_input?.command ?? "")) process.exit(0);

const branch = spawnSync("git", ["-C", root, "branch", "--show-current"], { encoding: "utf8" }).stdout.trim();
if (!/^claude\/scrum-/.test(branch)) process.exit(0);

const pkg = readPackage(root);
if (!pkg) process.exit(0);
const scripts = pkg.scripts ?? {};
const has = (name) => existsSync(join(root, name));
const pm = has("bun.lock") || has("bun.lockb") ? "bun" : has("pnpm-lock.yaml") || has("pnpm-workspace.yaml") ? "pnpm" : "npm";

if (!scripts.lint) {
  console.error("Vérification absente : mettre en place lint et Prettier (voir cu-archi, Contrôle automatique) avant de livrer.");
  process.exit(2);
}

// Budget sous le timeout du hook (600 s, hooks.json) : un dépassement doit bloquer le commit, pas le laisser passer.
const deadline = Date.now() + (Number(process.env.VERIFY_BUDGET_MS) || 540_000);

for (const step of deliverySteps(scripts)) {
  if (!scripts[step]) continue;
  const timeout = deadline - Date.now();
  const run = timeout > 0 ? spawnSync(pm, ["run", step], { cwd: root, encoding: "utf8", timeout, maxBuffer: Infinity }) : { error: { code: "ETIMEDOUT" } };
  if (run.error?.code === "ETIMEDOUT") {
    console.error(`Budget de vérification dépassé à \`${pm} run ${step}\` : commit bloqué. Accélérer les vérifications, ne pas contourner.`);
    process.exit(2);
  }
  if (run.status !== 0) {
    const output = `${run.stdout}${run.stderr}`.trim().split("\n").slice(-40).join("\n");
    console.error(`Échec de \`${pm} run ${step}\` :\n${output}`);
    process.exit(2);
  }
}
