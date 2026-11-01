#!/usr/bin/env bash
# Exécute une tâche : pull, Claude, commit et push de agent-lab/<tache>, notification Telegram.
# Usage : run.sh <tache>
set -euo pipefail

tache="${1:?usage: run.sh <tache>}"
racine="$(cd "$(dirname "$0")/.." && pwd)"
dossier="agent-lab/taches/$tache"
cd "$racine"

# Un seul run à la fois par tâche.
if command -v flock >/dev/null; then
  exec 9>"/tmp/workflow-it-$tache.lock"
  flock -n 9 || exit 0
fi

echec() {
  "$racine/agent-lab/notify.sh" "$tache" "Échec de la tâche $tache : $1" || true
  exit 1
}

git pull --rebase --quiet || echec "git pull"

# stderr à part : il ne doit jamais se retrouver dans le message Telegram.
erreurs="$(mktemp)"
trap 'rm -f "$erreurs"' EXIT

resultat="$(claude -p "$(cat "$dossier/prompt.md")" \
  --allowedTools "Read,Glob,Grep,Bash(git log:*),Bash(git diff:*),Edit($dossier/**)" \
  2>"$erreurs")" || echec "claude : $(head -c 300 "$erreurs")"

git add "$dossier"
if ! git diff --cached --quiet; then
  git -c user.name="Workflow IT Agent" -c user.email="agent@workflow-it.local" \
    commit --quiet -m "agent-lab: $tache $(date +%F-%Hh)"
  git push --quiet || { git pull --rebase --quiet && git push --quiet; } || echec "git push"
fi

"$racine/agent-lab/notify.sh" "$tache" "$resultat"
