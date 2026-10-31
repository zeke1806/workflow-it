# 2 Workflow

Les règles pour travailler : création de branche, où travailler, et comment.

## 2.1 Nommage d'une spec

Une spec se nomme `scrum-N`, avec `N` l'horodatage de sa création au format `YYMMDDHHmm`. Exemple : `scrum-2610311349` pour le 31 octobre 2026 à 13:49.

## 2.2 Méthodologie

Le reste du workflow suit la méthodologie des skills de Matt Pocock.

## 2.3 Dépendances

Le workflow dépend de deux plugins :

- Matt Pocock skills (`mattpocock-skills`)
- Impeccable (`impeccable`)

Ils sont déclarés dans `dependencies` de [plugin.json](../.claude-plugin/plugin.json). Le plugin Impeccable sert pour l'interface.
