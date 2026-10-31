# Front

## Services front

Mêmes règles que les [services](services.md) : modules types + implémentation, adapters, DI singleton. En monolithe, dossier `services-front/` ; en app séparée, `services/` de l'app front.

- Un service front porte la **logique d'affichage** : état d'écran, chargements, erreurs, transitions, intentions de navigation.
- Il est souvent **stateful** : il respecte l'interface publique de câblage à la réactivité du framework, qui lui fournit l'état, sa lecture et sa mise à jour.
- Ce câblage est un adapter (`services/adapters/stateful/`) : contrat neutre (`stateful-types.ts`) + implémentation du framework (`react-stateful-service.ts`). Le service ne connaît ni React ni le routeur.
- Forme de référence :

```ts
// services/adapters/stateful/stateful-types.ts
export interface StateConnector<State, Bindings = undefined> {
  readonly getState: () => State;
  readonly setState: (update: (state: State) => State) => void;
  readonly bindings: Bindings; // contexte d'écran, intentions de navigation
  readonly isActive: () => boolean; // faux après démontage : plus aucune écriture
}

export interface StatefulService<State, Actions, Bindings = undefined> {
  readonly createInitialState: (bindings: Bindings) => State;
  readonly connect: (connector: StateConnector<State, Bindings>) => Actions;
}

// page :
// const { state, actions } = useStatefulService(todoService, bindings);
// useServiceLifecycle(actions.load, actions.cancelLoad);
```
- `createInitialState` et `connect` restent purs : aucune requête ni navigation pendant le rendu.
- Les comportements passent par l'état (ouvrir, confirmer, annuler, charger) plutôt que par des commandes impératives dans la page. Seule exception admise dans un component : synchroniser une API native impérative (dialog, focus) avec une prop d'état, par un `useEffect` sans état propre (ex. `useNativeDialog` de `Modal`). Elle n'entre pas dans l'adapter `stateful`, et ne couvre ni `useState`, ni requête, ni décision : tout autre besoin passe par un service.

## Components et pages

```
components/
  common/      # primitives sans sens produit : inputs, boutons, cartes, layout, espacements
  todo/        # vues d'un domaine, avec leurs stories et fixtures de stories
  mockup/      # maquettes de conception par domaine (jamais importées hors de mockup/)
routes/        # pages : câblent component + service
```

- **components** : purement visuels, pilotés par props et callbacks. Aucun état (`useState`, `useReducer`), même purement visuel (accordéon, onglet) : il vit dans un champ d'état d'un service front, qui peut regrouper les états visuels d'un écran, et le component reçoit par exemple `open` et `onToggle` en props. Pas de requête, pas de logique de service. La dérivation au rendu depuis les props est autorisée. Seule exception : la synchronisation d'une API native (voir [Services front](#services-front)). Chaque component a ses stories, dans son dossier (voir [Storybook](storybook.md)).
- **routes (pages)** : la page est la route. Elle valide les paramètres d'URL, reçoit uniquement le service utile depuis la DI et câble directement le component au service front (souvent stateful) via l'adapter, en fournissant les bindings du framework (navigation, paramètres de route). Aucune décision de transition. Pas de couche intermédiaire entre route et component.
- Organisation par domaine métier, comme les services. `components/common/` seulement pour les éléments vraiment génériques.
