# Tests

Tests unitaires et d'intégration avec Vitest, sans effet de bord (donc rapides). Les tests suivent la méthode de Matt Pocock (skill `tdd`) : un comportement à la fois, rouge puis vert.

## Runner et emplacement

- **Vitest** : rapide, compatible TypeScript sans configuration lourde.
- Tous les tests vivent dans `tests/` à la racine du projet, monorepo compris. Il a accès à tous les packages et applications.
- Deux projets Vitest réunis par `projects` dans la config racine : une seule commande lance tout. L'extension choisit l'environnement, un fichier n'en a qu'un :
  - **node** : `tests/**/*.spec.ts`, tests de logique.
  - **ui** : `tests/**/*.spec.tsx`, tests de [DOM](#tests-ui) simulé (`happy-dom`).
- Inclus dans le contrôle TypeScript du projet.
- Nommage selon le [code](code.md#nommage).

## Organisation

`tests/` est le miroir des sources : chaque fichier qui porte de la logique a son fichier de test au même chemin, `src/` retiré.

```
apps/api/src/services/todo/todo-service/create.ts   →  tests/apps/api/services/todo/todo-service/create.spec.ts
apps/web/src/components/todo/todo-list-page.tsx     →  tests/apps/web/components/todo/todo-list-page.spec.tsx
packages/core/src/todo/todo-types.ts                →  tests/packages/core/todo/todo-types.spec.ts

tests/
  apps/…                        # miroir de apps/<app>/src/
  packages/…                    # miroir de packages/<package>/src/
  isolation-setup.ts            # isolation partagée
  ui-setup.ts                   # nettoyage du DOM entre les tests
```

- Un fichier de test par fichier source : `<fichier>.spec.ts`, ou `<fichier>.spec.tsx` pour un source `.tsx` (DOM simulé). En monolithe, le miroir part de la racine des sources de la même façon.
- Un fichier de test ne teste que le comportement de son fichier source. Tout fichier de test a son fichier source ; le [contrôle automatique](code.md#contrôle-automatique) le vérifie.
- Pas de test pour un fichier sans logique : types seuls, `index.ts` de réexport, styles, route qui ne fait que câbler.
- Fixtures (mocks, fixtures, préparation) : `<nom>-fixtures.ts` dans le dossier miroir, pour garder la mécanique hors des fichiers de tests. Partagées par plusieurs fichiers de test, elles montent dans leur plus proche dossier commun.
- Cas particuliers, règle par défaut à ajuster au jugement :
  - Assemblage de plusieurs modules (DI, routes HTTP) : fichier de test du fichier qui assemble (`di.spec.ts`, `app.spec.ts`).
  - Module découpé en plusieurs fichiers : fichier de test du fichier qui porte la logique ; si le comportement ne se teste que par le point d'entrée du module, fichier de test de ce point d'entrée (`index.spec.ts`).
  - Stories et scénarios rejoués : fichier de test du component ou de la page qu'ils montrent.
- Le test d'une correction avant merge ne crée pas de fichier : il va dans le fichier de test du fichier corrigé, dans une section numérotée (ex. `3. Correction : titre`).
- Une demande purement documentaire se vérifie par relecture, pas par des tests qui assertent du texte.

## Écriture

- En français et parlant. Les termes techniques restent en anglais (`mock`, `fixture`, `service`, `status`).
- `describe` racine = chemin miroir du fichier source, sans extension : `apps/api/services/todo/todo-service/create`.
- Numérotation hiérarchique sous le `describe` racine, trois niveaux maximum : `1`, `1.1`, `1.1.1`.
- Un sujet qui porte des règles métier les décrit en langage métier, sans détail technique dans les intitulés, lisible par un non-technicien en relecture.

```ts
describe("apps/api/services/todo/todo-service/create", () => {
  describe("1. Création", () => {
    it("1.1 refuse un titre vide avec Invalid input", async () => {
      // ...
    });
  });

  describe("2. Correction : titre normalisé", () => {
    it("2.1 retire les espaces autour du titre", async () => {
      // ...
    });
  });
});
```

## Tests UI

Ils donnent à l'IA un retour sur l'affichage et les parcours, sans navigateur. Un fichier `<fichier>.spec.tsx` au chemin miroir du component ou de la page, même écriture et même isolation que les autres tests (le fichier d'isolation est partagé).

- **Environnement** : projet Vitest `ui`, DOM simulé (`happy-dom`), Testing Library, `ui-setup.ts` pour le nettoyage. Le rendu visuel réel (CSS, mise en page) n'est pas testé : il se contrôle dans Storybook.
- **Components** : rejoués par leurs stories (`composeStories`), importées depuis l'application. Un état d'affichage a une seule source, la story ; le test vérifie ce qu'elle rend (rôles, textes) et les callbacks appelés.
- **Scénarios** : rejoués comme les stories d'états. Chaque étape est rendue et vérifiée ; le passage d'une étape à l'autre se teste avec `user-event` sur la page.
- **Pages** : rendues avec les services construits par la DI sur des implémentations mockées, dans un routeur en mémoire si la page navigue.
- **Interactions** : `@testing-library/user-event`. Éléments cherchés par rôle accessible ou libellé, jamais par classe CSS.
- Les séquences d'interactions vivent ici ; une story reste un état sans séquence. Seule exception : la [démo](storybook.md#démo) Storybook, visuelle et sur demande, que ces tests ne rejouent pas.

## Isolation

- Aucun effet de bord : pas de réseau, de serveur, de fichier, de base réelle (même SQLite en mémoire), d'horloge réelle.
- Tout est mocké derrière les contrats. On teste surtout les services, construits par la DI avec des implémentations mock : c'est la raison d'être de l'injection.
- Les services purs du core (`core`) ne sont jamais mockés : le test les exécute réellement. Un module non pur du core (horloge, aléa, identifiants…) est injecté par la DI de l'app, donc mocké comme les autres.
- Exception : l'implémentation d'un adapter de librairie pure (`dayjs`, par exemple) peut avoir un test de contrat qui l'exécute réellement. Un adapter à effet (SQL, réseau, fichier) reste mocké.
- Tests unitaires et d'intégration (plusieurs vrais modules assemblés en mémoire) uniquement. Jamais d'end-to-end ni de navigateur réel. Un DOM simulé en mémoire (`happy-dom`) est autorisé.
- Déterministes : pas de dépendance à l'ordre, pas d'état partagé entre suites, pas d'attente chronométrée.
- Les contrôles manuels sur l'application réelle se consignent à part et ne sont pas présentés comme des tests.
