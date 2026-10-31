# Correction avant merge

Cas : le livrable `claude/scrum-N` (un commit de réalisation) n'est pas encore mergé et l'utilisateur a des retours. Après merge, une correction est une nouvelle demande. Formats de commit : [suivi](suivi-local.md#commits).

## Cadrage (utilisateur)

Grill, `to-spec`, `to-tickets` dans `.scratch/scrum-N/correction-T/` (`spec.md`, `issues/`), `T` créé avec `date +%y%m%d%H%M`. L'utilisateur fait un commit de correction sur `claude/scrum-N`, qui ne contient que `.scratch/scrum-N/correction-T/`. Plusieurs commits peuvent s'empiler avant de lancer l'agent.

## Gabarit de `spec.md`

```markdown
# SCRUM-N (correction) : problème constaté

Status: ready-for-agent

## Constat
Observé vs attendu.

## Reproduction
Étapes minimales ou test qui échoue.

## Correction attendue
Comportement cible, sans imposer l'implémentation.

## Critères de validation
- [ ] Le constat ne se reproduit plus
- [ ] Non-régression couverte par un test
- [ ] La spec `SCRUM-N` reste valide

## Hors périmètre
Ce qui devient une nouvelle demande.
```

## Réalisation (agent)

1. Sur `claude/scrum-N`, lister les commits au-dessus du commit de réalisation (celui dont le message est `SCRUM-N : titre`) : tous doivent être des commits de correction. Aucun, ou autre chose : s'arrêter et le dire.
2. Pour chaque `correction-T/`, dans l'ordre : `implement-spec` en une seule fois, sans question de cadrage (`cu-archi`, `impeccable`, arrêt en cas de blocage comme à la réalisation), puis `Status: resolved` dans `spec.md` et chaque ticket de `issues/`. Tickets manquants : s'arrêter et renvoyer au cadrage. Le test de non-régression suit l'organisation des tests de CU Archi, quand le projet l'adopte.
3. Livraison : ramener la branche à un seul commit de réalisation (message inchangé) contenant le code et les `correction-T/` complets, `spec.md` et `issues/`, par exemple `git reset --soft <commit de réalisation>` puis `git commit --amend --no-edit`. Vérifier `git diff --cached --stat` et les chemins indexés ([artefacts](artefacts.md)).
4. Un nouveau retour repart du même flux : les `correction-T/` précédents restent dans le commit.
