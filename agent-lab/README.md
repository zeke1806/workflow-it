# agent-lab

Espace de travail des tâches automatisées (exécutées périodiquement par Claude sur le VPS).

**Hors plugin.** Ce dossier ne fait pas partie du plugin : Claude Code ne charge que `skills/`, `agents/`, `hooks/` et `.claude-plugin/`. `agent-lab/` est seulement copié avec le repo.

## Structure

```
agent-lab/
  taches/<nom>/
    prompt.md     consigne de la tâche
    memoire.md    ce qui a déjà été proposé ou traité (lu avant, mis à jour après chaque run)
    tache.env     THREAD_ID (topic Telegram)
    rapports/     un rapport par run : AAAA-MM-JJ-HHh.md
```

Une tâche = un dossier = un topic Telegram.

## Règles pour l'agent

- Écrire uniquement dans `agent-lab/taches/<nom>/` (`memoire.md` et `rapports/`).
- Ne jamais modifier le reste du repo, en particulier `guideline/`.
- Lire `memoire.md` avant de produire quoi que ce soit ; ne pas reproposer un élément déjà présent.
- Réponse Telegram très courte : une phrase par idée, détails dans `rapports/`. Rien à dire : « Rien de nouveau. »

## Exécution

`run.sh <tache>` (pull, Claude, commit et push de `agent-lab/taches/<nom>`, Telegram) tourne sur le VPS Mustang, dans un conteneur éphémère `workflow-it-agent-<tache>` (image `workflow-it-agent`, qui ne voit que `/opt/workflow-it-agent`). La cadence cron (09:00 Madagascar, soit 06:00 UTC) et l'image sont définies dans le repo `vps-perso` (`playbooks/deploy-workflow-it-agent.yml`).

## Tâches

| Tâche | Cadence | Objet |
| --- | --- | --- |
| `analyse-plugin` | quotidien (horaire pour tester) | jusqu'à 2 consolidations + 2 améliorations du plugin, incrémental, sans doublon |
