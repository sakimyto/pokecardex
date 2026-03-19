import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '~/db/index.ts'
import { newsArticles } from '~/db/schema.ts'

const newsApi = new Hono()

newsApi.get('/', async (c) => {
  const articles = await db.select().from(newsArticles).orderBy(desc(newsArticles.publishedAt))
  return c.json(articles)
})

newsApi.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400)
  const result = await db.select().from(newsArticles).where(eq(newsArticles.id, id))
  if (result.length === 0) return c.json({ error: 'Not found' }, 404)
  return c.json(result[0])
})

export { newsApi }
