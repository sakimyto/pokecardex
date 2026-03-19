import { desc } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '~/db/index.ts'
import { newsArticles } from '~/db/schema.ts'

const newsApi = new Hono()

newsApi.get('/', async (c) => {
  const articles = await db.select().from(newsArticles).orderBy(desc(newsArticles.publishedAt))
  return c.json(articles)
})

export { newsApi }
