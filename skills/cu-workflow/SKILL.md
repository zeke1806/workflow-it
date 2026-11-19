---
name: cu-workflow
description: Realiser une spec locale SCRUM-N et ses tickets, cadres et fournis par l'utilisateur, ou ses specs de correction avant merge, et la livrer sur une branche en un seul commit. Utiliser sur demande de CU Workflow ou dans un projet qui adopte ce mode de travail ; s'appuie sur les plugins Matt Pocock et Impeccable.
---

# CU Workflow

## Triggering

Appliquer pour une demande de réalisation dans un projet qui adopte CU Workflow, ou sur demande explicite. Pour une simple question, répondre sans branche ni spec.

Une demande = un `SCRUM-N` = un cadrage (fait par l'utilisateur) + une réalisation, puis autant de corrections que l'utilisateur en cadre avant le merge.

Un ticket Jira métier, destiné à des humains, n'est pas un `SCRUM-N` : si l'utilisateur demande de le publier sur Jira, c'est permis ([suivi](references/suivi-local.md)).

## Scope

Ce skill et ses références sont la source de vérité du workflow. Un écart ou une lacune se signale à l'utilisateur.

| Source | Responsabilité |
| --- | --- |
| CU Workflow | Nommage `scrum-N`, numérotation, branche, livraison Git |
| Plugins Matt Pocock | Grill, spec, tickets, implémentation, TDD, revue |
| CU Archi | Architecture, code, technologies de base, vérification automatique, organisation des tests |
| Impeccable | Interface |
| Documents du projet | Technologies, contraintes, adaptations locales |

## Workflow

1. **Prérequis** : les plugins Matt Pocock et Impeccable sont déclarés en `dependencies` dans `.claude-plugin/plugin.json`. Lancer `claude plugin list --json`. Les plugins Matt Pocock (id contenant `mattpocock`) et Impeccable (id contenant `impeccable`, seulement pour une interface) doivent être présents avec `enabled: true`. Sinon, s'arrêter, nommer le plugin manquant et donner `claude plugin marketplace add` puis `claude plugin install` ; ne rien installer soi-même. Si une dépendance manque, le plugin ne se charge pas et ses hooks ne protègent rien. Le projet peut demander `setup-matt-pocock-skills` s'il n'a pas encore été fait.
2. **Cadrage (utilisateur)** : l'utilisateur fait le grill, `to-spec` et `to-tickets`, fournit spec et tickets dans `.scratch/scrum-N/` ([suivi](references/suivi-local.md)), sur la branche courante, sans commit : le cadrage est fait dès que ses fichiers sont écrits. L'agent ne cadre pas : il mène le grill avec l'utilisateur mais ne rédige pas le cadrage à sa place. À la fin du grill de Matt Pocock, l'agent propose, sans l'imposer, de continuer par un [grill modules](references/grill-modules.md) ; les questions en continuent la numérotation et les décisions entrent dans la spec via `to-spec`.
3. **Réalisation** : sur demande d'implémenter `SCRUM-N` :
   - partir de `HEAD` : noter la branche courante (branche de départ) et lire `.scratch/scrum-N/` ; tout changement non commité au lancement (suivi ou non, hors fichiers ignorés : `.scratch/scrum-N/`, glossaire, ADR, intégrations visuelles…) fait partie du cadrage ; le commiter d'abord en entier sur une branche de travail, pour que les worktrees le voient (commit technique, disparu au squash final), et en lister les chemins : aucun ne reste de côté, tous entrent dans le livrable ;
   - lancer `implement-spec` en une seule fois, sans grill, question de cadrage ni découpage : le cadrage est fait ; le suivre tel quel, sans en déroger. Pendant le travail, suivre strictement les skills Matt Pocock : branches, worktrees, commits intermédiaires et revue sont les leurs, rien n'est imposé en plus ;
   - `cu-archi` pour le code, `impeccable` pour l'interface (voir [artefacts](references/artefacts.md)) ;
   - si la spec ou les tickets manquent, s'arrêter et renvoyer au cadrage ;
   - si spec ou tickets sont contradictoires ou impossibles, ou si les vérifications du projet échouent sans issue, s'arrêter et le dire, sans livrer.
4. **Livraison (à la fin seulement)** : le travail Matt Pocock terminé, livrer une seule branche `claude/scrum-N` portant un seul commit `SCRUM-N : titre` (`SCRUM-N (PROJ-123) : titre` si un ticket Jira est associé à la spec, voir [suivi](references/suivi-local.md#commits)), nettoyer worktrees et branches du travail, pousser `claude/scrum-N` et ouvrir une PR vers la branche de départ, selon [livraison](references/livraison.md).
5. **Correction avant merge** : sur demande de corriger `SCRUM-N`, appliquer [correction](references/correction.md) : l'utilisateur a commité sur `claude/scrum-N` une ou plusieurs specs de correction ; les implémenter puis livrer à nouveau en un seul commit.

## Historique linéaire

L'historique des branches durables (branche de départ, `develop`, `main`…) et du livrable reste linéaire : jamais de commit de merge. Intégrer par rebase ou fast-forward (`git rebase`, `git merge --ff-only`, `git merge --squash`), y compris d'une branche durable vers une autre (`develop` vers `main`). Une PR se fusionne en rebase ou fast-forward.

## References

- [Suivi des demandes](references/suivi-local.md) : numérotation et fichiers locaux.
- [Livraison](references/livraison.md) : vérifications, commit unique, nettoyage.
- [Correction avant merge](references/correction.md) : spec de correction, commit et squash.
- [Artefacts](references/artefacts.md) : exclusions Git avant génération d'interface.
- [Grill modules](references/grill-modules.md) : suite facultative du grill, centrée modules, services, adapters, DI.
