---
name: cu-workflow
description: Realiser une spec locale SCRUM-N et ses tickets, cadres et fournis par l'utilisateur, ou ses specs de correction avant merge, et la livrer sur une branche en un seul commit. Utiliser sur demande de CU Workflow ou dans un projet qui adopte ce mode de travail ; s'appuie sur les plugins Matt Pocock et Impeccable.
---

# CU Workflow

## Triggering

Appliquer pour une demande de réalisation dans un projet qui adopte CU Workflow, ou sur demande explicite. Pour une simple question, répondre sans branche ni spec.

Une demande = un `SCRUM-N` = un cadrage (fait par l'utilisateur) + une réalisation, puis autant de corrections que l'utilisateur en cadre avant le merge.

## Scope

| Source | Responsabilité |
| --- | --- |
| CU Workflow | Numérotation, branche, livraison Git |
| Plugins Matt Pocock | Grill, spec, tickets, implémentation, TDD, revue |
| CU Archi | Architecture, code, organisation des tests |
| Impeccable | Interface |
| Documents du projet | Technologies, contraintes, adaptations locales |

## Workflow

1. **Prérequis** : lancer `claude plugin list --json`. Les plugins Matt Pocock (id contenant `mattpocock`) et Impeccable (id contenant `impeccable`, seulement pour une interface) doivent être présents avec `enabled: true`. Sinon, s'arrêter, nommer le plugin manquant et donner `claude plugin marketplace add` puis `claude plugin install` ; ne rien installer soi-même. Le projet peut demander `setup-matt-pocock-skills` s'il n'a pas encore été fait.
2. **Cadrage (utilisateur)** : l'utilisateur fait le grill, `to-spec` et `to-tickets`, fournit spec et tickets dans `.scratch/scrum-N/` ([suivi](references/suivi-local.md)), commit le cadrage et le merge sur la branche par défaut. L'agent ne cadre pas.
3. **Réalisation** : sur demande d'implémenter `SCRUM-N` :
   - partir de la branche par défaut à jour, créer `claude/scrum-N` et lire `.scratch/scrum-N/` ;
   - lancer `implement-spec` en une seule fois, sans grill, question de cadrage ni découpage : le cadrage est fait ; le suivre tel quel, sans en déroger ;
   - `cu-archi` pour le code, `impeccable` pour l'interface (voir [artefacts](references/artefacts.md)) ;
   - si les tickets manquent, s'arrêter et renvoyer au cadrage ;
   - si spec ou tickets sont contradictoires ou impossibles, ou si les vérifications du projet échouent sans issue, s'arrêter et le dire, sans commit partiel.
4. **Livraison** : un seul commit de réalisation sur `claude/scrum-N`, après les vérifications du projet, selon [livraison](references/livraison.md).
5. **Correction avant merge** : sur demande de corriger `SCRUM-N`, appliquer [correction](references/correction.md) : l'utilisateur a commité sur `claude/scrum-N` une ou plusieurs specs de correction ; les implémenter puis livrer à nouveau en un seul commit.

## References

- [Suivi des demandes](references/suivi-local.md) : numérotation et fichiers locaux.
- [Livraison](references/livraison.md) : vérifications, commit unique, nettoyage.
- [Correction avant merge](references/correction.md) : spec de correction, commit et squash.
- [Artefacts](references/artefacts.md) : exclusions Git avant génération d'interface.
