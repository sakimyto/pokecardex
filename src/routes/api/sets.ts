import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { sets } from '~/db/schema.ts'
import type { AppEnv } from '~/types.ts'

const setsApi = new Hono<AppEnv>()

setsApi.get('/', async (c) => {
  const db = c.var.db
  const allSets = await db.select().from(sets)
  return c.json(allSets)
})

setsApi.get('/:id', async (c) => {
  const db = c.var.db
  const setId = c.req.param('id')
  const result = await db.select().from(sets).where(eq(sets.id, setId))
  if (result.length === 0) {
    return c.json({ error: 'Set not found' }, 404)
  }
  return c.json(result[0])
})

export { setsApi }
