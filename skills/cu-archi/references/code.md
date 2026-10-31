# Code

## Style

- **Fonctionnel et lisible** : fonctions pures plutôt que classes ; fabriques `createXxx` plutôt que constructeurs. Une classe reste possible pour un besoin technique précis.
- **Immuable** : ne jamais modifier une entrée ni un ancien état ; retourner une nouvelle valeur. Types `readonly`. Une copie superficielle (spread) du chemin modifié suffit ; pas de clonage profond.
- **Effets de bord** (I/O, horloge, aléatoire) : derrière une dépendance injectée, jamais en dur dans la logique.

## Ordre et lisibilité

- Dans un fichier, la fonction consommatrice est au-dessus des fonctions qu'elle appelle : on lit l'opération principale, puis ses détails. Un helper partagé va sous ses consommateurs. Utiliser des déclarations `function` si le hoisting est nécessaire.
- Fonction affectée à une variable, une propriété ou un membre de service : corps multiligne avec accolades et `return` explicite. Seul un callback court passé directement en argument (`map`, `find`, prop JSX) peut rester en expression.
- Code aéré : une ligne vide entre groupes logiques, pas après chaque instruction.
- Court et lisible : pas de répétition ni d'abstraction sans besoin.

## Nommage

- Fichiers : kebab-case, tout en minuscules, mots séparés par des tirets (`nom-du-fichier.ext`). Acronymes compris (`di.ts`). Voir le [guideline](../../../guideline/architecture.md#1211-nommage-de-fichier).
- Sous-extensions admises, elles aussi en kebab-case : `.stories` (`button.stories.tsx`), `.spec` (`scrum-2610241735-tdd.spec.ts`), `.storybook`… Les globs de Vitest et de Storybook s'appuient sur `.spec` et `.stories`.
- Exceptions : noms imposés par un outil et non configurables (`__root.tsx`, `README.md`, `vite.config.ts`, `*.d.ts`, fichiers générés).
- Symboles : camelCase pour les fonctions, PascalCase pour les types et composants.
- Fabriques de service : `create<Nom>Service`. Une implémentation d'adapter nomme sa technologie : `createDayjsDateUtilsService` dans `dayjs-date-utils-service.ts`.

## Validation

- Zod décrit les données validées à l'exécution (entités, entrées, identifiants) ; les types en dérivent par `z.infer`. Exception assumée à la règle des adapters : les schémas sont la source des types.
- Une règle de validation est définie une seule fois, dans le module propriétaire (core en monorepo), puis réutilisée. Elle peut s'exécuter à chaque frontière de confiance (route, service, front).
- Contrats de service : interfaces TypeScript.

## Erreurs

Une fonction retourne une valeur ou `throw` une erreur ; elle ne retourne jamais `null`, l'absence d'une donnée attendue est une erreur du catalogue (`todoNotFound`). Une seule forme d'erreur, et un catalogue central des erreurs métier :

```ts
// errors/errors-types.ts : types et constantes
export type AppError = {
  readonly message: string;
  readonly description: string;
  readonly status?: number;
};

export type AppErrorDefinition = { readonly message: string; readonly status: number };

export const appErrors = {
  invalidInput: { message: "Invalid input", status: 400 },
  todoNotFound: { message: "Todo not found", status: 404 },
  projectArchived: { message: "Project archived", status: 409 },
  internal: { message: "Internal error", status: 500 },
} as const satisfies Record<string, AppErrorDefinition>;

// errors/errors-service.ts : logique
export function createAppError(error: AppErrorDefinition, description: string): AppError {
  return { message: error.message, description, status: error.status };
}

// usage
throw createAppError(appErrors.todoNotFound, `id: ${id}`);
```

- `message` : anglais, court, propre au cas métier. Défini une seule fois dans le catalogue, jamais écrit à la main ailleurs. Une entrée par cas métier réellement distinct.
- `description` : texte libre pour le diagnostic (identifiant, contexte).
- `status` : code HTTP porté par l'entrée du catalogue. Facultatif dans le type, car une erreur reçue de l'extérieur (réponse réseau côté front) peut ne pas le porter ; dans ce cas, prendre le statut de la réponse.
- Emplacement : un module `errors` partagé (`core/errors/` en monorepo, `services/errors/` sinon).
- La couche HTTP traduit l'erreur en réponse avec `status`. Une erreur inconnue devient `internal`.
- Affichage : le front choisit le texte d'après `message`, par une correspondance côté front, avec un texte par défaut. Le catalogue ne contient aucun texte d'interface.
- Les erreurs de champs restent du ressort de la [validation](#validation).

## Contrôle automatique

Le [guideline](../../../guideline/verification.md) fixe le besoin : lint et Prettier. Avant de livrer, l'IA vérifie leur présence dans le projet et les met en place s'il en manque. Les règles de lint sont générées depuis les règles vérifiables du [guideline](../../../guideline/README.md) (code et architecture) : nommage en kebab-case (sous-extensions admises), aucune classe, aucun état dans `components/`, librairie externe importée seulement dans un adapter (exceptions approuvées exceptées), sens des dépendances contrats ← services ← bords, aucun import de `mockup/` hors de `mockup/`, aucun import de stories par l'application. Le plugin lance lui-même (`hooks/hooks.json`) les vérifications complètes au seul commit de livraison sur `claude/scrum-N`, selon les scripts `package.json` du projet (`lint`, `check:architecture`, `check`, `format:check`, `test`, `build`, `build-storybook`) ; le projet doit donc les définir. Le projet de référence en donne un exemple : `eslint.config.js` et `scripts/check-architecture.mjs` (nommage, mockup, stories).
