# 1.1 Code

Les règles de code que l'IA applique : les règles par défaut (1.1.1), complétées par nos règles propres, qui peuvent en répéter certaines pour les rendre explicites.

## 1.1.1 Règles par défaut

Issues de Clean Code (Robert C. Martin) et de [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript).

### 1.1.1.1 Nommage

- Un nom révèle l'intention : il dit ce que c'est ou ce que ça fait.
- Un nom est prononçable et cherchable : pas d'abréviation cryptique, pas de littéral inexpliqué (utiliser une constante nommée).
- Un seul terme par concept (`getUser`, pas `getClientData` et `getUserInfo`).
- Pas de mapping mental : pas de `i`, `x`, `d` hors boucle triviale.
- Pas de contexte redondant (`car.color`, pas `car.carColor`).
- Une fonction a un nom verbe qui dit l'action. Un booléen ou une condition s'écrit en forme positive (`isPresent`).

### 1.1.1.2 Fonctions

- Petite, une seule chose, un seul niveau d'abstraction.
- 2 arguments maximum ; au-delà, passer un objet.
- Pas de flag booléen en paramètre : écrire deux fonctions.
- Valeurs par défaut dans la signature.
- Pas d'effet de bord caché : pas de mutation des entrées, pas d'écriture globale. Les effets inévitables sont centralisés.
- Condition complexe extraite dans une fonction nommée et écrite en positif. Polymorphisme plutôt que longues chaînes de `if`/`switch`.
- Style fonctionnel (`map`, `filter`, `reduce`) plutôt que boucle impérative quand c'est plus lisible.
- L'appelant est au-dessus de l'appelé : le fichier se lit de haut en bas.

### 1.1.1.3 Types et données

- Pas de vérification de type manuelle : API cohérente et TypeScript.
- Données exposées via getters/setters ou membres privés quand il faut valider ou protéger.
- Pas de `null` retourné, pas de valeur magique.

### 1.1.1.4 Classes et structure

- Petites, forte cohésion, une seule responsabilité.
- Composition plutôt qu'héritage, sauf vraie relation « est un ».
- SOLID :
  - SRP : une seule raison de changer.
  - OCP : étendre sans modifier l'existant.
  - LSP : un sous-type remplace son type de base sans casser le comportement.
  - ISP : pas de dépendance à ce qu'on n'utilise pas.
  - DIP : dépendre d'abstractions, injecter les dépendances.

### 1.1.1.5 Gestion d'erreurs

- Exceptions plutôt que codes de retour.
- Aucune erreur ignorée : chaque `catch` déclenche une réponse délibérée (log, remontée, notification).
- Promesse rejetée traitée comme une exception.
- `async/await` plutôt que callbacks ou chaînes de Promises.

### 1.1.1.6 Commentaires

- Le code s'explique seul. Commenter le *pourquoi* d'une logique métier complexe, jamais le *quoi*.
- Pas de code commenté, pas de commentaire journal (`git log` sert à ça), pas de marqueur de position.

### 1.1.1.7 Formatage

- Style cohérent, appliqué par un outil (formateur, linter), jamais débattu.
- Capitalisation uniforme : constantes, classes, fonctions.

### 1.1.1.8 Tests

- Un concept par test.
- F.I.R.S.T. : rapides, indépendants, répétables, auto-vérifiants, écrits à temps.
- Tests propres, avec la même exigence de lisibilité que le code.
- Toute fonctionnalité a ses tests ; couverture élevée avant livraison ou refactor.

### 1.1.1.9 Hygiène générale

- DRY, mais seulement avec une abstraction juste : ni duplication, ni abstraction prématurée.
- KISS et YAGNI : le plus simple qui marche, rien « au cas où ».
- Pas de sur-optimisation : mesurer, puis optimiser les goulots connus.
- Supprimer le code mort (git le garde).
- Règle du boy-scout : laisser le code plus propre qu'on l'a trouvé.

### 1.1.1.10 Notes

- Le repo source est centré JavaScript. Les règles 1.1.1.3 (types) et 1.1.1.5 (async) sont à adapter à la stack (TypeScript, Vitest).
- « 2 arguments maximum » et « petites fonctions » sont des heuristiques : défaut à respecter, exception possible si justifiée.

## 1.1.2 Nos règles propres

Nos règles de code, en complément des règles par défaut.

### 1.1.2.1 Lisibilité

Le code doit être très lisible, comme on lit une phrase.

### 1.1.2.2 Une fonction, une seule chose

Une fonction fait une seule chose.

### 1.1.2.3 Pas de classe sauf besoin technique

Ne pas utiliser de classe, sauf besoin technique. Les principes objet sont acceptés, mais à mettre en œuvre avec des fonctions.

### 1.1.2.4 Composition

Préférer la composition.

### 1.1.2.5 Fonction consommatrice au-dessus de la fonction consommée

Dans un fichier, la fonction consommatrice est placée au-dessus de la fonction qu'elle consomme.

### 1.1.2.6 Immutabilité et fonctions pures

Suivre la règle de l'immutabilité et écrire des fonctions pures.
