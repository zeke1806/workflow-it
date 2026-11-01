#!/usr/bin/env bash
# Sortie ntfy : envoie un message dans le channel d'une tâche.
# Usage : notify.sh <tache> [message]   (message lu sur stdin si absent)
# Env   : ENV_FILE avec NTFY_PROJET et NTFY_SUFFIXE.
set -euo pipefail

tache="${1:?usage: notify.sh <tache> [message]}"
env_file="${ENV_FILE:?manquant}"

set -a
# shellcheck disable=SC1090
[ -f "$env_file" ] && . "$env_file"
set +a

: "${NTFY_PROJET:?manquant}" "${NTFY_SUFFIXE:?manquant}"

message="${2:-$(cat)}"

# Le nom du channel sert de mot de passe : il passe par stdin (-K -) pour ne pas apparaître dans la liste des processus.
printf 'url = "https://ntfy.sh/%s-%s-%s"\n' "$NTFY_PROJET" "$tache" "$NTFY_SUFFIXE" |
  curl -sS --fail-with-body -K - \
    -H "Title: $NTFY_PROJET $tache" \
    --data-raw "$message" \
    -o /dev/null
