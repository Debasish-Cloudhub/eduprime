#!/bin/sh
set -e

# ─── Construct DATABASE_URL from Railway Postgres service variables ───────────
# Railway exposes individual PG* variables from the linked Postgres service.
# We build the connection string here at runtime so the build phase can use a
# dummy URL for Prisma schema validation without needing a live database.

if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "postgresql://dummy:dummy@localhost:5432/dummy" ]; then
  if [ -z "$PGHOST" ] || [ -z "$PGPORT" ] || [ -z "$PGUSER" ] || [ -z "$PGPASSWORD" ] || [ -z "$PGDATABASE" ]; then
    echo "ERROR: DATABASE_URL is not set and one or more of PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE are missing."
    exit 1
  fi

  export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=disable"
  echo "INFO: DATABASE_URL constructed from PG* variables (host=${PGHOST}, db=${PGDATABASE})"
else
  echo "INFO: Using pre-set DATABASE_URL"
fi

# ─── Run Prisma migrations ────────────────────────────────────────────────────
echo "INFO: Running Prisma migrations..."
npx prisma migrate deploy

# ─── Start the application ────────────────────────────────────────────────────
echo "INFO: Starting NestJS application..."
exec node dist/main.js
