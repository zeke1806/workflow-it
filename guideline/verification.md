# 1.3 Vérification automatique

Les règles de `1.1` et `1.2` sont vérifiées automatiquement par deux outils, lancés au commit de livraison par un hook du plugin.

- **Lint** : contrôle le code et l'architecture.
- **Prettier** : formate le code.

## 1.3.1 Rôle de l'IA

Elle vérifie que ces outils sont présents. S'il en manque, elle les met en place.

## 1.3.2 Règles de lint

Elles sont générées à partir de [code.md](code.md) et de [architecture.md](architecture.md). Seules les règles vérifiables automatiquement sont générées.

## 1.3.4 Prérequis du projet

Au démarrage de session, le plugin vérifie que le projet cible a de quoi travailler : dépôt Git, `package.json` avec les scripts `lint`, `format:check`, `test`, `build`, `check:architecture`, dépendances `eslint`, `prettier`, `vitest`, `typescript`, configurations ESLint et Prettier et `scripts/check-architecture.mjs`. Ce qui manque est signalé à l'IA, qui le met en place avant de travailler. Le plugin ne s'active que dans un projet dont le `CLAUDE.md` nomme `workflow-it-plugin`.

## 1.3.3 Moments de vérification

Le plugin les impose lui-même (`hooks/hooks.json`), sans réglage dans le projet cible :

- **À la livraison seulement** : avant le commit unique sur `claude/scrum-N`, vérifications complètes (`check`, `lint`, `format:check`, `test`, `build`, `build-storybook`, celles que le projet définit). Un échec bloque le commit. Si le lint est absent, le commit est bloqué jusqu'à sa mise en place.

Pendant le travail (commits des skills Matt Pocock), aucune vérification n'est imposée par le plugin.
