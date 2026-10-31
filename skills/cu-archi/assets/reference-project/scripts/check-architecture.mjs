// Contrôle automatique des règles CU Archi vérifiables par lecture des sources.
// Exemple pour un projet qui adopte CU Archi : chaque projet garde son propre contrôle.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const skippedDirs = new Set(["node_modules", "dist", "storybook-static", ".storybook"]);
const fileNamePattern = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*\.(ts|tsx)$/;
const storyFilePattern = /(\.stories|-story-fixtures|-demo-fixtures)(\.tsx?)?$/;
const toolFileNames = [/^__root\.tsx$/, /\.d\.ts$/, /\.gen\.ts$/, /\.config\.ts$/];
const allowedLibraries = [
  /^zod$/,
  /^react(-dom)?(\/|$)/,
  /^@tanstack\//,
  /^express$/,
  /^node:/,
  /^@cu-archi\//,
];
const importPattern =
  /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const violations = [];

for (const file of listSources()) {
  const path = relative(root, file).split(sep).join("/");
  const name = path.split("/").pop();
  const source = readFileSync(file, "utf8");

  checkFileName(path, name);
  checkComponentState(path, source);
  checkImports(path, source);
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  console.error(`\n${violations.length} violation(s) d'architecture.`);
  process.exit(1);
}

console.log("Architecture : aucune violation.");

function listSources() {
  const files = [];
  const roots = [join(root, "tests")];

  for (const group of ["apps", "packages"]) {
    for (const entry of readdirSync(join(root, group), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      roots.push(join(root, group, entry.name, "src"));
    }
  }

  for (const dir of roots) {
    collect(dir, files);
  }

  return files;
}

function collect(dir, files) {
  let entries;

  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (skippedDirs.has(entry.name)) continue;

    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      collect(path, files);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(path);
    }
  }
}

function checkFileName(path, name) {
  if (toolFileNames.some((pattern) => pattern.test(name))) return;
  if (fileNamePattern.test(name)) return;

  violations.push(
    `${path} : nom de fichier hors règle (kebab-case, minuscules séparées par des tirets, sous-extensions kebab-case admises).`,
  );
}

function checkComponentState(path, source) {
  if (!path.includes("/src/components/") || storyFilePattern.test(path)) return;
  if (!/\buse(State|Reducer)\b/.test(source)) return;

  violations.push(`${path} : état interdit dans un component (useState, useReducer).`);
}

function checkImports(path, source) {
  const inSource = path.includes("/src/");
  const inAdapters = path.includes("/services/adapters/");
  const inStory = storyFilePattern.test(path);
  const inMockup = path.includes("/src/components/mockup/");

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2] ?? match[3];

    if (/(^|\/)mockup(\/|$)/.test(specifier) && !inMockup) {
      violations.push(`${path} : import de mockup/ hors de mockup/ (${specifier}).`);
    }

    if (inSource && !inStory && storyFilePattern.test(specifier)) {
      violations.push(
        `${path} : import d'une story ou de ses fixtures par l'application (${specifier}).`,
      );
    }

    if (!inSource || inAdapters || inStory) continue;
    if (specifier.startsWith(".") || allowedLibraries.some((pattern) => pattern.test(specifier)))
      continue;

    violations.push(`${path} : librairie externe hors adapter (${specifier}).`);
  }
}
