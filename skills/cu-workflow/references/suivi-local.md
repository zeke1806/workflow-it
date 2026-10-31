# Suivi local des demandes

La spec est la demande de l'utilisateur. Son titre est `SCRUM-N : titre`, où `N` est l'horodatage à la minute `YYMMDDHHMM` (ex. `2610241735`), créé avec `date +%y%m%d%H%M` au moment du `to-spec`. Ne jamais renuméroter.

## Fichiers

- `.scratch/scrum-N/spec.md` : titre, `Status:` et contenu de `to-spec`.
- `.scratch/scrum-N/issues/` : tickets générés au cadrage par `to-tickets`, au découpage et à la numérotation libres. Ils ne sont pas de nouvelles demandes SCRUM.
- `.scratch/scrum-N/correction-T/` : `spec.md` et `issues/` d'une correction avant merge (voir [correction](correction.md)). `T` = `date +%y%m%d%H%M`, ne jamais renuméroter. Ce ne sont pas de nouvelles demandes SCRUM.
- `Status:` (`**Status:**` dans un ticket), sur la spec et chaque ticket : `ready-for-agent`, `claimed` pendant le travail, `resolved` une fois les critères validés. Le passage à `resolved` fait partie du commit de réalisation.

« Publier au tracker » signifie écrire ces fichiers, sans issue ni label distant.

## Commits

- Cadrage (spec, tickets, intégrations visuelles) : `SCRUM-N (cadrage) : titre`, commité et mergé par l'utilisateur sur la branche par défaut.
- Correction avant merge : `SCRUM-N (correction) : problème`, commité par l'utilisateur sur `claude/scrum-N`, jamais conservé tel quel : squashé dans le commit de réalisation.
- Réalisation : `SCRUM-N : titre`, un seul commit sur `claude/scrum-N` ([workflow](../SKILL.md#workflow)).
