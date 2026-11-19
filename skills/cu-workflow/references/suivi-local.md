# Suivi local des demandes

La spec est la demande de l'utilisateur. Son titre est `SCRUM-N : titre`, où `N` est l'horodatage à la minute `YYMMDDHHmm` (ex. `2610241735` pour le 24 octobre 2026 à 17:35), créé avec `date +%y%m%d%H%M` au moment du `to-spec`. Ne jamais renuméroter.

## Fichiers

- `.scratch/scrum-N/spec.md` : titre, `Status:`, `Jira: PROJ-123` si un ticket Jira est associé à la spec, et contenu de `to-spec`.
- `.scratch/scrum-N/issues/` : tickets générés au cadrage par `to-tickets`, au découpage et à la numérotation libres. Ils ne sont pas de nouvelles demandes SCRUM.
- `.scratch/scrum-N/correction-T/` : `spec.md` et `issues/` d'une correction avant merge (voir [correction](correction.md)). `T` = `date +%y%m%d%H%M`, ne jamais renuméroter. Ce ne sont pas de nouvelles demandes SCRUM.
- `Status:` (`**Status:**` dans un ticket), sur la spec et chaque ticket : `ready-for-agent`, `claimed` pendant le travail, `resolved` une fois les critères validés. Le passage à `resolved` fait partie du commit de réalisation.

Pour une spec `SCRUM-N`, « publier au tracker » signifie écrire ces fichiers, sans issue ni label distant.

Cette règle ne s'applique pas à un ticket Jira métier, destiné à des humains : si l'utilisateur demande de le publier sur Jira, c'est permis (via son MCP Jira). Ce n'est pas une spec `SCRUM-N`.

## Commits

- Cadrage (spec, tickets, glossaire, ADR, intégrations visuelles) : aucun commit exigé. Non commité au lancement de la réalisation, il entre en entier dans le commit de réalisation.
- Correction avant merge : `SCRUM-N (correction) : problème`, commité par l'utilisateur sur `claude/scrum-N`, jamais conservé tel quel : squashé dans le commit de réalisation.
- Réalisation : `SCRUM-N : titre`, ou `SCRUM-N (PROJ-123) : titre` si un ticket Jira est associé à la spec, un seul commit sur `claude/scrum-N` ([workflow](../SKILL.md#workflow)). Le numéro vient de la ligne `Jira:` de la spec, sinon de la demande de réalisation de l'utilisateur ; l'agent ne l'invente ni ne le déduit jamais. Seul ce commit porte le numéro : le format de correction ne change pas.
