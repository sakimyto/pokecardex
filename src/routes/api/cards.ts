import { eq, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '~/db/index.ts'
import { cards } from '~/db/schema.ts'

const cardsApi = new Hono()

cardsApi.get('/', async (c) => {
  const setId = c.req.query('setId')
  const q = c.req.query('q')?.trim()

  if (q) {
    const pattern = `%${q}%`
    const result = await db
      .select()
      .from(cards)
      .where(or(like(cards.nameJa, pattern), like(cards.nameEn, pattern)))
    return c.json(result)
  }

  if (setId) {
    const result = await db.select().from(cards).where(eq(cards.setId, setId))
    return c.json(result)
  }
  const allCards = await db.select().from(cards)
  return c.json(allCards)
})

cardsApi.get('/:id', async (c) => {
  const cardId = c.req.param('id')
  const result = await db.select().from(cards).where(eq(cards.id, cardId))
  if (result.length === 0) {
    return c.json({ error: 'Card not found' }, 404)
  }
  return c.json(result[0])
})

export { cardsApi }
