# Workflow it

Plugin Claude Code qui encadre le développement IT assisté par l'IA : un workflow par spec `scrum-N` (skill `cu-workflow`), une architecture de code (skill `cu-archi`) et des vérifications automatiques (hooks).

Les skills sont la source de vérité des règles que l'IA suit. Pour les lire :

| Règle | Fichier |
| --- | --- |
| Vue d'ensemble de l'architecture, technologies de base | [cu-archi/SKILL.md](skills/cu-archi/SKILL.md) |
| Code (Clean Code, règles propres, nommage, erreurs, sécurité) | [code.md](skills/cu-archi/references/code.md) |
| Vérification automatique (lint, Prettier, hooks, prérequis) | [code.md#contrôle-automatique](skills/cu-archi/references/code.md#contrôle-automatique) |
| Architecture : zones, modules, services, DI, adapters, core, API | [services.md](skills/cu-archi/references/services.md) |
| Front : services front, components, pages | [front.md](skills/cu-archi/references/front.md) |
| Storybook | [storybook.md](skills/cu-archi/references/storybook.md) |
| Tests | [tests.md](skills/cu-archi/references/tests.md) |
| Workflow, méthodologie, agents | [cu-workflow/SKILL.md](skills/cu-workflow/SKILL.md) |
| Nommage `scrum-N`, fichiers de suivi, commits | [suivi-local.md](skills/cu-workflow/references/suivi-local.md) |
| Livraison | [livraison.md](skills/cu-workflow/references/livraison.md) |
| Correction avant merge | [correction.md](skills/cu-workflow/references/correction.md) |
| Artefacts générés | [artefacts.md](skills/cu-workflow/references/artefacts.md) |

## Installation

```sh
claude plugin marketplace add zeke1806/workflow-it
claude plugin install workflow-it-plugin@workflow-it --scope project
```

Ou dans Claude Code : `/plugin marketplace add zeke1806/workflow-it` puis `/plugin install workflow-it-plugin@workflow-it`.

Les plugins Matt Pocock (`mattpocock-skills`) et Impeccable (`impeccable`) sont installés avec lui en dépendances. S'il en manque un, le plugin ne se charge pas et ses hooks ne bloquent rien.

Demander à l'IA de l'installer fonctionne aussi : « installe le plugin `workflow-it-plugin` depuis `zeke1806/workflow-it` ».

## Activation dans un projet

Ajouter au `CLAUDE.md` du projet :

```md
Ce projet utilise le plugin `workflow-it-plugin` : suivre CU Workflow (specs `SCRUM-N`) et CU Archi (architecture).
```

La livraison part de la branche courante au lancement de la réalisation (`develop`, `claude/scrum-Y`…) et la PR y revient. Le cadrage n'a pas besoin d'être commité.

Sans cette mention, les hooks restent inactifs. Avec elle :

- au démarrage, le plugin signale ce qui manque au projet (lint, Prettier, scripts, contrôle d'architecture) ;
- au push de livraison de `claude/scrum-N` seulement, vérifications complètes, bloquantes. Les commits du travail (skills Matt Pocock) ne sont pas contrôlés.

## Contenu

- `skills/cu-workflow` : réalisation d'une spec `SCRUM-N`, livrée en un seul commit.
- `skills/cu-archi` : architecture et code, avec un projet d'exemple (`assets/reference-project`).
- `agents/` : `generaliste` (exécution) et `controlleur` (vérification et conseil).
- `hooks/` : vérifications automatiques.
