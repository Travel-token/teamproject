#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
set -a
# shellcheck disable=SC1091
source .env.production
set +a
docker compose --env-file .env.production ps
curl --fail --show-error --silent "https://${APP_DOMAIN}/api/health"
echo

