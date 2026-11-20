#!/usr/bin/env bash
set -Eeuo pipefail
: "${RESTORE_DRILL_DATABASE_URL:?RESTORE_DRILL_DATABASE_URL is required}"
: "${BACKUP_FILE:?BACKUP_FILE is required}"
test -f "$BACKUP_FILE" || { echo "Backup file missing" >&2; exit 1; }
command -v psql >/dev/null
command -v pg_restore >/dev/null
DB_NAME="$(psql "$RESTORE_DRILL_DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc "SELECT current_database()")"
case "$DB_NAME" in
  *_restore_drill) ;;
  *) echo "Refusing restore: target database must end in _restore_drill" >&2; exit 2 ;;
esac
COUNT="$(psql "$RESTORE_DRILL_DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")"
test "$COUNT" = "0" || { echo "Refusing restore into non-empty database" >&2; exit 2; }
pg_restore --list "$BACKUP_FILE" >/dev/null
pg_restore --exit-on-error --single-transaction --no-owner --no-privileges -d "$RESTORE_DRILL_DATABASE_URL" "$BACKUP_FILE"
psql "$RESTORE_DRILL_DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc "SELECT count(*) FROM organizations"
psql "$RESTORE_DRILL_DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc "SELECT count(*) FROM schema_migrations"
echo "Restore drill completed on isolated database: $DB_NAME"
