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

## 2.4 Agents

Le plugin fournit deux agents, invoqués uniquement par le thread principal (jamais par un autre agent). Quand un process Matt Pocock délègue à un sous-agent, on regarde d'abord si l'un des deux convient.

| Tâche | Agent | Modèle |
| --- | --- | --- |
| Implémenter, explorer, chercher, exécuter | `generaliste` | Haiku 5.5, effort high |
| Vérifier, relire, conseiller | `controlleur` | Opus 5.5, effort medium |

Le `controlleur` est réservé à la vérification, à la revue et au conseil, pour économiser les tokens.

## 2.5 Livraison

Pendant le travail, les skills Matt Pocock s'appliquent strictement. À la fin seulement, on livre une seule branche `claude/scrum-N` portant un seul commit `SCRUM-N : titre`, et on nettoie les worktrees et branches créés pendant le travail.
