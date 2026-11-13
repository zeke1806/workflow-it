# Code

Les règles de code : les règles par défaut, complétées par nos règles propres, qui peuvent en répéter certaines pour les rendre explicites, puis leur détail (style, ordre, nommage, validation, erreurs, contrôle automatique).

## Règles par défaut

Issues de Clean Code (Robert C. Martin) et de [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript).

### Nommage des symboles

- Un nom révèle l'intention : il dit ce que c'est ou ce que ça fait.
- Un nom est prononçable et cherchable : pas d'abréviation cryptique, pas de littéral inexpliqué (utiliser une constante nommée).
- Un seul terme par concept (`getUser`, pas `getClientData` et `getUserInfo`).
- Pas de mapping mental : pas de `i`, `x`, `d` hors boucle triviale.
- Pas de contexte redondant (`car.color`, pas `car.carColor`).
- Une fonction a un nom verbe qui dit l'action. Un booléen ou une condition s'écrit en forme positive (`isPresent`).

### Fonctions

- Petite, une seule chose, un seul niveau d'abstraction.
- 2 arguments maximum ; au-delà, passer un objet.
- Pas de flag booléen en paramètre : écrire deux fonctions.
- Valeurs par défaut dans la signature.
- Pas d'effet de bord caché : pas de mutation des entrées, pas d'écriture globale. Les effets inévitables sont centralisés.
- Condition complexe extraite dans une fonction nommée et écrite en positif. Polymorphisme par contrats et tables de fonctions plutôt que longues chaînes de `if`/`switch`.
- Style fonctionnel (`map`, `filter`, `reduce`) plutôt que boucle impérative quand c'est plus lisible.
- L'appelant est au-dessus de l'appelé : le fichier se lit de haut en bas.

### Types et données

- Pas de vérification de type manuelle : API cohérente et TypeScript.
- Données protégées par une fonction ou une portée de module quand il faut valider ou protéger.
- Pas de `null` retourné, pas de valeur magique.

### Structure

- Modules et fonctions petits, forte cohésion, une seule responsabilité.
- Composition, pas d'héritage.
- SOLID :
  - SRP : une seule raison de changer.
  - OCP : étendre sans modifier l'existant.
  - LSP : une implémentation d'un contrat en remplace une autre sans casser le comportement.
  - ISP : pas de dépendance à ce qu'on n'utilise pas.
  - DIP : dépendre d'abstractions, injecter les dépendances.

### Gestion d'erreurs

- Exceptions plutôt que codes de retour.
- Aucune erreur ignorée : chaque `catch` déclenche une réponse délibérée (log, remontée, notification).
- Promesse rejetée traitée comme une exception.
- `async/await` plutôt que callbacks ou chaînes de Promises.

### Commentaires

- Le code s'explique seul. Commenter le *pourquoi* d'une logique métier complexe, jamais le *quoi*.
- Pas de code commenté, pas de commentaire journal (`git log` sert à ça), pas de marqueur de position.

### Formatage

- Style cohérent, appliqué par un outil (formateur, linter), jamais débattu.
- Capitalisation uniforme : constantes, fonctions.

### Tests (principes)

- Un concept par test.
- F.I.R.S.T. : rapides, indépendants, répétables, auto-vérifiants, écrits à temps.
- Tests propres, avec la même exigence de lisibilité que le code.
- Toute fonctionnalité a ses tests ; couverture élevée avant livraison ou refactor.

### Hygiène générale

- DRY, mais seulement avec une abstraction juste : ni duplication, ni abstraction prématurée.
- KISS et YAGNI : le plus simple qui marche, rien « au cas où ».
- Pas de sur-optimisation : mesurer, puis optimiser les goulots connus.
- Supprimer le code mort (git le garde).
- Règle du boy-scout : laisser le code plus propre qu'on l'a trouvé.

### Notes

- Le repo source est centré JavaScript. Les règles [types et données](#types-et-données) et [gestion d'erreurs](#gestion-derreurs) (async) sont à adapter à la stack (TypeScript, Vitest).
- « 2 arguments maximum » et « petites fonctions » sont des heuristiques : défaut à respecter, exception possible si justifiée.

## Règles propres

Nos règles de code, en complément des règles par défaut.

- **Lisibilité** : le code doit être très lisible, comme on lit une phrase.
- **Une fonction, une seule chose** : une fonction fait une seule chose.
- **Pas de classe sauf besoin technique** : ne pas utiliser de classe, sauf besoin strictement technique non contournable. Les principes objet sont acceptés, mais à mettre en œuvre avec des fonctions.
- **Composition** : préférer la composition.
- **Fonction consommatrice au-dessus de la fonction consommée** : dans un fichier, la fonction consommatrice est placée au-dessus de la fonction qu'elle consomme.
- **Immutabilité et fonctions pures** : suivre la règle de l'immutabilité et écrire des fonctions pures.

### Sécurité

- Aucun secret dans le code, les logs ou Git.
- Aucune donnée sensible dans les logs.
- Toute entrée externe est validée à la frontière.
- Toute nouvelle dépendance est justifiée et signalée à l'utilisateur.

## Style

- **Fonctionnel et lisible** : fonctions pures ; fabriques `createXxx` plutôt que constructeurs. Pas de classe, sauf besoin strictement technique non contournable.
- **Immuable** : ne jamais modifier une entrée ni un ancien état ; retourner une nouvelle valeur. Types `readonly`. Une copie superficielle (spread) du chemin modifié suffit ; pas de clonage profond.
- **Effets de bord** (I/O, horloge, aléatoire) : derrière une dépendance injectée, jamais en dur dans la logique.

## Ordre et lisibilité

- Dans un fichier, la fonction consommatrice est au-dessus des fonctions qu'elle appelle : on lit l'opération principale, puis ses détails. Un helper partagé va sous ses consommateurs. Utiliser des déclarations `function` si le hoisting est nécessaire.
- Fonction affectée à une variable, une propriété ou un membre de service : corps multiligne avec accolades et `return` explicite. Seul un callback court passé directement en argument (`map`, `find`, prop JSX) peut rester en expression.
- Code aéré : une ligne vide entre groupes logiques, pas après chaque instruction.
- Court et lisible : pas de répétition ni d'abstraction sans besoin.

## Nommage

- Fichiers : kebab-case, tout en minuscules, mots séparés par des tirets (`nom-du-fichier.ext`). Acronymes compris (`di.ts`).
- Sous-extensions admises, elles aussi en kebab-case : `.stories` (`button.stories.tsx`), `.spec` (`scrum-2610241735-tdd.spec.ts`), `.storybook`… Les globs de Vitest et de Storybook s'appuient sur `.spec` et `.stories`.
- Exceptions : noms imposés par un outil et non configurables (`__root.tsx`, `README.md`, `vite.config.ts`, `*.d.ts`, fichiers générés).
- Symboles : camelCase pour les fonctions, PascalCase pour les types et composants.
- Fabriques de service : `create<Nom>Service`. Une implémentation d'adapter nomme sa technologie : `createDayjsDateUtilsService` dans `dayjs-date-utils-service.ts`. Tout module à plusieurs implémentations nomme de même chaque variante : `<variante>-<module>-service.ts`.

## Validation

- Zod décrit les données validées à l'exécution (entités, entrées, identifiants) ; les types en dérivent par `z.infer`. Exception assumée à la règle des adapters : les schémas sont la source des types.
- Une règle de validation est définie une seule fois, dans le module propriétaire (core en monorepo), puis réutilisée. Elle peut s'exécuter à chaque frontière de confiance (route, service, front).
- Contrats de service : interfaces TypeScript.

## Erreurs

Une fonction retourne une valeur ou `throw` une erreur ; elle ne retourne jamais `null`, l'absence d'une donnée attendue est une erreur du catalogue (`todoNotFound`). Une seule forme d'erreur, et un catalogue central des erreurs métier :

```ts
// core/errors/errors-types.ts : types, constantes et contrat du service
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

export interface ErrorsService {
  readonly createAppError: (error: AppErrorDefinition, description: string) => AppError;
}

// core/errors/errors-service.ts : logique
export function createErrorsService(): ErrorsService {
  return { createAppError };
}

function createAppError(error: AppErrorDefinition, description: string): AppError {
  return { message: error.message, description, status: error.status };
}

// usage, depuis le singleton du core
throw core.errorsService.createAppError(appErrors.todoNotFound, `id: ${id}`);
```

- `message` : anglais, court, propre au cas métier. Défini une seule fois dans le catalogue, jamais écrit à la main ailleurs. Une entrée par cas métier réellement distinct.
- `description` : texte libre pour le diagnostic (identifiant, contexte).
- `status` : code HTTP porté par l'entrée du catalogue. Facultatif dans le type, car une erreur reçue de l'extérieur (réponse réseau côté front) peut ne pas le porter ; dans ce cas, prendre le statut de la réponse.
- Emplacement : le module `errors` du core (`packages/core/src/errors/` en monorepo, `core/errors/` en monolithe), exposé par `core.errorsService`.
- La couche HTTP traduit l'erreur en réponse avec `status`. Une erreur inconnue devient `internal`.
- Affichage : le front choisit le texte d'après `message`, par une correspondance côté front, avec un texte par défaut. Le catalogue ne contient aucun texte d'interface.
- Les erreurs de champs restent du ressort de la [validation](#validation).

## Contrôle automatique

Les règles vérifiables du code (ce document) et de l'architecture ([services](services.md), [front](front.md), [Storybook](storybook.md), [tests](tests.md)) sont contrôlées par deux outils. Au push de livraison, un hook du plugin les lance, avec les tests et le build.

- **Lint** : contrôle le code et l'architecture.
- **Prettier** : formate le code.

### Rôle de l'IA

Elle vérifie que ces outils sont présents. S'il en manque, elle les met en place.

### Règles de lint

Elles sont générées à partir des règles de code et d'architecture. Seules les règles vérifiables automatiquement sont générées.

### Moments de vérification

Le plugin les impose lui-même (`hooks/hooks.json`), sans réglage dans le projet cible :

- **À la livraison seulement** : au push de `claude/scrum-N`, vérifications complètes dans le dossier où la branche est extraite (`check`, ou `lint` et `check:architecture` si le projet n'a pas `check`, puis `format:check`, `test`, `build`, celles que le projet définit). `check` est un raccourci qui regroupe `lint` et `check:architecture` ; l'IA peut l'ajouter au projet. Un échec, un dépassement du budget de 9 minutes ou des modifications non commitées bloquent le push. Si le lint est absent, le push est bloqué jusqu'à sa mise en place.

Avant le commit unique sur `claude/scrum-N`, l'IA lance elle-même ces vérifications et les corrige : le hook reste un garde-fou. Elle lance aussi `build-storybook` si des stories ont changé ; le hook ne le lance pas.

Pendant le travail (commits des skills Matt Pocock), aucune vérification n'est imposée par le plugin.

### Prérequis du projet

Au démarrage de session, le plugin vérifie que le projet cible a de quoi travailler : dépôt Git, `package.json` avec les scripts `lint`, `format:check`, `test`, `build`, `check:architecture`, dépendances `eslint`, `prettier`, `vitest`, `typescript` et configurations ESLint et Prettier. Ce qui manque est signalé à l'IA, qui le met en place avant de travailler. Le plugin ne s'active que dans un projet dont le `CLAUDE.md` ou l'`AGENTS.md` nomme `workflow-it-plugin`.

### Détail

Avant de livrer, l'IA vérifie la présence de lint et Prettier dans le projet et les met en place s'il en manque. Les règles de lint générées couvrent notamment : nommage en kebab-case (sous-extensions admises), aucune classe, aucun état dans `components/`, librairie externe importée seulement dans un adapter (exceptions approuvées exceptées), sens des dépendances contrats ← services ← bords, aucun import de `mockup/` hors de `mockup/`, aucun import de stories par l'application. Le plugin lance lui-même (`hooks/hooks.json`) les vérifications complètes au seul push de livraison de `claude/scrum-N`, selon les scripts `package.json` du projet, dont la liste est fixée ci-dessus ([moments](#moments-de-vérification), [prérequis](#prérequis-du-projet)) et implémentée dans `hooks/project.mjs` ; le projet doit donc les définir. Le projet de référence en donne un exemple : `eslint.config.js` et `scripts/check-architecture.mjs` (nommage, mockup, stories).
