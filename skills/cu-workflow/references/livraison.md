# Livraison

Ces règles ne valent qu'à la fin, une fois le travail des skills Matt Pocock terminé (implémentation et revue). Pendant le travail, leurs branches, worktrees, branche d'intégration et commits sont libres ; seul le livrable compte.

Livrable : une branche `claude/scrum-N`, un commit `SCRUM-N : titre` (nom de la spec et titre de la spec, [format](suivi-local.md#commits)). Rien d'autre.

1. Créer `claude/scrum-N` depuis la branche par défaut à jour et y ramener le résultat final de la branche d'intégration en un seul commit, par exemple `git merge --squash <branche finale>` puis `git commit`. Le commit contient le code, `Status: resolved` sur la spec et chaque ticket, et les dossiers `correction-T/` s'il y en a. Aucun `Status` de `.scratch/scrum-N/` ne reste `ready-for-agent` ou `claimed`.
2. Vérifications du projet (son `CLAUDE.md`). Le hook du plugin (`hooks/verify.mjs`) les relance au `git commit` sur `claude/scrum-*` et le bloque en cas d'échec : les corriger, ne pas contourner.
3. Vérifier le diff indexé selon [artefacts](artefacts.md).
4. Nettoyer en dernier : supprimer tous les worktrees (`git worktree remove --force`, puis `git worktree prune`), la branche d'intégration et toute autre branche créée pendant le travail. Vérifier `git worktree list` et `git branch` : ne restent que `claude/scrum-N` et les branches déjà présentes sans lien avec le travail.
5. Ni PR/MR, ni push sans demande explicite.

Après merge sur la branche par défaut, une correction ouvre une nouvelle demande.
