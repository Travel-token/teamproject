#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
[[ -f .env.production ]] || { echo 'Copy .env.production.example to .env.production first.' >&2; exit 1; }
set -a
# shellcheck disable=SC1091
source .env.production
set +a

required=(APP_DOMAIN LETSENCRYPT_EMAIL MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD MYSQL_ROOT_PASSWORD JWT_SECRET_KEY SESSION_REFRESH_SECRET OCR_API_KEY RECOMMENDATION_API_KEY AUTH_OAUTH_PUBLIC_BASE_URL TOUR_API_SERVICE_KEY)
for name in "${required[@]}"; do
  value="${!name:-}"
  [[ -n "$value" && "$value" != *CHANGE_ME* && "$value" != *example.com* ]] || { echo "Set $name in .env.production" >&2; exit 1; }
done
[[ ${#JWT_SECRET_KEY} -ge 32 ]] || { echo 'JWT_SECRET_KEY must contain at least 32 characters.' >&2; exit 1; }
[[ ${#SESSION_REFRESH_SECRET} -ge 32 ]] || { echo 'SESSION_REFRESH_SECRET must contain at least 32 characters.' >&2; exit 1; }
[[ "$AUTH_OAUTH_PUBLIC_BASE_URL" == "https://$APP_DOMAIN" ]] || { echo 'AUTH_OAUTH_PUBLIC_BASE_URL must equal https://APP_DOMAIN.' >&2; exit 1; }
echo 'Production environment validation passed.'
