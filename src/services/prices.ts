import { desc, eq } from 'drizzle-orm'
import { db } from '~/db/index.ts'
import { arbitrageAlerts, cards, priceStats, prices } from '~/db/schema.ts'

const JPY_PER_USD = 150

export interface CardPriceSummary {
  cardId: string
  jp: { marketplace: string; avgCents: number; currency: string }[]
  en: { marketplace: string; avgCents: number; currency: string }[]
  arbitrage: {
    jpPriceJpy: number
    enPriceUsd: number
    jpInUsd: number
    spreadPercent: number
  } | null
}

export function formatPrice(cents: number, currency: string): string {
  if (currency === 'JPY') {
    return `¥${cents.toLocaleString()}`
  }
  return `$${(cents / 100).toFixed(2)}`
}

export function jpyToUsd(jpyCents: number): number {
  return Math.round((jpyCents / JPY_PER_USD) * 100) / 100
}

export async function getCardPriceSummary(cardId: string): Promise<CardPriceSummary> {
  const stats = await db
    .select()
    .from(priceStats)
    .where(eq(priceStats.cardId, cardId))
    .orderBy(desc(priceStats.periodEnd))

  const jp = stats
    .filter((s) => s.region === 'jp')
    .map((s) => ({
      marketplace: s.marketplace,
      avgCents: s.avgPriceCents ?? 0,
      currency: s.currency,
    }))

  const en = stats
    .filter((s) => s.region === 'en')
    .map((s) => ({
      marketplace: s.marketplace,
      avgCents: s.avgPriceCents ?? 0,
      currency: s.currency,
    }))

  let arbitrage: CardPriceSummary['arbitrage'] = null
  if (jp.length > 0 && en.length > 0) {
    const bestJp = jp.reduce((a, b) => (a.avgCents < b.avgCents ? a : b))
    const bestEn = en.reduce((a, b) => (a.avgCents < b.avgCents ? a : b))
    const jpInUsd = jpyToUsd(bestJp.avgCents)
    const spreadPercent = ((bestEn.avgCents / 100 - jpInUsd) / jpInUsd) * 100

    arbitrage = {
      jpPriceJpy: bestJp.avgCents,
      enPriceUsd: bestEn.avgCents,
      jpInUsd,
      spreadPercent: Math.round(spreadPercent * 10) / 10,
    }
  }

  return { cardId, jp, en, arbitrage }
}

export async function getRecentPrices(cardId: string, limit = 20) {
  return db
    .select()
    .from(prices)
    .where(eq(prices.cardId, cardId))
    .orderBy(desc(prices.scrapedAt))
    .limit(limit)
}

export async function getActiveArbitrageAlerts() {
  const alerts = await db
    .select({
      alert: arbitrageAlerts,
      card: cards,
    })
    .from(arbitrageAlerts)
    .innerJoin(cards, eq(arbitrageAlerts.cardId, cards.id))
    .where(eq(arbitrageAlerts.isActive, true))
    .orderBy(desc(arbitrageAlerts.spreadPercent))

  return alerts
}
