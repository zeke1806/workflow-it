# workflow-it-plugin

Plugin Claude Code regroupant deux skills :

- `cu-workflow` : réalisation d'une spec locale `SCRUM-N` et de ses tickets, livrée en un seul commit (`/workflow-it-plugin:cu-workflow`).
- `cu-archi` : architecture et code (services modulaires, DI, adapters, front, Storybook, tests Vitest) (`/workflow-it-plugin:cu-archi`). Embarque un projet d'exemple ToDo dans `skills/cu-archi/assets/reference-project/`.

## Prérequis

`cu-workflow` exige les plugins Matt Pocock et Impeccable (ce dernier pour une interface), présents et activés : `claude plugin list --json`.

## Installation

Test local :

```sh
claude --plugin-dir /Users/zeke/Documents/Projects/workflow-it-plugin
```

Validation :

```sh
claude plugin validate /Users/zeke/Documents/Projects/workflow-it-plugin
```
