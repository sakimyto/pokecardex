#!/bin/sh
set -e

# Seed database if it doesn't exist yet (first deploy)
if [ ! -f data/pokecardex.db ]; then
  echo "First run: seeding database..."
  bun run src/db/seed.ts
fi

# Start the server (migrations run automatically via drizzle)
exec bun run src/index.ts
