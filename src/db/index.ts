import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import * as schema from './schema.ts'

export function createDb(dbPath?: string) {
  const path = dbPath ?? process.env.DATABASE_URL ?? 'data/pokecardex.db'
  const sqlite = new Database(path, { create: true })
  sqlite.exec('PRAGMA journal_mode = WAL;')
  sqlite.exec('PRAGMA foreign_keys = ON;')

  const database = drizzle(sqlite, { schema })

  migrate(database, { migrationsFolder: 'drizzle' })

  // Performance indexes (idempotent)
  sqlite.exec('CREATE INDEX IF NOT EXISTS idx_cards_name_ja ON cards(name_ja);')
  sqlite.exec('CREATE INDEX IF NOT EXISTS idx_cards_name_en ON cards(name_en);')
  sqlite.exec('CREATE INDEX IF NOT EXISTS idx_cards_type_en ON cards(type_en);')
  sqlite.exec('CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);')
  sqlite.exec('CREATE INDEX IF NOT EXISTS idx_cards_set_id ON cards(set_id);')
  sqlite.exec('CREATE INDEX IF NOT EXISTS idx_prices_card_id ON prices(card_id);')
  sqlite.exec('CREATE INDEX IF NOT EXISTS idx_prices_scraped_at ON prices(card_id, scraped_at);')
  sqlite.exec('CREATE INDEX IF NOT EXISTS idx_price_stats_card_id ON price_stats(card_id);')
  sqlite.exec(
    'CREATE INDEX IF NOT EXISTS idx_arbitrage_active ON arbitrage_alerts(is_active, spread_percent);',
  )

  return database
}

export const db = createDb()
export type DB = ReturnType<typeof createDb>
