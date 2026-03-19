import { Hono } from 'hono'
import { db } from '~/db/index.ts'
import { sets } from '~/db/schema.ts'

const setsApi = new Hono()

setsApi.get('/', async (c) => {
  const allSets = await db.select().from(sets)
  return c.json(allSets)
})

setsApi.get('/:id', async (c) => {
  const setId = c.req.param('id')
  const result = await db
    .select()
    .from(sets)
    .where((fields, { eq }) => eq(fields.id, setId))
  if (result.length === 0) {
    return c.json({ error: 'Set not found' }, 404)
  }
  return c.json(result[0])
})

export { setsApi }
