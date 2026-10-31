// SessionStart : vérifie que le projet cible a de quoi travailler avec le plugin.
// Stdout est ajouté au contexte de l'IA.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { adoptsPlugin, hasFile, projectRoot, readInput, readPackage } from "./project.mjs";

const root = projectRoot(readInput());
if (!adoptsPlugin(root)) process.exit(0);

const missing = [];
if (!existsSync(join(root, ".git"))) missing.push("dépôt Git (`git init`)");

const pkg = readPackage(root);
if (!pkg) {
  missing.push("`package.json`");
} else {
  const scripts = pkg.scripts ?? {};
  for (const name of ["lint", "format:check", "test", "build", "check:architecture"]) {
    if (!scripts[name]) missing.push(`script \`${name}\``);
  }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of ["eslint", "prettier", "vitest", "typescript"]) {
    if (!deps[name]) missing.push(`dépendance \`${name}\` (racine)`);
  }
}

if (!hasFile(root, (f) => /^eslint\.config\.(js|mjs|cjs|ts)$/.test(f))) missing.push("`eslint.config.*`");
if (!hasFile(root, (f) => /^\.prettierrc(\..+)?$/.test(f) || /^prettier\.config\./.test(f))) missing.push("configuration Prettier");
if (!existsSync(join(root, "scripts/check-architecture.mjs"))) missing.push("`scripts/check-architecture.mjs`");

if (missing.length === 0) process.exit(0);

console.log(
  [
    "workflow-it-plugin : le projet n'a pas tout ce qu'il faut pour travailler.",
    `Manque : ${missing.join(", ")}.`,
    "Avant toute réalisation, le mettre en place (modèle : skills/cu-archi/assets/reference-project du plugin) puis relancer les vérifications. Les commits sont bloqués tant que le lint est absent.",
  ].join("\n"),
);
