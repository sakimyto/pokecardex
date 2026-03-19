/**
 * Import TCGPlayer prices from pokemontcg.io API for all cards in DB
 *
 * Usage:
 *   bun run src/scripts/import-prices.ts              # import prices for all cards
 *   bun run src/scripts/import-prices.ts sv8 sv7      # import prices for specific sets
 *
 * The pokemontcg.io API includes TCGPlayer market prices in card responses.
 * This script fetches those prices and stores them in the prices + priceStats tables.
 */

import { eq, sql } from 'drizzle-orm'
import { createDb } from '../db/index.ts'
import { arbitrageAlerts, cards, priceStats, prices, sets } from '../db/schema.ts'

const API_BASE = 'https://api.pokemontcg.io/v2'
const PAGE_SIZE = 250
const REQUEST_DELAY_MS = 2000

interface ApiCard {
  id: string
  name: string
  tcgplayer?: {
    url: string
    updatedAt: string
    prices: Record<
      string,
      {
        low?: number
        mid?: number
        high?: number
        market?: number
        directLow?: number
      }
    >
  }
  cardmarket?: {
    url: string
    updatedAt: string
    prices: {
      averageSellPrice?: number
      lowPrice?: number
      trendPrice?: number
      avg1?: number
      avg7?: number
      avg30?: number
    }
  }
}

async function fetchJson<T>(url: string, retries = 8): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'pokecardex/0.1' },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (res.ok) {
        return res.json() as Promise<T>
      }
      if (res.status >= 500 && attempt < retries) {
        const delay = 5000 * attempt
        console.log(
          `  Retry ${attempt}/${retries} after ${res.status} (waiting ${delay / 1000}s)...`,
        )
        await sleep(delay)
        continue
      }
      throw new Error(`API error ${res.status}`)
    } catch (err) {
      clearTimeout(timeout)
      if (attempt < retries) {
        const delay = 5000 * attempt
        console.log(`  Retry ${attempt}/${retries} after error (waiting ${delay / 1000}s)...`)
        await sleep(delay)
        continue
      }
      throw err
    }
  }
  throw new Error('Max retries exceeded')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const JPY_PER_USD = 150

async function importPricesForSet(
  db: ReturnType<typeof createDb>,
  setId: string,
): Promise<{ pricesAdded: number; statsUpdated: number }> {
  const stats = { pricesAdded: 0, statsUpdated: 0 }
  const now = new Date().toISOString()
  const periodStart = now.slice(0, 10) // YYYY-MM-DD

  let page = 1
  let totalFetched = 0

  while (true) {
    await sleep(REQUEST_DELAY_MS)
    const url = `${API_BASE}/cards?q=set.id:${setId}&pageSize=${PAGE_SIZE}&page=${page}`
    console.log(`  Fetching cards page ${page}...`)

    const response = await fetchJson<{ data: ApiCard[]; totalCount: number }>(url)

    for (const apiCard of response.data) {
      // Check card exists in our DB
      const existing = await db.select({ id: cards.id }).from(cards).where(eq(cards.id, apiCard.id))
      if (existing.length === 0) continue

      const cardId = apiCard.id

      // Import TCGPlayer prices (EN market)
      if (apiCard.tcgplayer?.prices) {
        for (const [variant, priceData] of Object.entries(apiCard.tcgplayer.prices)) {
          const marketPrice = priceData.market ?? priceData.mid
          if (!marketPrice) continue

          const priceCents = Math.round(marketPrice * 100)

          // Insert raw price record
          await db.insert(prices).values({
            cardId,
            marketplace: 'tcgplayer',
            region: 'en',
            priceCents,
            currency: 'USD',
            condition: variant, // "normal", "holofoil", "reverseHolofoil", etc.
            listingUrl: apiCard.tcgplayer.url,
            scrapedAt: now,
          })
          stats.pricesAdded++

          // Upsert price stats
          const existingStats = await db
            .select()
            .from(priceStats)
            .where(
              sql`${priceStats.cardId} = ${cardId} AND ${priceStats.marketplace} = 'tcgplayer' AND ${priceStats.region} = 'en' AND ${priceStats.periodStart} = ${periodStart}`,
            )

          if (existingStats.length > 0) {
            await db
              .update(priceStats)
              .set({
                avgPriceCents: priceCents,
                minPriceCents: priceData.low ? Math.round(priceData.low * 100) : priceCents,
                maxPriceCents: priceData.high ? Math.round(priceData.high * 100) : priceCents,
                medianPriceCents: priceData.mid ? Math.round(priceData.mid * 100) : priceCents,
                sampleCount: 1,
                updatedAt: now,
              })
              .where(eq(priceStats.id, existingStats[0].id))
          } else {
            await db.insert(priceStats).values({
              cardId,
              marketplace: 'tcgplayer',
              region: 'en',
              currency: 'USD',
              avgPriceCents: priceCents,
              minPriceCents: priceData.low ? Math.round(priceData.low * 100) : priceCents,
              maxPriceCents: priceData.high ? Math.round(priceData.high * 100) : priceCents,
              medianPriceCents: priceData.mid ? Math.round(priceData.mid * 100) : priceCents,
              sampleCount: 1,
              periodStart,
              periodEnd: periodStart,
            })
            stats.statsUpdated++
          }
        }
      }

      // Import Cardmarket prices (EU market, but useful as proxy for intl pricing)
      if (apiCard.cardmarket?.prices) {
        const cm = apiCard.cardmarket.prices
        const avgPrice = cm.averageSellPrice ?? cm.trendPrice
        if (avgPrice) {
          // Cardmarket uses EUR — convert to USD (rough 1.1 rate)
          const priceCentsUsd = Math.round(avgPrice * 110)

          await db.insert(prices).values({
            cardId,
            marketplace: 'cardmarket',
            region: 'en',
            priceCents: priceCentsUsd,
            currency: 'USD',
            condition: 'trend',
            listingUrl: apiCard.cardmarket.url,
            scrapedAt: now,
          })
          stats.pricesAdded++
        }
      }
    }

    totalFetched += response.data.length
    if (totalFetched >= response.totalCount) break
    page++
  }

  return stats
}

/** Generate arbitrage alerts by comparing JP seed prices with EN market prices */
async function generateArbitrageAlerts(db: ReturnType<typeof createDb>): Promise<number> {
  // Get all cards that have both JP and EN price stats
  const jpStats = await db.select().from(priceStats).where(eq(priceStats.region, 'jp'))

  const enStats = await db.select().from(priceStats).where(eq(priceStats.region, 'en'))

  // Group by cardId - get best price per card per region
  const jpByCard = new Map<string, (typeof jpStats)[0]>()
  for (const s of jpStats) {
    const existing = jpByCard.get(s.cardId)
    if (!existing || (s.avgPriceCents ?? 0) < (existing.avgPriceCents ?? 0)) {
      jpByCard.set(s.cardId, s)
    }
  }

  const enByCard = new Map<string, (typeof enStats)[0]>()
  for (const s of enStats) {
    const existing = enByCard.get(s.cardId)
    if (!existing || (s.avgPriceCents ?? 0) < (existing.avgPriceCents ?? 0)) {
      enByCard.set(s.cardId, s)
    }
  }

  // Clear old alerts
  await db.update(arbitrageAlerts).set({ isActive: false })

  let alertCount = 0

  for (const [cardId, jpStat] of jpByCard) {
    const enStat = enByCard.get(cardId)
    if (!enStat) continue

    const jpCents = jpStat.avgPriceCents ?? 0
    const enCents = enStat.avgPriceCents ?? 0
    if (jpCents === 0 || enCents === 0) continue

    // Convert JP (JPY cents = yen) to USD for comparison
    const jpInUsd = jpCents / JPY_PER_USD
    const enInUsd = enCents / 100
    const spreadPercent = ((enInUsd - jpInUsd) / jpInUsd) * 100

    if (spreadPercent > 10) {
      await db.insert(arbitrageAlerts).values({
        cardId,
        jpPriceCents: jpCents,
        enPriceCents: enCents,
        jpCurrency: 'JPY',
        enCurrency: 'USD',
        spreadPercent: Math.round(spreadPercent * 10) / 10,
        jpMarketplace: jpStat.marketplace,
        enMarketplace: enStat.marketplace,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      })
      alertCount++
    }
  }

  return alertCount
}

async function main() {
  const db = createDb()
  const args = process.argv.slice(2)

  // If specific sets given, use those. Otherwise get all sets from DB
  let targetSetIds: string[]
  if (args.length > 0) {
    targetSetIds = args
  } else {
    const allSets = await db.select({ id: sets.id }).from(sets)
    targetSetIds = allSets.map((s) => s.id)
  }

  console.log('=== PokeCardex Price Import ===')
  console.log(`Target sets: ${targetSetIds.join(', ')}`)

  let totalPrices = 0
  let totalStats = 0

  for (const setId of targetSetIds) {
    console.log(`\nProcessing set: ${setId}...`)
    try {
      const result = await importPricesForSet(db, setId)
      totalPrices += result.pricesAdded
      totalStats += result.statsUpdated
      console.log(`  + ${result.pricesAdded} prices, ${result.statsUpdated} stats`)
    } catch (err) {
      console.error(`  ERROR importing prices for ${setId}:`, err)
    }
  }

  console.log('\n--- Generating arbitrage alerts ---')
  const alertCount = await generateArbitrageAlerts(db)
  console.log(`Generated ${alertCount} arbitrage alerts`)

  console.log('\n=== Price Import Complete ===')
  console.log(`Prices added: ${totalPrices}`)
  console.log(`Stats updated: ${totalStats}`)
  console.log(`Alerts generated: ${alertCount}`)
}

main()
