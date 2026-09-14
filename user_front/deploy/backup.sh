#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p backups
output="backups/travel-token-$(date +%Y%m%d-%H%M%S).sql"
docker compose --env-file .env.production exec -T mysql sh -c 'exec mysqldump --single-transaction -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > "$output"
[[ -s "$output" ]] || { echo 'Database backup is empty.' >&2; exit 1; }
echo "Backup created: $output"
