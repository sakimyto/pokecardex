import { createApp } from '~/app.ts'
import { createLocalDb } from '~/db/local.ts'
import type { AppDatabase } from '~/types.ts'

// Use bun:sqlite for fast local testing
const localDb = createLocalDb()

// Cast is safe: drizzle ORM API is structurally identical across drivers
export const app = createApp(localDb as unknown as AppDatabase)
