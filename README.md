# Workflow it

Plugin Claude Code qui encadre le développement IT assisté par l'IA : un workflow par spec `scrum-N` (skill `cu-workflow`), une architecture de code (skill `cu-archi`) et des vérifications automatiques (hooks).

Les règles que l'IA suit sont décrites pour les humains dans le [guideline](guideline/README.md).

## Installation

```sh
claude plugin marketplace add zeke1806/workflow-it
claude plugin install workflow-it-plugin@workflow-it --scope project
```

Ou dans Claude Code : `/plugin marketplace add zeke1806/workflow-it` puis `/plugin install workflow-it-plugin@workflow-it`.

Les plugins Matt Pocock (`mattpocock-skills`) et Impeccable (`impeccable`) sont installés avec lui en dépendances.

Demander à l'IA de l'installer fonctionne aussi : « installe le plugin `workflow-it-plugin` depuis `zeke1806/workflow-it` ».

## Activation dans un projet

Ajouter au `CLAUDE.md` du projet :

```md
Ce projet utilise le plugin `workflow-it-plugin` : suivre CU Workflow (specs `SCRUM-N`) et CU Archi (architecture).
```

Sans cette mention, les hooks restent inactifs. Avec elle :

- au démarrage, le plugin signale ce qui manque au projet (lint, Prettier, Husky, scripts, contrôle d'architecture) ;
- après chaque modification, lint et contrôle d'architecture ;
- avant chaque `git commit`, vérifications complètes, bloquantes.

## Contenu

- `skills/cu-workflow` : réalisation d'une spec `SCRUM-N`, livrée en un seul commit.
- `skills/cu-archi` : architecture et code, avec un projet d'exemple (`assets/reference-project`).
- `hooks/` : vérifications automatiques.
- `guideline/` : règles pour les humains.
