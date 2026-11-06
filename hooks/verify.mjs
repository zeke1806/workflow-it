// Vérification imposée par le plugin à la livraison finale seulement :
// le `git push` d'une branche `claude/scrum-*`. Les commits du travail
// (worktrees, intégration, TDD des skills Matt Pocock) ne sont jamais poussés, donc pas contrôlés.
// Les vérifications tournent dans le dossier où la branche poussée est extraite.
// Sortie code 2 + stderr : le message revient à l'IA et le push est bloqué.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { adoptsPlugin, checkoutOf, deliveryPushes, deliverySteps, isClean, projectRoot, readInput, readPackage } from "./project.mjs";

const input = readInput();
const root = projectRoot(input);

if (!adoptsPlugin(root)) process.exit(0);

const pushes = deliveryPushes(input.tool_input?.command ?? "", input.cwd || root);
if (pushes.length === 0) process.exit(0);

const refused = pushes.find((push) => push.error);
if (refused) block(refused.error);

// Budget sous le timeout du hook (600 s, hooks.json) : un dépassement doit bloquer le push, pas le laisser passer.
const deadline = Date.now() + (Number(process.env.VERIFY_BUDGET_MS) || 540_000);

for (const branch of new Set(pushes.map((push) => push.branch))) verify(branch);

function verify(branch) {
  const dir = checkoutOf(root, branch);
  if (!dir) block(`\`${branch}\` n'est extraite nulle part : l'extraire (\`git switch ${branch}\`) pour la vérifier, puis pousser.`);
  if (!isClean(dir)) block(`Modifications non commitées dans \`${dir}\` : les commiter dans le commit de livraison ou les retirer, puis pousser.`);

  const scripts = readPackage(dir)?.scripts ?? {};
  if (!scripts.lint) block("Vérification absente : mettre en place lint et Prettier (voir cu-archi, Contrôle automatique) avant de livrer.");

  const pm = packageManager(dir);
  for (const step of deliverySteps(scripts)) {
    if (scripts[step]) run(pm, step, dir);
  }
}

function run(pm, step, dir) {
  const timeout = deadline - Date.now();
  const result = timeout > 0 ? spawnSync(pm, ["run", step], { cwd: dir, encoding: "utf8", timeout, maxBuffer: Infinity }) : { error: { code: "ETIMEDOUT" } };
  if (result.error?.code === "ETIMEDOUT") {
    block(`Budget de vérification dépassé à \`${pm} run ${step}\` : push bloqué. Accélérer les vérifications, ne pas contourner.`);
  }
  if (result.status !== 0) {
    const output = `${result.stdout}${result.stderr}`.trim().split("\n").slice(-40).join("\n");
    block(`Échec de \`${pm} run ${step}\` :\n${output}`);
  }
}

function packageManager(dir) {
  const has = (name) => existsSync(join(dir, name));
  if (has("bun.lock") || has("bun.lockb")) return "bun";
  if (has("pnpm-lock.yaml") || has("pnpm-workspace.yaml")) return "pnpm";
  return "npm";
}

function block(message) {
  console.error(message);
  process.exit(2);
}
