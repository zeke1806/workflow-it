# Services

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

- Un module = `<module>-types.ts` (types, contrats, constantes) + `<module>-service.ts` (logique). Aucun autre fichier à la racine du module.
- L'implémentation devient un dossier (module profond) dès qu'elle mélange plusieurs opérations indépendantes (liste, formulaire, suppression), services front compris. Son `index.ts` n'expose que l'interface publique du service. Les fichiers internes ne sont jamais importés de l'extérieur.
- Un module expose une seule interface publique de service. Deux contrats autonomes donnent deux modules.
- **Quand créer un module** : quand une responsabilité distincte apparaît (autres invariants, autre raison de changer). Pas un module par fonction ou par fichier. La complexité au sein d'une même responsabilité se traite en découpant le dossier interne.
- Plusieurs implémentations d'un même contrat peuvent cohabiter dans un module (par exemple SQLite et PostgreSQL).
- Un module peut rester interne : utilisé par d'autres modules, jamais exposé par la DI.
- Le consommateur reçoit le plus petit contrat utile (`Repository["todo"]` plutôt que `Repository`).

## Service

- **Stateless** : il porte la logique, pas les données. Aucune donnée évolutive (session, cache, compteur, brouillon) n'est capturée dans sa fabrique.
- Les données conservées entre appels viennent d'un contrat injecté (repository, port mémoire) ou de l'état passé en argument.
- Les dépendances (autres contrats, configuration immuable) sont injectées à la construction. Les données propres à un appel sont passées en arguments.

## Import ou injection

Critère : un test voudrait-il remplacer cette dépendance ? Oui : injection. Non : import direct.

- **Injection** (contrat reçu par la fabrique, composé dans la DI) : un autre service, tout ce qui porte un effet de bord ([code](code.md#style)), un état ou plusieurs implémentations possibles, adapter compris.
- **Import direct** : fonctions pures et déterministes, types, schémas, constantes (`createAppError`, `appErrors`, schémas Zod), adapter d'une librairie pure. Le test les exécute réellement.
- Un module de fonctions pures n'a ni fabrique ni entrée dans la DI.
- Créer un [adapter](#adapters) et l'injecter sont deux décisions distinctes : ce critère ne décide que de l'injection.

Exemple : `createProjectService(api)` reçoit l'API (réseau) par la DI, mais importe `readErrorText` (fonction pure).

## DI

`services/di.ts` est le seul point d'exposition des services vers l'infra.

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

Par défaut, toute librairie externe consommée par le système est encapsulée dans un adapter, dès que c'est faisable proprement : `services/adapters/<module>/`.

- Un adapter est un module : `<module>-types.ts` (contrat public, neutre) + une implémentation par librairie (`dayjs-date-utils-service.ts`).
- Il n'expose que ce que consomment les services. Un besoin technique hors de ce contrat va dans un autre adapter dont le thème correspond, ou dans `components/` s'il sert seulement l'affichage.
- Le contrat est la seule chose connue du système. Changer de librairie = écrire une nouvelle implémentation du même contrat et changer le choix dans la DI, ou l'import si l'adapter n'est pas injecté.
- Nommer le module par sa capacité (`date-utils`, `repository`, `http-client`), pas par la librairie.
- Exception : librairie qui ne s'encapsule pas proprement (Zod, voir [code](code.md#validation)). Choisir les librairies avec parcimonie.

## Infra et système

Deux sens à distinguer :

- **Librairie consommée par le système** (dayjs, driver SQL, fetch) : derrière un adapter.
- **Infra qui consomme le système** (Express, routes, React, TanStack) : hors de `services`. Elle démarre, reçoit les entrées, appelle les services de la DI et traduit les sorties (HTTP, rendu). Elle ne porte aucune décision métier.
- Cas mixte : si des services ont besoin d'une capacité de l'infra (lire un en-tête, poser un cookie), créer un adapter dont le contrat est neutre et dont l'implémentation utilise Express. Le service ne voit que le contrat.

## Monorepo et monolithe

- **Monorepo** : un package `core` partage entre apps (API, front) des modules de même forme, sans DI :
  - `<domaine>-types.ts` : types, schémas, contrats ;
  - `<domaine>-service-impl-base.ts` (facultatif) : implémentation de base de l'interface publique, étendue par le module de l'application ;
  - `<domaine>-service.ts` (facultatif, à la place de l'implémentation de base) : fonctions pures partagées, par exemple `errors` (`createAppError`).
  - `core` ne dépend d'aucune app ni d'aucune infra.
- **Monolithe** : pas de core. `services/` porte la logique serveur, `services-front/` la logique d'affichage. Chacun a ses modules, ses adapters et sa DI.
