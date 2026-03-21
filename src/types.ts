import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type * as schema from './db/schema.ts'

export type AppDatabase = DrizzleD1Database<typeof schema>

export type AppEnv = {
  Bindings: { DB: D1Database }
  Variables: { db: AppDatabase }
}
