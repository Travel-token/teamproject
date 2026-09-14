# Travel Settle production deployment

This directory runs the backend, MySQL, recommendation service, OCR service, and HTTPS proxy on one Ubuntu server. Only ports 80 and 443 are public. MySQL and the internal Python services are isolated inside the Docker network.

## Server prerequisites

- Ubuntu 24.04 LTS
- A fixed public IPv4 address
- DNS `A` record for `APP_DOMAIN` pointing to that address
- Docker Engine with the Compose plugin
- At least 4 GB RAM; 8 GB or more is recommended while OCR is enabled
- Firewall inbound rules for TCP 22, 80, and 443 plus UDP 443

## First deployment

1. Clone the repository to `/opt/travel-settle`.
2. Copy `.env.production.example` to `.env.production` and enter newly issued secrets.
3. On the Windows development PC, run `export-local-db.ps1`. Transfer the generated, Git-ignored `mysql-init/001_schema_and_seed.sql` to the same path on the server before first startup. It may contain user data, so do not commit it.
4. Validate and start the stack.

```bash
cd /opt/travel-settle/user_front/deploy
chmod +x ./*.sh
./validate-env.sh
./deploy.sh
./status.sh
```

The first OCR startup downloads and loads its model and can take several minutes. Model files remain in the `ocr-models` volume across restarts.

## Release

Push reviewed code to `main`. The GitHub deployment workflow connects to the server and runs `git pull --ff-only` followed by `docker compose up -d --build`. Add these GitHub repository secrets first:

- `DEPLOY_HOST`
- `DEPLOY_PORT` (usually `22`)
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_KNOWN_HOSTS`

The server checkout must already exist and be able to pull the private repository using a read-only deploy key. The production `.env.production` file exists only on the server.

## Recovery and backup

Docker restarts services after process failure and after server reboot. Run `backup.sh` regularly and copy encrypted backups to another device. Test restoration before Play production release. PowerShell equivalents are included for local Windows administration.
