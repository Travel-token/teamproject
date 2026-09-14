#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
./validate-env.sh
docker compose --env-file .env.production build --pull
docker compose --env-file .env.production up -d --remove-orphans
docker compose --env-file .env.production ps

