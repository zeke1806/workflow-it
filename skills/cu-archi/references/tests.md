# Tests

Le [guideline](../../../guideline/architecture.md#1210-testing) fixe le cadre (1.2.10) ; ce document le détaille. Les tests suivent la méthode de Matt Pocock (skill `tdd`) : un comportement à la fois, rouge puis vert.

## Runner et emplacement

- **Vitest** : rapide, compatible TypeScript sans configuration lourde.
- Tous les tests vivent dans `tests/` à la racine (monolithe) ou à la racine ou dans un package dédié (`packages/tests`) en monorepo. Il a accès à tous les packages et applications.
- Deux projets Vitest réunis par `projects` dans la config racine : une seule commande lance tout. L'extension choisit l'environnement, un fichier n'en a qu'un :
  - **node** : `tests/**/*-{tdd,business}.spec.ts`, tests de logique.
  - **ui** : `tests/**/*-ui.spec.tsx`, tests de [DOM](#tests-ui) simulé (`happy-dom`).
- Inclus dans le contrôle TypeScript du projet.
- Nommage selon le [code](code.md#nommage).

## Organisation

Un dossier par spec, nommé par son identifiant (`scrum-<YYMMDDHHmm>`, par exemple `scrum-2610241735`). Aucun dossier hors spec :

```
tests/
  scrum-2610241735/
    scrum-2610241735-tdd.spec.ts        # tests écrits par l'IA au fil de l'implémentation
    scrum-2610241735-business.spec.ts   # tests métier, très lisibles, pour relecture humaine
    scrum-2610241735-ui.spec.tsx        # tests de DOM (components, scénarios, pages)
    scrum-2610241735-fixtures.ts        # mocks, fixtures, préparation (si besoin)
  isolation-setup.ts            # isolation partagée
  ui-setup.ts                   # nettoyage du DOM entre les tests
```

- Cinq fichiers maximum par dossier. Le fichier `fixtures` garde la mécanique hors des fichiers de tests ; `scrum-N-ui-fixtures.tsx` n'existe que si les mocks du DOM contiennent du JSX ou sont volumineux.
- Le fichier `business` décrit les comportements attendus en langage métier, sans détail technique dans les intitulés.
- Le fichier `business` n'est créé que si les intitulés du fichier `tdd` ne sont pas déjà compréhensibles par un lecteur métier non technique ; sinon `tdd` suffit. Le fichier `ui` n'a pas de variante `business`.
- Le test d'une correction avant merge ne crée pas de dossier : il va dans le dossier `scrum-N`, dans une section numérotée du `describe` de l'application concernée (ex. `3. Correction : titre`).
- Une demande purement documentaire se vérifie par relecture, pas par des tests qui assertent du texte.

## Écriture

- En français. Les termes techniques restent en anglais (`mock`, `fixture`, `service`, `status`).
- `describe` racine = identifiant et titre de la spec : `SCRUM-2610241735 : Enregistrer une partie`.
- Fichiers `tdd` et `business` : un `describe` par application ou package testé, nommé comme son dossier (`api`, `web`, `core`, `mobile`…), même s'il n'y en a qu'un. Il n'est pas numéroté et ne compte pas dans les niveaux.
- Numérotation hiérarchique dans chaque application, trois niveaux maximum : `1`, `1.1`, `1.1.1`. Elle redémarre à `1` dans chaque application.
- Fichier `ui` : pas de `describe` d'application, les sections numérotées suivent directement le `describe` racine.

```ts
describe("SCRUM-2610241735 : Enregistrer une partie", () => {
  describe("api", () => {
    describe("1. Création", () => {
      it("1.1 refuse un titre vide avec Invalid input", async () => {
        // ...
      });
    });
  });

  describe("web", () => {
    describe("1. Formulaire", () => {
      it("1.1 ...", () => {
        // ...
      });
    });
  });
});
```

## Tests UI

Ils donnent à l'IA un retour sur l'affichage et les parcours, sans navigateur. Un fichier `<identifiant>-ui.spec.tsx` dans le dossier de la spec, même écriture et même isolation que les autres tests (le fichier d'isolation est partagé).

- **Environnement** : projet Vitest `ui`, DOM simulé (`happy-dom`), Testing Library, `ui-setup.ts` pour le nettoyage. Le rendu visuel réel (CSS, mise en page) n'est pas testé : il se contrôle dans Storybook.
- **Components** : rejoués par leurs stories (`composeStories`), importées depuis l'application. Un état d'affichage a une seule source, la story ; le test vérifie ce qu'elle rend (rôles, textes) et les callbacks appelés.
- **Scénarios** : rejoués comme les stories d'états. Chaque étape est rendue et vérifiée ; le passage d'une étape à l'autre se teste avec `user-event` sur la page.
- **Pages** : rendues avec les services construits par la DI sur des implémentations mockées, dans un routeur en mémoire si la page navigue.
- **Interactions** : `@testing-library/user-event`. Éléments cherchés par rôle accessible ou libellé, jamais par classe CSS.
- Les séquences d'interactions vivent ici ; une story reste un état sans séquence. Seule exception : la [démo](storybook.md#démo) Storybook, visuelle et sur demande, que ces tests ne rejouent pas.

## Isolation

- Aucun effet de bord : pas de réseau, de serveur, de fichier, de base réelle (même SQLite en mémoire), d'horloge réelle.
- Tout est mocké derrière les contrats. On teste surtout les services, construits par la DI avec des implémentations mock : c'est la raison d'être de l'injection.
- Exception : l'implémentation d'un adapter de librairie pure (`dayjs`, par exemple) peut avoir un test de contrat qui l'exécute réellement. Un adapter à effet (SQL, réseau, fichier) reste mocké.
- Tests unitaires et d'intégration (plusieurs vrais modules assemblés en mémoire) uniquement. Jamais d'end-to-end ni de navigateur réel. Un DOM simulé en mémoire (`happy-dom`) est autorisé.
- Déterministes : pas de dépendance à l'ordre, pas d'état partagé entre suites, pas d'attente chronométrée.
- Les contrôles manuels sur l'application réelle se consignent à part et ne sont pas présentés comme des tests.
