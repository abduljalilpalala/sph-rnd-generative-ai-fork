#!/bin/sh

# load DB user variables (optional, if you want to separate credentials)
. ./scripts/db-users.sh

# Reset primary DB
export DATABASE_URL="postgresql://${DB_USER_ADMIN}:password@localhost:${POSTGRES_PORT:-5432}/yourdbname"

echo "Resetting the primary database..."
psql "postgresql://${DB_USER_ADMIN}:password@localhost:${POSTGRES_PORT:-5432}/postgres" \
  -c "DROP DATABASE IF EXISTS yourdbname WITH (FORCE)"

yarn prisma migrate reset --force

# Check for --primary-only flag
PRIMARY_ONLY=0
for arg in "$@"; do
  if [ "$arg" = "--primary-only" ]; then
    PRIMARY_ONLY=1
    break
  fi
done

# Reset test DB if not excluded
if [ "$PRIMARY_ONLY" -eq 0 ]; then
  ./scripts/prisma-migrate-test.sh
fi
