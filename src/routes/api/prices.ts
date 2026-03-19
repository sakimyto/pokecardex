import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '~/db/index.ts'
import { arbitrageAlerts, priceStats } from '~/db/schema.ts'

const pricesApi = new Hono()

pricesApi.get('/stats/:cardId', async (c) => {
  const cardId = c.req.param('cardId')
  const stats = await db
    .select()
    .from(priceStats)
    .where(eq(priceStats.cardId, cardId))
    .orderBy(desc(priceStats.periodEnd))
  return c.json(stats)
})

pricesApi.get('/arbitrage', async (c) => {
  const alerts = await db
    .select()
    .from(arbitrageAlerts)
    .where(eq(arbitrageAlerts.isActive, true))
    .orderBy(desc(arbitrageAlerts.spreadPercent))
  return c.json(alerts)
})

export { pricesApi }
