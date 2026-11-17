# To-do list de référence CU Archi

To-do list TypeScript en monorepo PNPM : une API Express et un front React avec TanStack Start, organisés en modules Todo et Project, avec Storybook pour les composants stateless. Les [règles CU Archi](../../SKILL.md#scope) sont la source de vérité : ce projet les illustre, sans les rendre obligatoires au-delà de ce qu'elles disent.

## Démarrage

Prérequis : Node 24 ou supérieur, PNPM 11.18.0.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` lance l'API, le front et Storybook en parallèle ; `Ctrl+C` les arrête ensemble. `pnpm dev:api`, `pnpm dev:web` et `pnpm storybook` lancent un seul service.

- Front : http://localhost:3000/ (liste et recherche), `/todos/manage` (création), `/todos/manage?id=ID` (édition), `/projects` (projets).
- API : http://localhost:3001/health renvoie `{"status":"ok"}`. Le port se change avec `PORT`. En développement, le front appelle `/api`, que Vite redirige vers le port 3001.
- Storybook : http://localhost:3002/.

L'API crée la base SQLite `todos.sqlite` dans son répertoire de travail.

## Vérification et builds

```bash
pnpm check            # génère les routes TanStack, puis contrôle les types des packages et de tests/, les règles d'architecture et le miroir des tests (scripts/check-architecture.mjs, exemple de contrôle propre au projet) et le lint
pnpm lint             # ESLint (eslint.config.js) : règles tirées de CU Archi, pas de classe, sens des dépendances, librairies hors adapter
pnpm test             # Vitest : tests/**/*.spec.ts (node) et tests/**/*.spec.tsx (DOM simulé)
pnpm build            # apps/api/dist et apps/web/dist
pnpm build-storybook  # apps/web/storybook-static
pnpm format:check     # Prettier ; pnpm format corrige
```

Les tests tournent sans réseau, sans fichier ni module natif, sans navigateur réel : `tests/isolation-setup.ts` les bloque (fichiers `.spec.tsx` compris), et les fixtures remplacent le driver SQLite. Les tests UI rendent components et pages dans `happy-dom`.

## Organisation

| Dossier | Rôle |
| --- | --- |
| `packages/core/` | `@cu-archi/core` : schémas Zod, types et contrats des modules `todo` et `project` ; module `errors` (catalogue `appErrors`, forme `AppError`, service pur `errorsService`). `src/di.ts` compose les services du core et exporte le singleton `core`. La map `exports` n'expose que `core` (`.`) et les types de chaque module (`./errors`, `./todo`, `./project`). |
| `apps/api/src/app.ts`, `index.ts` | Routes Express et démarrage ; les routes adaptent HTTP et délèguent aux services. |
| `apps/api/src/services/` | Modules `todo` et `project`, adapters `repository` (SQLite) et `id` (UUID), composés par `di.ts`. |
| `apps/web/src/services/` | Services front `todo` et `project` (texte affiché des erreurs via `core.errorsService.readErrorText`), adapters `api` (fetch) et `state-connector` (raccordement React), composés par `di.ts`. |
| `apps/web/src/components/` | Vues stateless : `common` (blocs génériques), `todo` et `project` (vues métier), et leurs containers `*-container.tsx`, qui câblent chaque vue à son service front. |
| `apps/web/src/routes/` | Pages TanStack Start ; elles valident l'URL, construisent les bindings de navigation et rendent le container avec le service de la DI. |
| `apps/web/.storybook/` | Configuration Storybook avec sa propre configuration Vite ; sections Common et Business, stories prises dans `src/`. |
| `apps/web/src/components/` (stories) | Stories d'états `*.stories.tsx`, scénarios `*-scenario.stories.tsx`, démos `*-demo.stories.tsx` (sur demande) et fixtures `*-story-fixtures.ts`, `*-demo-fixtures.tsx`, à côté des components qu'elles montrent (`common/` et `<domaine>/`). |
| `tests/` | Un seul dossier à la racine, miroir des sources sans `src/` : `apps/api/src/app.ts` est testé par `tests/apps/api/app.spec.ts`. Un fichier de test par fichier source qui porte de la logique, `.spec.ts` en Node, `.spec.tsx` en DOM simulé (stories rejouées, containers sur api mockée) ; fixtures `*-fixtures.ts` dans le plus proche dossier commun de leurs fichiers de test. Voir les [tests](../../references/tests.md). |


Les DI sont des singletons : `apps/web/src/router.tsx` crée une seule instance pour toutes les requêtes, l'état vit dans React. Le core est importé directement (`import { core } from "@cu-archi/core"`), sans passer par la DI des apps. Voir le [rôle de la DI](../../references/services.md#di), les [adapters](../../references/services.md#adapters), les [services front](../../references/front.md#services-front) et l'[organisation des tests](../../references/tests.md#organisation).

## Choix du projet de référence

- TypeScript strict partout, via `tsconfig.base.json`.
- Exactement deux applications, `apps/api` et `apps/web`, et un package partagé `packages/core`. Dépendances locales en `workspace:*`, déclarées dans `pnpm-workspace.yaml`.
- PNPM et Zod. Chaque package déclare ses propres dépendances.
- API Express, front React avec TanStack Start, Storybook pour les composants stateless.
- Le modèle Todo (`id`, `title`, `completed`, `projectId`) et les choix du repository SQLite (UUID, ordre d'insertion, recherche par sous-chaîne) sont des choix d'exemple, pas des conventions du skill.

Le `.gitignore` de ce dossier reste valable si le projet est copié hors du plugin : il garde sources, tests, manifestes, configurations et `pnpm-lock.yaml`, et exclut dépendances, builds, Storybook généré, routes générées, bases SQLite et fichiers d'environnement.

**Exception propre à cet exemple** : les outils de travail locaux (`.claude/`, `.scratch/`, `.impeccable/`, `docs/agents/`, `docs/adr/`, `CLAUDE.md`, glossaires, `PRODUCT.md`, `DESIGN.md`, rapports de vérification) sont ignorés et ne sont pas distribués. Les installer localement selon CU Workflow ; CU Archi et CU Workflow viennent du plugin `workflow-it-plugin` (voir son README), le dossier `.claude/` restant ignoré. Vérifier les exclusions avant chaque commit.
