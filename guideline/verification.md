# 1.3 Vérification automatique

Les règles vérifiables de `1.1` et `1.2` sont contrôlées par deux outils. Au commit de livraison, un hook du plugin les lance, avec les tests et le build.

- **Lint** : contrôle le code et l'architecture.
- **Prettier** : formate le code.

## 1.3.1 Rôle de l'IA

Elle vérifie que ces outils sont présents. S'il en manque, elle les met en place.

## 1.3.2 Règles de lint

Elles sont générées à partir de [code.md](code.md) et de [architecture.md](architecture.md). Seules les règles vérifiables automatiquement sont générées.

## 1.3.3 Moments de vérification

Le plugin les impose lui-même (`hooks/hooks.json`), sans réglage dans le projet cible :

- **À la livraison seulement** : avant le commit unique sur `claude/scrum-N`, vérifications complètes (`check`, ou `lint` et `check:architecture` si le projet n'a pas `check`, puis `format:check`, `test`, `build`, celles que le projet définit). `check` est un raccourci qui regroupe `lint` et `check:architecture` ; l'IA peut l'ajouter au projet. Un échec ou un dépassement du budget de 9 minutes bloque le commit. Si le lint est absent, le commit est bloqué jusqu'à sa mise en place.

Avant ce commit, l'IA lance elle-même ces vérifications et les corrige : le hook reste un garde-fou. Elle lance aussi `build-storybook` si des stories ont changé ; le hook ne le lance pas.

Pendant le travail (commits des skills Matt Pocock), aucune vérification n'est imposée par le plugin.

## 1.3.4 Prérequis du projet

Au démarrage de session, le plugin vérifie que le projet cible a de quoi travailler : dépôt Git, `package.json` avec les scripts `lint`, `format:check`, `test`, `build`, `check:architecture`, dépendances `eslint`, `prettier`, `vitest`, `typescript` et configurations ESLint et Prettier. Ce qui manque est signalé à l'IA, qui le met en place avant de travailler. Le plugin ne s'active que dans un projet dont le `CLAUDE.md` ou l'`AGENTS.md` nomme `workflow-it-plugin`.
