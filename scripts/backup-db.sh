#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_DIR:?BACKUP_DIR is required}"
command -v pg_dump >/dev/null || { echo "pg_dump missing" >&2; exit 1; }
command -v pg_restore >/dev/null || { echo "pg_restore missing" >&2; exit 1; }
mkdir -p -- "$BACKUP_DIR"
chmod 700 -- "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="${BACKUP_DIR%/}/cobraflux-${STAMP}.dump"
TMP="$(mktemp "${BACKUP_DIR%/}/.cobraflux-XXXXXXXX")"
trap 'rm -f -- "$TMP"' EXIT
pg_dump --format=custom --no-owner --no-acl --file="$TMP" "$DATABASE_URL"
pg_restore --list "$TMP" >/dev/null
mv -- "$TMP" "$DEST"
echo "Backup generated: $DEST"
echo "CAUTION: this backup contains sensitive customer data; encrypt it and follow retention policy."
