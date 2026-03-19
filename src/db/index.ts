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

  return database
}

export const db = createDb()
export type DB = ReturnType<typeof createDb>
