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

const violations = listSources().flatMap(checkSource);

if (violations.length > 0) {
  console.error(violations.join("\n"));
  console.error(`\n${violations.length} violation(s) d'architecture.`);
  process.exit(1);
}

console.log("Architecture : aucune violation.");

function listSources() {
  const packageRoots = ["apps", "packages"].flatMap((group) =>
    readdirSync(join(root, group), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(root, group, entry.name, "src")),
  );

  return [join(root, "tests"), ...packageRoots].flatMap(collect);
}

function collect(dir) {
  return readEntries(dir)
    .filter((entry) => !skippedDirs.has(entry.name))
    .flatMap((entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        return collect(path);
      }

      return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
    });
}

// Un package sans `src` ou un projet sans `tests` est normal ; toute autre erreur doit remonter.
function readEntries(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function checkSource(file) {
  const path = relative(root, file).split(sep).join("/");
  const name = path.split("/").pop();
  const source = readFileSync(file, "utf8");

  return [
    ...checkFileName(path, name),
    ...checkComponentState(path, source),
    ...checkImports(path, source),
  ];
}

function checkFileName(path, name) {
  if (toolFileNames.some((pattern) => pattern.test(name))) return [];
  if (fileNamePattern.test(name)) return [];

  return [
    `${path} : nom de fichier hors règle (kebab-case, minuscules séparées par des tirets, sous-extensions kebab-case admises).`,
  ];
}

function checkComponentState(path, source) {
  if (!path.includes("/src/components/") || storyFilePattern.test(path)) return [];
  if (!/\buse(State|Reducer)\b/.test(source)) return [];

  return [`${path} : état interdit dans un component (useState, useReducer).`];
}

function checkImports(path, source) {
  return [...source.matchAll(importPattern)].flatMap((match) =>
    checkImport(path, match[1] ?? match[2] ?? match[3]),
  );
}

function checkImport(path, specifier) {
  const inSource = path.includes("/src/");
  const inAdapters = path.includes("/services/adapters/");
  const inStory = storyFilePattern.test(path);
  const inMockup = path.includes("/src/components/mockup/");
  const isMockupImport = /(^|\/)mockup(\/|$)/.test(specifier) && !inMockup;
  const isStoryImport = inSource && !inStory && storyFilePattern.test(specifier);
  const isAllowedLibrary =
    !inSource ||
    inAdapters ||
    inStory ||
    specifier.startsWith(".") ||
    allowedLibraries.some((pattern) => pattern.test(specifier));

  return [
    ...(isMockupImport ? [`${path} : import de mockup/ hors de mockup/ (${specifier}).`] : []),
    ...(isStoryImport
      ? [`${path} : import d'une story ou de ses fixtures par l'application (${specifier}).`]
      : []),
    ...(isAllowedLibrary ? [] : [`${path} : librairie externe hors adapter (${specifier}).`]),
  ];
}
