# Storybook

Storybook catalogue les components stateless ([guideline 1.2.10.1](../../../guideline/architecture.md#12101-storybook)). Trois groupes : Mockup, Common, Business.

Les stories vivent dans `<app-interface>/src/`, à côté de ce qu'elles montrent : `<nom>.stories.tsx` près du component. Jamais importées par l'application, leurs fichiers sont exemptés des règles de component (aucun état interdit, librairies de test et de Storybook admises). Trois racines :

- **Mockup** : maquettes faites en phase de conception, avant de toucher aux pages (propositions de design, directions visuelles). Elles vivent dans `components/mockup/<domaine>/`, vues et stories ensemble, avec des vues stateless et des données fictives. Rien en dehors de `mockup/` ne l'importe, l'application jamais. `mockup` est un nom réservé : aucun domaine ne le porte.
- **Common** : stories de `components/common/` (inputs, espacements, cartes, layout), à côté de chaque component.
- **Business** : stories de `components/<domaine>/`, les affichages des fonctionnalités utilisateur, à côté de chaque component.

Dès qu'une proposition est intégrée à l'application, ses vues et leurs stories rejoignent `components/` (donc Common ou Business) et le dossier `mockup/` correspondant est supprimé.

Une story par état utile (vide, chargement, erreur, contenu long), déterministe, sans séquence d'interactions (sauf [démo](#démo)).

Un **scénario** regroupe les étapes d'un parcours (ex. liste, confirmation, liste après suppression) : un groupe `Business/<Domaine>/Scénario <nom>`, une story statique par étape nommée `1. …`, `2. …`, sans interaction. Il vit dans son propre fichier `<scenario>-scenario.stories.tsx`, dans le dossier du domaine à côté des stories d'états, et réutilise leurs fixtures plutôt que de redéfinir un état déjà couvert. Les stories restent un catalogue visuel ; elles sont rejouées par les [tests UI](tests.md#tests-ui), qui portent les parcours. Les fixtures de stories (`<domaine>-story-fixtures.ts`) vivent à côté d'elles et sont partagées avec ces tests.

## Démo

Une **démo** est une story à interactions (`play` function) qui rejoue un parcours complet sur une **page**, comme une vidéo à regarder dans Storybook (panneau Interactions, rejouable).

- **Uniquement sur demande explicite de l'utilisateur** : jamais créée d'office, ni par l'IA de sa propre initiative.
- Services en mémoire, aucun réseau : mêmes mocks que les tests UI, partagés dans un fichier `<domaine>-demo-fixtures.tsx`.
- Groupe `Business/<Domaine>/Démo <nom>`, fichier `<nom>-demo.stories.tsx`, dans `components/<domaine>/`.
- Lecture ralentie : `userEvent.setup({ delay })` de `storybook/test` (helper partagé `.storybook/demo-setup.ts`) et `step()` pour nommer les étapes.
- Visuelle seulement : les tests UI ne la rejouent pas, les parcours y sont testés avec `user-event`.
