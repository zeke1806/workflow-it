---
name: cu-archi
description: Guider le codage et l'architecture selon CU Archi - code fonctionnel, immuable et lisible, services modulaires (types + implémentation) composés par une DI singleton, librairies externes derrière des adapters, front en services-front / components / pages (routes), Storybook Mockup-Common-Business et tests Vitest par spec. Utiliser quand le projet adopte CU Archi ou que l'utilisateur demande de suivre cette architecture.
---

# CU Archi

## Triggering

Utiliser sur demande de CU Archi ou dans un projet dont les instructions adoptent cette architecture. Pour une simple question, répondre sans imposer l'architecture.

## Scope

Le [guideline](../../guideline/README.md) est la source de vérité : en cas de conflit avec ce skill, il prime. Le skill n'y change rien ; un écart ou une lacune se signale à l'utilisateur.

Résumé des règles, détail dans les références :

1. **Code** : fonctionnel, immuable, lisible ; consommatrice au-dessus de la consommée ; fichiers en kebab-case, sous-extensions admises. [Code](references/code.md)
2. **Erreurs** : valeur ou `throw { message, description, status? }`, jamais `null` ; catalogue central, `message` anglais. [Erreurs](references/code.md#erreurs)
3. **Modules** : logique dans `services/`, un module = `<module>-types.ts` + `<module>-service.ts` (interface + fabrique, aucune fonction exportée en vrac), rien d'autre à sa racine hors variantes ; une fonction va dans le module qui l'utilise. [Modules](references/services.md#modules)
4. **Services** : stateless ; une app injecte ses modules par sa DI ; le pur partagé vit dans le core et s'importe (`core`) ; tout module non pur, du core compris (horloge, aléa…), est injecté. [Service](references/services.md#service), [import ou injection](references/services.md#import-ou-injection)
5. **DI** : `services/di.ts` par app et `di.ts` du core, singletons, composition seulement, exposition minimale. [DI](references/services.md#di)
6. **Adapters** : toute librairie externe derrière `services/adapters/<module>/` ; si elle s'encapsule difficilement, le signaler et laisser l'utilisateur trancher. [Adapters](references/services.md#adapters)
7. **Infra** : elle consomme le système, hors de `services`. [Infra](references/services.md#infra-et-système)
8. **Core** : modules purs partagés (package en monorepo, dossier `core/` en monolithe), DI propre et singleton `core` importé directement ; `exports` limité à `core` et aux types. [Core](references/services.md#core)
9. **Front** : `services-front`, stateless, état stocké par le framework via un adapter. [Services front](references/front.md#services-front)
10. **Vues** : `components/` visuels, sans état, pilotés par props ; la page (route) câble component et service. [Components et pages](references/front.md#components-et-pages)
11. **Storybook** : stories près des components ; Mockup, Common, Business ; états et scénarios, démo sur demande. [Storybook](references/storybook.md)
12. **Vérification** : lint et Prettier présents, sinon à mettre en place ; règles de lint générées du guideline. [Contrôle automatique](references/code.md#contrôle-automatique)
13. **Tests** : Vitest par spec dans `tests/`, un `describe` par application, tout mocké, jamais e2e ni navigateur réel ; tests UI en DOM simulé (`-ui.spec.tsx`). [Tests](references/tests.md)
14. **Sécurité** : aucun secret ni donnée sensible exposés, entrées externes validées à la frontière, nouvelle dépendance justifiée et signalée. [Guideline 1.1.2.7](../../guideline/code.md#1127-sécurité)

Les technologies de base sont fixées par le [guideline 1.4](../../guideline/README.md#14-technologies-de-base).

Le code touché suit la norme, sans arrêt ni accord préalable. En fin de tâche, lister en 1 à 3 lignes les écarts à l'architecture vus dans le code non touché ; n'harmoniser que sur demande de l'utilisateur.

## Workflow

1. Lister les modules touchés, leur rôle et leurs interactions.
2. Écrire ou ajuster les contrats (`*-types.ts`) et les erreurs.
3. Implémenter les services ; encapsuler chaque librairie externe dans un adapter.
4. Front : services-front, components sans état, pages ([front](references/front.md)), stories d'états ([Storybook](references/storybook.md)) et tests UI ([tests](references/tests.md#tests-ui)).
5. Composer dans la DI, câbler l'infra (routes, pages), puis tester par spec ; vérifier que lint et Prettier existent et mettre à jour le [contrôle automatique](references/code.md#contrôle-automatique) du projet.

## Références

- [Code](references/code.md) : style, immutabilité, ordre, nommage, erreurs.
- [Services](references/services.md) : modules, DI, adapters, infra, core, monolithe.
- [Front](references/front.md) : services-front, components, pages.
- [Storybook](references/storybook.md) : Mockup, Common, Business, états, scénarios, démo.
- [Tests](references/tests.md) : Vitest, dossiers par spec, isolation.
- [Projet de référence](assets/reference-project/README.md) : to-do TypeScript, monorepo PNPM, API Express, front TanStack Start, Storybook.
