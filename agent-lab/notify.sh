#!/usr/bin/env bash
# Sortie Telegram : envoie un message dans le topic d'une tâche.
# Usage : notify.sh <tache> [message]   (message lu sur stdin si absent)
# Env   : ENV_FILE avec TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID ; THREAD_ID dans tache.env.
set -euo pipefail

tache="${1:?usage: notify.sh <tache> [message]}"
racine="$(cd "$(dirname "$0")/.." && pwd)"
env_file="${ENV_FILE:?manquant}"

set -a
# shellcheck disable=SC1090
[ -f "$env_file" ] && . "$env_file"
# shellcheck disable=SC1090
. "$racine/agent-lab/taches/$tache/tache.env"
set +a

: "${TELEGRAM_BOT_TOKEN:?manquant}" "${TELEGRAM_CHAT_ID:?manquant}" "${THREAD_ID:?manquant}"

message="${2:-$(cat)}"
# Limite Telegram : 4096 caractères.
message="${message:0:4000}"

# Le token passe par stdin (-K -) pour ne pas apparaître dans la liste des processus.
printf 'url = "https://api.telegram.org/bot%s/sendMessage"\n' "$TELEGRAM_BOT_TOKEN" |
  curl -sS --fail-with-body -K - \
    --data-urlencode "chat_id=$TELEGRAM_CHAT_ID" \
    --data-urlencode "message_thread_id=$THREAD_ID" \
    --data-urlencode "text=$message" \
    -o /dev/null
