#!/usr/bin/env bash
# Exécute une tâche du cadre Agent Lab : pull, Claude, commit et push de la tâche, sortie.
# Usage : run.sh <tache>
# Config : agent-lab/taches/<tache>/tache.env (OUTILS, TIMEOUT, CLAUDE_ARGS, SORTIE).
set -euo pipefail

tache="${1:?usage: run.sh <tache>}"
racine="$(cd "$(dirname "$0")/.." && pwd)"
dossier="agent-lab/taches/$tache"
cd "$racine"

OUTILS="" TIMEOUT="30m" CLAUDE_ARGS="" SORTIE=""
# shellcheck disable=SC1090
. "$dossier/tache.env"

# Sans SORTIE, le message va sur stdout, donc dans le log du cron.
sortie() {
  if [ -n "$SORTIE" ]; then
    "$racine/$SORTIE" "$tache" "$1"
  else
    printf '%s\n' "$1"
  fi
}

echec() {
  sortie "Échec de la tâche $tache : $1" || true
  exit 1
}

# Un seul run à la fois par tâche. Verrou dans .git : les conteneurs ne partagent pas /tmp.
exec 9>"$racine/.git/agent-lab-$tache.lock"
flock -n 9 || exit 0

git pull --rebase --quiet || echec "git pull"

run="$(date +%F-%Hh)"
rapport="$dossier/rapports/$run.md"
mkdir -p "$dossier/rapports"

# Le cadre passe en prompt système : prompt.md reste en tête, une commande /skill s'y déclenche.
cadre="$(cat agent-lab/CADRE.md)

Tâche : $tache
Dossier : $dossier
Run : $run"

# Règle Edit en chemin absolu (préfixe //) : le chemin relatif est refusé.
outils="Read,Glob,Grep,Edit(/$racine/$dossier/**)${OUTILS:+,$OUTILS}"

erreurs="$(mktemp)"
trap 'rm -f "$erreurs"' EXIT

code=0
# shellcheck disable=SC2086 # CLAUDE_ARGS contient plusieurs options.
timeout "$TIMEOUT" claude -p "$(cat "$dossier/prompt.md")" \
  --append-system-prompt "$cadre" \
  --allowedTools "$outils" \
  $CLAUDE_ARGS >/dev/null 2>"$erreurs" || code=$?

# Commit même en cas d'échec : la trace reste, et le dossier propre ne bloque pas le prochain pull.
git add "$dossier"
if ! git diff --cached --quiet; then
  git -c user.name="Agent Lab" -c user.email="agent-lab@local" \
    commit --quiet -m "agent-lab: $tache $run"
  git push --quiet || { git pull --rebase --quiet && git push --quiet; } || echec "git push"
fi

# Le détail de l'erreur reste dans le log du cron : la sortie peut passer par un service tiers.
if [ "$code" -ne 0 ]; then
  cat "$erreurs"
  echec "claude (code $code)"
fi
[ -f "$rapport" ] || echec "rapport manquant"

message="$(sed -n '/^## Sortie$/,$p' "$rapport" | tail -n +2)"
[ -n "${message//[[:space:]]/}" ] || echec "section Sortie vide"

sortie "$message"
