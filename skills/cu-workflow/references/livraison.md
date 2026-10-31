# Livraison

Seul le résultat compte. Les branches, worktrees et branche d'intégration créés par les skills Matt Pocock sont libres pendant le travail.

1. Lancer les vérifications du projet (son `CLAUDE.md`).
2. `claude/scrum-N` porte un seul commit de réalisation ([format](suivi-local.md#commits)) : le code, `Status: resolved` sur la spec et chaque ticket, et les dossiers `correction-T/` s'il y en a. Aucun `Status` de `.scratch/scrum-N/` ne reste `ready-for-agent` ou `claimed`.
3. Vérifier le diff indexé selon [artefacts](artefacts.md).
4. Supprimer toutes les branches créées pendant le travail (skills Matt Pocock, worktrees, branche d'intégration) : ne garder que `claude/scrum-N` et les branches déjà présentes sans lien avec le travail.
5. Ni PR/MR, ni push sans demande explicite.

Après merge sur la branche par défaut, une correction ouvre une nouvelle demande.
