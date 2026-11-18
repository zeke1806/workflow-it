# Storybook

Pour le front, Storybook catalogue les components stateless ([components](front.md#components-et-pages)), en trois groupes : Mockup (maquette non intégrée au système), Common (élément réutilisable), Business (élément métier, fonctionnalité métier).

Les stories vivent dans `<app-interface>/src/`, à côté de ce qu'elles montrent : `<nom>.stories.tsx` près du component. Jamais importées par l'application, leurs fichiers sont exemptés des règles de component (aucun état interdit, librairies de test et de Storybook admises). Trois groupes (racines) :

- **Mockup** : maquettes faites en phase de conception, avant de toucher aux pages (propositions de design, directions visuelles). Elles vivent dans `components/mockup/<domaine>/`, vues et stories ensemble, avec des vues stateless et des données fictives. Rien en dehors de `mockup/` ne l'importe, l'application jamais. `mockup` est un nom réservé : aucun domaine ne le porte.
- **Common** : stories de `components/common/` (inputs, espacements, cartes, layout), à côté de chaque component.
- **Business** : stories de `components/<domaine>/`, les affichages des fonctionnalités utilisateur, à côté de chaque component.

Dès qu'une proposition est intégrée à l'application, ses vues et leurs stories rejoignent `components/` (donc Common ou Business) et le dossier `mockup/` correspondant est supprimé.

Une story par état utile (vide, chargement, erreur, contenu long), déterministe, sans séquence d'interactions (sauf [démo](#démo)). Les stories d'états sont rejouées par les [tests UI](tests.md#tests-ui). Leurs fixtures (`<domaine>-story-fixtures.ts`) vivent à côté d'elles et sont partagées avec ces tests.

Les parcours (enchaînement d'écrans et d'interactions) ne se décrivent pas en stories statiques étape par étape : ce sont des [démos](#démo).

## Démo

Une **démo** est une story à interactions (`play` function) qui rejoue un parcours complet sur un **container** ([containers](front.md#components-et-pages)). Elle sert deux fois, avec le même code : vidéo à regarder dans Storybook (panneau Interactions, rejouable) et test de parcours rejoué par les [tests UI](tests.md#tests-ui).

- **Une démo par scénario de la spec** (parcours utilisateur, cas d'erreur compris) : l'IA les écrit d'office avec le front, sans attendre de demande.
- Le container est rendu tel quel, avec les services de la DI sur des implémentations en mémoire et des bindings factices (navigation) : aucune gestion d'état réécrite dans la story, aucun routeur. Tout est mocké, aucun effet de bord (réseau, horloge réelle, stockage) : mocks et données dans un fichier `<domaine>-demo-fixtures.tsx`, partagé avec les tests UI.
- Un fichier par scénario, `<scenario>-demo.stories.tsx`, dans `components/<domaine>/`. Titre sous Business avec préfixe visible : `Business/<Domaine>/▶ Démo · <scénario>`.
- `step()` nomme les étapes ; les vérifications sont des `expect` de `storybook/test` (rôles, libellés, textes), qui font échouer le test UI.
- Rythme : l'utilisateur vient du helper partagé `.storybook/demo-setup.ts` (`demoUser()`, `userEvent.setup({ delay })` de `storybook/test`). Délai réaliste dans Storybook, nul sous Vitest (`import.meta.env.MODE === "test"`) pour des tests rapides.
