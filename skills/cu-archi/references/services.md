# Services

Trois zones, détaillées dans le [guideline](../../../guideline/architecture.md) : contrats (types, schémas), services (logique), bords (adapters et infra). Les dépendances vont toujours des bords vers les services, des services vers les contrats.

## Modules

La logique vit dans `services/`, organisée en modules par domaine métier (`todo`, `project`) ou technique (`date-utils`, `repository`).

```
services/
  di.ts
  todo/
    todo-types.ts          # contrat public + types
    todo-service.ts        # implémentation, ou dossier :
    todo-service/
      index.ts             # seule entrée publique : createTodoService
      create.ts
      list.ts
  adapters/
    date-utils/
      date-utils-types.ts
      dayjs-date-utils-service.ts
```

- Un module = `<module>-types.ts` (types, contrats, constantes) + `<module>-service.ts` (logique). Aucun autre fichier à la racine du module, hors implémentations supplémentaires du même contrat.
- L'implémentation devient un dossier (module profond) dès qu'elle mélange plusieurs opérations indépendantes (liste, formulaire, suppression), services front compris. Son `index.ts` n'expose que l'interface publique du service. Les fichiers internes ne sont jamais importés de l'extérieur.
- Plusieurs implémentations d'un même contrat peuvent cohabiter dans un module (par exemple SQLite et PostgreSQL), surtout dans les adapters. Chacune nomme sa variante : `<variante>-<module>-service.ts`. La DI choisit celle à utiliser.
- **Quand créer un module** : quand une responsabilité distincte apparaît (autres invariants, autre raison de changer). Pas un module par fonction ou par fichier. La complexité au sein d'une même responsabilité se traite en découpant le dossier interne.
- **Où ranger une fonction** : dans le module qui l'utilise, pas dans celui dont elle lit les données. Exemple : la lecture des durées de session depuis les variables d'environnement sert seulement l'auth, elle va dans `auth/auth-service/`, pas dans `env/`. Une fonction utilisée par plusieurs modules va dans le module qui porte sa responsabilité ; elle ne devient un module que selon la règle ci-dessus.
- Un module expose une seule interface publique : `<module>-types.ts` et le contrat de son service, construit par sa fabrique `create<Module>Service`. Aucune fonction exportée en vrac depuis `<module>-service.ts` ou `index.ts` : une fonction pure qui ne sert qu'au module reste interne, non exportée. Deux contrats autonomes donnent deux modules.
- Un module peut rester interne : utilisé par d'autres modules, jamais exposé par la DI.
- Le consommateur reçoit le plus petit contrat utile (`Repository["todo"]` plutôt que `Repository`).

## Service

- **Stateless** : il porte la logique, pas les données. Aucune donnée évolutive (session, cache, compteur, brouillon) n'est capturée dans sa fabrique.
- Les données conservées entre appels viennent d'un contrat injecté (repository, port mémoire) ou de l'état passé en argument.
- Les dépendances (autres contrats, configuration immuable) sont injectées à la construction. Les données propres à un appel sont passées en arguments.

## Import ou injection

Critère : le module est-il pur ? Oui, et partagé : il vit dans le [core](#core) et s'importe. Non : il est injecté par la DI de l'app, qu'il vienne de l'app ou du core.

- **Core, import direct** : `import { core } from "@<projet>/core"` puis `core.errorsService.createAppError(...)`. Un service pur du core n'est jamais injecté ni mocké : le test l'exécute réellement. Ses types, schémas et constantes s'importent par module (`@<projet>/core/errors`).
- **App, injection** : une app n'expose que des modules composés par sa DI et injectés (contrat reçu par la fabrique) : autre service, effet de bord ([code](code.md#style)), état, implémentation remplaçable, adapter compris.
- **Module non pur du core** : tout module du core qui n'est pas pur (non déterministe ou à effet : horloge, aléa, génération d'identifiants…) est pris dans `core` par la DI de l'app, puis injecté. Il n'est jamais importé directement par un service. Les tests passent un mock.
- Une fonction pure qui ne sert qu'à un seul module reste interne à ce module, non exportée.
- Créer un [adapter](#adapters) et l'injecter sont deux décisions distinctes : ce critère ne décide que de l'injection.

Exemple : `createProjectService(api)` reçoit l'API (réseau) par la DI, et lit le texte d'erreur avec `core.errorsService.readErrorText` (service pur du core).

## DI

`services/di.ts` est le seul point d'exposition des services d'une app vers son infra. Le core a sa propre DI ([core](#core)).

- **Singleton** : construite une fois, au meilleur point d'entrée de l'infra (démarrage du serveur avant l'écoute HTTP, création de l'app front). Réutilisée partout ensuite.
- **Composition seulement** : choisir les implémentations, appeler les fabriques, injecter les contrats. Aucune logique métier, aucun état, aucune initialisation de ressource, aucun appel d'opération.
- **Exposition minimale** : seulement les modules utilisés par l'infra. Un module non utilisé n'est pas exposé.
- Forme : déclarer chaque service avant le `return`, puis retourner la liste des références.

```ts
export function createDependencies() {
  const repository = createSQLiteRepositoryService();
  const todo = createTodoService(repository.todo);

  return Object.freeze({ todo });
}
```

- Fabrique différée exposée par la DI : seulement en cas de blocage technique (dépendance connue uniquement par requête). Elle reste de la pure composition.

## Adapters

Toute librairie externe consommée par le système est encapsulée dans un adapter : `services/adapters/<module>/`. Si elle s'encapsule difficilement, l'agent le signale et l'utilisateur tranche.

- Un adapter est un module : `<module>-types.ts` (contrat public, neutre) + une implémentation par librairie (`dayjs-date-utils-service.ts`).
- Un adapter partagé par plusieurs apps vit dans le core (`core/adapters/<module>/`), si sa librairie tourne sur tous les runtimes du projet. Jamais une librairie propre à un seul environnement (base de données, DOM, serveur HTTP).
- Il n'expose que ce que consomment les services. Un besoin technique hors de ce contrat va dans un autre adapter dont le thème correspond, ou dans `components/` s'il sert seulement l'affichage.
- Le contrat est la seule chose connue du système. Changer de librairie = écrire une nouvelle implémentation du même contrat et changer le choix dans la DI (celle de l'app ou celle du core).
- Nommer le module par sa capacité (`date-utils`, `repository`, `http-client`), pas par la librairie.
- Exceptions approuvées, liste non limitative : librairie qui ne s'encapsule pas proprement (Zod, voir [code](code.md#validation), librairie de classes CSS). Toute nouvelle exception est tranchée par l'utilisateur. Choisir les librairies avec parcimonie.

## Infra et système

Deux sens à distinguer :

- **Librairie consommée par le système** (dayjs, driver SQL, fetch) : derrière un adapter.
- **Infra qui consomme le système** (Express, routes, React, TanStack) : hors de `services`. Elle démarre, reçoit les entrées, appelle les services de la DI et traduit les sorties (HTTP, rendu). Elle ne porte aucune décision métier.
- Cas mixte : si des services ont besoin d'une capacité de l'infra (lire un en-tête, poser un cookie), créer un adapter dont le contrat est neutre et dont l'implémentation utilise Express. Le service ne voit que le contrat.

## Core

Tout module pur exposé vit dans le core : package `packages/core` en monorepo, dossier `core/` en monolithe. Même forme dans les deux cas.

```
core/
  di.ts                    # createCoreDependencies + singleton core
  errors/
    errors-types.ts        # AppError, appErrors, ErrorsService
    errors-service.ts      # createErrorsService
  adapters/
    clock/
      clock-types.ts       # ClockService : now(): Date
      dayjs-clock-service.ts
```

- Modules de même forme que ceux des apps : `<module>-types.ts` + `<module>-service.ts` avec interface et fabrique.
- **DI du core** : `di.ts` compose les services et adapters du core, puis exporte le singleton `export const core = createCoreDependencies()`, créé au chargement. Composition seulement, comme toute [DI](#di).
- **Exposition** : en monorepo, la map `exports` du package n'expose que `core` (`.`) et les types de chaque module (`./<module>`, `./clock`). Aucune entrée vers une fabrique ou un fichier service. En monolithe, mêmes points d'entrée : `core/di.ts` et les `<module>-types.ts`.
- **Usage** : voir [import ou injection](#import-ou-injection) : pur importé via `core`, non pur injecté par la DI de l'app. Un service pur du core reçoit les valeurs non déterministes en argument (`isOverdue(todo, now)`) plutôt que de dépendre d'un module non pur : il reste pur.
- Le core ne dépend d'aucune app ni d'aucune infra. Il porte seulement du code qui tourne partout.
- **Monorepo** : `apps/api` et `apps/web` ont chacune leurs modules, leurs adapters et leur DI.
- **Monolithe** : `services/` porte la logique serveur, `services-front/` la logique d'affichage. Chacun a ses modules, ses adapters et sa DI, à côté de `core/`.

Pourquoi : une seule forme de service partout (interface + fabrique, point de remplacement unique dans `di.ts`), sans imposer l'injection à ce qui est pur.
