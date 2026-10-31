# 1.3 Vérification automatique

Les règles de `1.1` et `1.2` sont vérifiées automatiquement par trois outils.

- **Lint** : contrôle le code et l'architecture.
- **Prettier** : formate le code.
- **Husky** : lance lint et Prettier avant chaque commit.

## 1.3.1 Rôle de l'IA

Elle vérifie que ces outils sont présents. S'il en manque, elle les met en place.

## 1.3.2 Règles de lint

Elles sont générées à partir de [code.md](code.md) et de [architecture.md](architecture.md). Seules les règles vérifiables automatiquement sont générées.
