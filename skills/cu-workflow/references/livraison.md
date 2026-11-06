# Livraison

Ces règles ne valent qu'à la fin, une fois le travail des skills Matt Pocock terminé (implémentation et revue). Pendant le travail, leurs branches, worktrees, branche d'intégration et commits sont libres ; seul le livrable compte.

Livrable : une branche `claude/scrum-N`, un commit de réalisation au [format](suivi-local.md#commits) (nom de la spec et titre de la spec). Rien d'autre.

1. Créer `claude/scrum-N` depuis la branche de départ (`HEAD` au lancement de la réalisation) et y ramener le résultat final de la branche d'intégration en un seul commit, par exemple `git merge --squash <branche finale>` puis `git commit`. Le commit contient le code, le cadrage s'il n'était pas commité, `Status: resolved` sur la spec et chaque ticket, et les dossiers `correction-T/` s'il y en a. Aucun `Status` de `.scratch/scrum-N/` ne reste `ready-for-agent` ou `claimed`.
2. Lancer les vérifications du projet (son `CLAUDE.md`) avant le `git commit` et les corriger, plus `build-storybook` si des stories ont changé. Le hook du plugin (`hooks/verify.mjs`) les relance au `git commit` sur `claude/scrum-*`, sans `build-storybook`, et le bloque en cas d'échec ou de dépassement du budget : les corriger, ne pas contourner.
3. Vérifier le diff indexé selon [artefacts](artefacts.md).
4. Nettoyer en dernier : supprimer tous les worktrees (`git worktree remove --force`, puis `git worktree prune`), la branche d'intégration et toute autre branche créée pendant le travail. Vérifier `git worktree list` et `git branch` : ne restent que `claude/scrum-N` et les branches déjà présentes sans lien avec le travail.
5. Pousser uniquement `claude/scrum-N` et ouvrir une PR vers la branche de départ, sans jamais y toucher. Seul l'utilisateur merge.

Après merge, une correction ouvre une nouvelle demande.
