# 1.2 Architecture

Les règles d'architecture que l'IA applique. Elles rapprochent la Clean Architecture et l'Onion Architecture de l'architecture de la todo de référence (`skills/cu-archi/assets/reference-project/`).

## 1.2.1 Principe

Tout dépend du centre, jamais l'inverse.

## 1.2.2 Les trois zones

- **Contrats** : types, schémas, interfaces des services. Aucune dépendance.
- **Services** : toute la logique. Ils ne dépendent que des contrats.
- **Bords** : tout ce qui touche le monde réel. Ils dépendent des services et des contrats, sans aucune décision métier.
  - **Adapters** : librairies externes consommées par le système (base de données, `fetch`, dates) derrière un contrat neutre.
  - **Infra** : ce qui consomme le système (Express, React, routes).

## 1.2.3 Règles de dépendance

- Le sens est toujours : contrats ← services ← bords.
- Un service ne connaît ni Express, ni React, ni la base de données.
- Une librairie externe n'apparaît que dans un adapter. Des exceptions peuvent exister, quand une librairie ne s'encapsule pas proprement. Exemples approuvés : Zod (schémas utilisés directement dans les types), une librairie de classes CSS. La liste n'est pas limitative, mais ce sont des exceptions, pas la règle.
- Le sens inverse passe par un contrat implémenté à l'extérieur et injecté.

## 1.2.4 Modules

- Un module correspond à un domaine (`todo`, `project`) ou à une capacité technique (`repository`, `date-utils`).
- Un module = `<module>-types.ts` (contrat) + `<module>-service.ts` (logique).
- Si `<module>-service.ts` devient trop gros, il devient un dossier `<module>-service/` avec un `index.ts` comme seule entrée publique et un fichier par opération (`create.ts`, `list.ts`…). Les fichiers internes ne sont jamais importés de l'extérieur.
- Un module expose une seule interface publique.
- Le consommateur reçoit le plus petit contrat utile.

## 1.2.5 Services et injection

- Un service est stateless : il porte la logique, pas les données.
- Injection si un test voudrait remplacer la dépendance (effet de bord, état, autre service, adapter). Import direct pour le pur (types, schémas, constantes, fonctions pures).
- La DI vit dans un seul `di.ts`, singleton, qui fait de la composition seulement (choisir les implémentations, appeler les fabriques) et n'expose que le nécessaire.

## 1.2.6 Données et erreurs

- Les données aux frontières sont des schémas partagés et `readonly`, jamais un objet de la base ou d'une librairie.
- Les erreurs viennent d'un catalogue central, avec la forme `{ message, description, status? }`.

## 1.2.7 Forme du projet

### 1.2.7.1 Monorepo

- `packages/core` : contrats, schémas, erreurs. Aucune dépendance vers une app, pas de DI.
- `apps/api` : services, adapters, DI, routes.
- `apps/web` : services front, adapters, DI, components, pages.

### 1.2.7.2 Monolithe

- Pas de `core`.
- `services/` porte la logique serveur, `services-front/` la logique d'affichage. Chacun a ses modules, ses adapters et sa DI.

## 1.2.8 API

- Contrats : `core` (monorepo) ou `<module>-types.ts`.
- Services dans `services/<module>/`, adapters dans `services/adapters/`.
- Les routes sont de l'infra : elles valident l'entrée, appellent le service via la DI et traduisent la sortie en HTTP.

## 1.2.9 Front

- **Services front** : logique d'affichage (état d'écran, chargements, erreurs, navigation), souvent stateful via un adapter qui encapsule le framework.
- **Components** : purement visuels, sans état, pilotés par props.
- **Pages** : exposées par les routes, elles valident l'URL et câblent directement les components au service front. Il n'y a pas de couche intermédiaire.

## 1.2.10 Testing

### 1.2.10.1 Storybook

Pour le front, Storybook catalogue les components stateless. Trois groupes :

- **Mockup** : maquette non intégrée au système.
- **Common** : élément réutilisable.
- **Business** : élément métier, fonctionnalité métier.

### 1.2.10.2 Tests unitaires et d'intégration

Avec Vitest, sans effet de bord (donc rapides). Un seul dossier `tests/` à la racine du projet, pour avoir accès à tout.

### 1.2.10.3 Organisation

Une spec = un dossier de test, par exemple `tests/scrum-2610311411/`.

### 1.2.10.4 Méthode

Les tests suivent la méthode de Matt Pocock.

### 1.2.10.5 Tests d'affichage

Si la spec contient de l'affichage, il est testé avec le DOM virtuel `happy-dom` et `@testing-library/user-event`.

### 1.2.10.6 Écriture des tests

Un test est numéroté `x`, `x.x`, `x.x.x`, écrit en français et parlant.

## 1.2.11 Nommage de fichier

En kebab-case : tout en minuscules, mots séparés par des tirets. Les sous-extensions sont admises, par exemple `.storybook.ts`.
