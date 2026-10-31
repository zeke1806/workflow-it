// Règles de lint tirées du guideline (code.md et architecture.md).
// Exemple pour un projet qui adopte CU Archi : chaque projet garde sa propre configuration.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

const externalLibraries = [
  {
    group: ["express", "better-sqlite3", "@tanstack/*"],
    message: "Librairie externe : à encapsuler dans un adapter (architecture 1.2.3).",
  },
];

const insideOut = [
  {
    group: ["**/routes/**", "**/components/**", "**/pages/**"],
    message: "Un service ne dépend pas de l'infra ni des vues (architecture 1.2.3).",
  },
  {
    group: ["express", "react", "react-dom", "@tanstack/*"],
    message: "Un service ne connaît ni Express ni React (architecture 1.2.3).",
  },
];

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/storybook-static/**",
      "**/.tanstack/**",
      "**/routeTree.gen.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Code : classes interdites, immutabilité, lisibilité (code.md 1.1).
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ClassDeclaration",
          message: "Pas de classe sauf besoin technique (code 1.1.2.3).",
        },
        {
          selector: "ClassExpression",
          message: "Pas de classe sauf besoin technique (code 1.1.2.3).",
        },
      ],
      "no-param-reassign": ["error", { props: true }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: "error",
      "no-else-return": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
  {
    // Architecture : librairie externe seulement dans un adapter (architecture 1.2.3).
    files: ["apps/*/src/**/*.{ts,tsx}"],
    ignores: [
      "**/services/adapters/**",
      "**/routes/**",
      "**/app.ts",
      "**/router.tsx",
      "**/index.ts",
      "**/*.stories.tsx",
      "**/*-story-fixtures.ts",
      "**/*-demo-fixtures.tsx",
    ],
    rules: { "no-restricted-imports": ["error", { patterns: externalLibraries }] },
  },
  {
    // Architecture : sens des dépendances contrats ← services ← bords (architecture 1.2.3).
    files: ["apps/*/src/services/**/*.ts", "packages/core/src/**/*.ts"],
    ignores: ["**/services/adapters/**"],
    rules: { "no-restricted-imports": ["error", { patterns: insideOut }] },
  },
  {
    files: ["tests/**/*.{ts,tsx}", "**/*.stories.tsx"],
    rules: { "no-restricted-syntax": "off", "no-restricted-imports": "off" },
  },
);
