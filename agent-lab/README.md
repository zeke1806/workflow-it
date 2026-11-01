# agent-lab

Espace de travail des tâches automatisées (exécutées périodiquement par Claude sur le VPS).

**Hors plugin.** Ce dossier ne fait pas partie du plugin : Claude Code ne charge que `skills/`, `agents/`, `hooks/` et `.claude-plugin/`. `agent-lab/` est seulement copié avec le repo.

## Cadre

`CADRE.md`, `run.sh` et `notify.sh` viennent du skill `cu-agent-lab` (repo `ai-skills`) : les modifier là-bas, puis les recopier ici. Règles de travail de l'agent : voir [CADRE.md](CADRE.md).

```
agent-lab/
  CADRE.md              règles de travail communes
  run.sh                lanceur
  notify.sh             sortie ntfy
  taches/<nom>/
    prompt.md           mission + contenu du résultat + format de sortie
    memoire.md          ce que le prochain run doit savoir
    rapports/<run>.md   un rapport par run, même vide
    tache.env           outils, timeout, sortie
```

Une tâche = un dossier = un prompt = un cron = un channel ntfy (`workflow-it-<tache>-<suffixe>`, suffixe hors repo).

## Exécution

`run.sh <tache>` tourne sur le VPS Mustang, dans un conteneur éphémère `workflow-it-agent-<tache>` (image `workflow-it-agent`, qui ne voit que `/opt/workflow-it-agent`). La cadence cron (09:00 Madagascar, soit 06:00 UTC) et l'image sont définies dans le repo `vps-perso` (`playbooks/deploy-workflow-it-agent.yml`).

## Tâches

| Tâche | Cadence | Objet |
| --- | --- | --- |
| `analyse-plugin` | quotidien (horaire pour tester) | jusqu'à 2 consolidations + 2 améliorations du plugin, incrémental, sans doublon |
