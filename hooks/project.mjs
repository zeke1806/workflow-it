// Contexte commun aux hooks : racine du projet cible et adoption du plugin.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

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

const DELIVERY_BRANCH = /^claude\/scrum-/;

// Pushes de livraison d'une commande Bash : branches `claude/scrum-*` poussées.
// `git push` en début de commande simple, options globales (-C, -c, --x) admises, hors --dry-run.
// Une branche nommée sans refspec se prend telle quelle ; un push implicite (`git push`, `HEAD`)
// prend la branche courante du dossier de la commande (`cd`, `-C`, sinon `cwd`).
// Retourne `{ branch }` à vérifier, ou `{ error }` pour un push à refuser.
const GIT_PUSH = /^git((?:\s+(?:-[Cc]\s+(?:"[^"]*"|'[^']*'|\S+)|--[\w-]+(?:=\S+)?))*)\s+push(?:\s+(.*))?$/;

export const deliveryPushes = (command, cwd) => {
  let dir = cwd;
  return command
    .split(/&&|\|\||;|\n/)
    .map((part) => part.trim())
    .flatMap((part) => {
      const cd = part.match(/^cd\s+(.+)$/);
      if (cd) {
        dir = resolve(dir, unquote(cd[1]));
        return [];
      }
      const push = part.match(GIT_PUSH);
      if (!push || /\s--dry-run\b/.test(part)) return [];
      const gitDir = push[1].match(/-C\s+("[^"]*"|'[^']*'|\S+)/);
      return pushedBranches(gitDir ? resolve(dir, unquote(gitDir[1])) : dir, push[2] ?? "");
    });
};

const pushedBranches = (dir, args) => {
  const refs = args.split(/\s+/).filter((arg) => arg && !arg.startsWith("-")).slice(1);
  const implicit = refs.length === 0 || refs.includes("HEAD");
  const current = implicit ? currentBranch(dir) : "";
  const named = refs
    .map((ref) => ref.replace(/^\+/, "").split(":"))
    .filter(([source, target = source]) => DELIVERY_BRANCH.test(source) || DELIVERY_BRANCH.test(target))
    .map(([source, target = source]) =>
      source === target ? { branch: source } : { error: `Pousser \`${target}\` par son nom (\`git push origin ${target}\`), sans refspec.` },
    );
  return DELIVERY_BRANCH.test(current) ? [...named, { branch: current }] : named;
};

const currentBranch = (dir) => git(dir, ["branch", "--show-current"]).trim();

// Dossier où la branche est extraite (dépôt principal ou worktree), sinon "".
export const checkoutOf = (root, branch) =>
  git(root, ["worktree", "list", "--porcelain"])
    .split("\n\n")
    .map((block) => ({ path: block.match(/^worktree (.+)$/m)?.[1], ref: block.match(/^branch (.+)$/m)?.[1] }))
    .find(({ ref }) => ref === `refs/heads/${branch}`)?.path ?? "";

export const isClean = (dir) => git(dir, ["status", "--porcelain"]).trim() === "";

const git = (dir, args) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" }).stdout ?? "";

const unquote = (text) => text.trim().replace(/^(["'])(.*)\1$/, "$2");
