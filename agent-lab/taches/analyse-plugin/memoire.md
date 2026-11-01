# Mémoire : analyse-plugin

Une ligne par idée : `date | type | statut | titre court | fichiers`.
Type : `consolidation` ou `amelioration`. Statut : `proposee`, `appliquee`, `refusee`.
L'agent passe `proposee` à `appliquee` quand il le constate dans le repo. `refusee` : décision de l'utilisateur.


2026-11-01 | consolidation | proposee | Liste des scripts de vérification dupliquée en 4 lieux et divergente | hooks/verify.mjs, hooks/preflight.mjs, hooks/project.mjs, skills/cu-archi/references/code.md, guideline/verification.md
2026-11-01 | amelioration | proposee | Le hook de livraison contrôle aussi message du commit et Status de .scratch | hooks/verify.mjs, skills/cu-workflow/references/livraison.md
