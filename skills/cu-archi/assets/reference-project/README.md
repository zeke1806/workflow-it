# To-do list de référence CU Archi

To-do list TypeScript en monorepo PNPM : une API Express et un front React avec TanStack Start, organisés en modules Todo et Project, avec Storybook pour les composants stateless. Le [guideline](../../../../guideline/README.md) est la source de vérité, puis les [règles CU Archi](../../SKILL.md#scope) : ce projet les illustre, sans les rendre obligatoires au-delà de ce qu'elles disent.

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
pnpm check            # génère les routes TanStack, puis contrôle les types des packages et de tests/, les règles d'architecture (scripts/check-architecture.mjs, exemple de contrôle propre au projet) et le lint
pnpm lint             # ESLint (eslint.config.js) : règles tirées du guideline, pas de classe, sens des dépendances, librairies hors adapter
pnpm test             # Vitest : tests/**/*-{tdd,business}.spec.ts (node) et tests/**/*-ui.spec.tsx (DOM simulé)
pnpm build            # apps/api/dist et apps/web/dist
pnpm build-storybook  # apps/web/storybook-static
pnpm format:check     # Prettier ; pnpm format corrige
```

Les tests tournent sans réseau, sans fichier ni module natif, sans navigateur réel : `tests/isolation-setup.ts` les bloque (fichiers `-ui.spec.tsx` compris), et les fixtures remplacent le driver SQLite. Les tests UI rendent components et pages dans `happy-dom`.

## Organisation

| Dossier | Rôle |
| --- | --- |
| `packages/core/` | `@cu-archi/core` : schémas Zod, types et contrats des modules `todo` et `project`, erreurs métier `appErrors` et forme `AppError` dans `errors`. |
| `apps/api/src/app.ts`, `index.ts` | Routes Express et démarrage ; les routes adaptent HTTP et délèguent aux services. |
| `apps/api/src/services/` | Modules `todo` et `project`, adapters `repository` (SQLite) et `id` (UUID), composés par `di.ts`. |
| `apps/web/src/services/` | Services front `todo` et `project`, texte affiché des erreurs `errors`, adapters `api` (fetch) et `stateful` (raccordement React), composés par `di.ts`. |
| `apps/web/src/components/` | Vues stateless : `common` (blocs génériques), `todo` et `project` (vues métier). |
| `apps/web/src/routes/` | Pages TanStack Start ; elles valident l'URL et câblent directement la vue au service front. |
| `apps/web/.storybook/` | Configuration Storybook avec sa propre configuration Vite ; sections Common et Business, stories prises dans `src/`. |
| `apps/web/src/components/` (stories) | Stories d'états `*.stories.tsx`, scénarios `*-scenario.stories.tsx`, démos `*-demo.stories.tsx` (sur demande) et fixtures `*-story-fixtures.ts`, `*-demo-fixtures.tsx`, à côté des components qu'elles montrent (`common/` et `<domaine>/`). |
| `tests/` | Un seul dossier à la racine, un sous-dossier par spec `scrum-<YYMMDDHHmm>/` (identifiant de CU Workflow), sans dossier hors spec. Fichiers `-tdd.spec.ts` et `-business.spec.ts` en Node, un `describe` par application (`api`, `web`, `core`) ; fichier `-ui.spec.tsx` en DOM simulé (stories rejouées, pages sur api mockée). Voir le [guideline 1.2.10](../../../../guideline/architecture.md#1210-testing). |

Husky (`.husky/pre-commit`) lance `pnpm lint` puis `pnpm format:check` avant chaque commit ; `prepare` l'installe seulement si le projet est à la racine d'un dépôt git.

Les DI sont des singletons : `apps/web/src/router.tsx` crée une seule instance pour toutes les requêtes, l'état vit dans React. Voir le [rôle de la DI](../../references/services.md#di), les [adapters](../../references/services.md#adapters), les [services front](../../references/front.md#services-front) et l'[organisation des tests](../../references/tests.md#organisation).

## Choix du projet de référence

- TypeScript strict partout, via `tsconfig.base.json`.
- Exactement deux applications, `apps/api` et `apps/web`, et un package partagé `packages/core`. Dépendances locales en `workspace:*`, déclarées dans `pnpm-workspace.yaml`.
- PNPM et Zod. Chaque package déclare ses propres dépendances.
- API Express, front React avec TanStack Start, Storybook pour les composants stateless.
- Le modèle Todo (`id`, `title`, `completed`, `projectId`) et les choix du repository SQLite (UUID, ordre d'insertion, recherche par sous-chaîne) sont des choix d'exemple, pas des conventions du skill.

Le `.gitignore` de ce dossier reste valable si le projet est copié hors du dépôt de skills : il garde sources, tests, manifestes, configurations et `pnpm-lock.yaml`, et exclut dépendances, builds, Storybook généré, routes générées, bases SQLite et fichiers d'environnement.

**Exception propre à cet exemple** : les outils de travail locaux (`.claude/`, `.scratch/`, `.impeccable/`, `docs/agents/`, `docs/adr/`, `CLAUDE.md`, glossaires, `PRODUCT.md`, `DESIGN.md`, rapports de vérification) sont ignorés et ne sont pas distribués. Les installer localement selon CU Workflow ; CU Archi et CU Workflow peuvent être copiés dans `.claude/skills/` par CU Upskill, ce dossier restant ignoré. Vérifier les exclusions avant chaque commit.
