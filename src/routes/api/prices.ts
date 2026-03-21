import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { arbitrageAlerts, priceStats } from '~/db/schema.ts'
import type { AppEnv } from '~/types.ts'

const pricesApi = new Hono<AppEnv>()

pricesApi.get('/stats/:cardId', async (c) => {
  const db = c.var.db
  const cardId = c.req.param('cardId')
  const stats = await db
    .select()
    .from(priceStats)
    .where(eq(priceStats.cardId, cardId))
    .orderBy(desc(priceStats.periodEnd))
  return c.json(stats)
})

pricesApi.get('/arbitrage', async (c) => {
  const db = c.var.db
  const alerts = await db
    .select()
    .from(arbitrageAlerts)
    .where(eq(arbitrageAlerts.isActive, true))
    .orderBy(desc(arbitrageAlerts.spreadPercent))
  return c.json(alerts)
})

export { pricesApi }
