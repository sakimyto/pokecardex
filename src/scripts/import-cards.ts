/**
 * Import real card data from pokemontcg.io API
 *
 * Usage:
 *   bun run src/scripts/import-cards.ts              # import all configured sets
 *   bun run src/scripts/import-cards.ts sv8 sv9      # import specific sets
 *
 * Features:
 * - Incremental: skips cards/sets already in DB
 * - Rate-limited: respects pokemontcg.io free tier (1000 req/day)
 * - JP mapping: adds Japanese names from static mapping where available
 */

import { eq } from 'drizzle-orm'
import { pokemonNameEnToJa } from '../data/pokemon-names-ja.ts'
import { typeEnToJa } from '../data/pokemon-types-ja.ts'
import { setsToImport, svSetMapping } from '../data/sv-set-mapping.ts'
import { createLocalDb as createDb } from '../db/local.ts'
import { cards, sets } from '../db/schema.ts'

const API_BASE = 'https://api.pokemontcg.io/v2'
const PAGE_SIZE = 250
const REQUEST_DELAY_MS = 2000 // be polite to the API — increased due to frequent 504s

interface ApiSet {
  id: string
  name: string
  series: string
  total: number
  releaseDate: string
  images: { symbol: string; logo: string }
}

interface ApiCard {
  id: string
  name: string
  supertype: string
  subtypes?: string[]
  hp?: string
  types?: string[]
  number: string
  rarity?: string
  artist?: string
  images: { small: string; large: string }
  set: { id: string; name: string; total: number }
  tcgplayer?: {
    url: string
    prices: Record<string, { market?: number; low?: number; mid?: number }>
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

/** Normalize card number to "001/191" format */
function normalizeNumber(num: string, total: number): string {
  const padded = num.padStart(3, '0')
  const totalPadded = String(total).padStart(3, '0')
  return `${padded}/${totalPadded}`
}

// Gym Leader EN→JP name mapping for possessive card names
const trainerNameJa: Record<string, string> = {
  "Brock's": 'タケシの',
  "Misty's": 'カスミの',
  "Lt. Surge's": 'マチスの',
  "Erika's": 'エリカの',
  "Sabrina's": 'ナツメの',
  "Koga's": 'キョウの',
  "Blaine's": 'カツラの',
  "Giovanni's": 'サカキの',
  "Rocket's": 'ロケット団の',
  Dark: 'わるい',
  Light: 'ひかるの',
}

/** Look up JP name for a Pokemon. Handles "ex", "V", possessives, etc. */
function lookupJaName(enName: string): string | null {
  // Direct match
  if (pokemonNameEnToJa[enName]) return pokemonNameEnToJa[enName]

  // Try stripping suffixes: "Charizard ex" → "Charizard"
  const suffixes = [' ex', ' EX', ' V', ' VSTAR', ' VMAX', ' GX']
  for (const suffix of suffixes) {
    if (enName.endsWith(suffix)) {
      const base = enName.slice(0, -suffix.length)
      const jaBase = pokemonNameEnToJa[base]
      if (jaBase) {
        return `${jaBase}${suffix.trim()}`
      }
    }
  }

  // Handle possessive/prefix names: "Brock's Geodude" → "タケシのイシツブテ"
  for (const [prefix, jaPrefix] of Object.entries(trainerNameJa)) {
    if (enName.startsWith(`${prefix} `)) {
      const pokemonName = enName.slice(prefix.length + 1)
      const jaPokemon = pokemonNameEnToJa[pokemonName]
      if (jaPokemon) {
        return `${jaPrefix}${jaPokemon}`
      }
    }
  }

  return null
}

/** Map EN type to JP */
function mapTypeToJa(types: string[] | undefined, supertype: string): string | null {
  if (supertype === 'Trainer') return 'トレーナーズ'
  if (supertype === 'Energy') return 'エネルギー'
  if (!types || types.length === 0) return null
  return typeEnToJa[types[0]] ?? null
}

/** Map EN rarity string to our short codes */
function normalizeRarity(rarity: string | undefined): string | null {
  if (!rarity) return null
  const map: Record<string, string> = {
    Common: 'C',
    Uncommon: 'U',
    Rare: 'R',
    'Double Rare': 'RR',
    'Ultra Rare': 'UR',
    'Illustration Rare': 'IR',
    'Special Illustration Rare': 'SIR',
    'Hyper Rare': 'HR',
    'Shiny Rare': 'S',
    'Shiny Ultra Rare': 'SUR',
    'ACE SPEC Rare': 'ACE',
    'Rare Holo': 'R',
    'Rare Holo V': 'RR',
    'Rare Holo VSTAR': 'RR',
    'Rare Holo VMAX': 'RR',
    'Rare Secret': 'SR',
    'Rare Ultra': 'UR',
    'Rare Rainbow': 'HR',
    'Amazing Rare': 'AR',
    Promo: 'PR',
  }
  return map[rarity] ?? rarity
}

async function importSet(
  db: ReturnType<typeof createDb>,
  setId: string,
): Promise<{
  setsAdded: number
  cardsAdded: number
  cardsSkipped: number
}> {
  const stats = { setsAdded: 0, cardsAdded: 0, cardsSkipped: 0 }

  // Fetch set info from API
  console.log(`\nFetching set: ${setId}...`)
  const { data: apiSet } = await fetchJson<{ data: ApiSet }>(`${API_BASE}/sets/${setId}`)

  // Check if set exists in DB
  const existingSet = await db.select().from(sets).where(eq(sets.id, setId))
  const jpInfo = svSetMapping[setId]

  if (existingSet.length === 0) {
    await db.insert(sets).values({
      id: setId,
      nameJa: jpInfo?.nameJa ?? apiSet.name,
      nameEn: apiSet.name,
      codeJa: jpInfo?.codeJa ?? setId.toUpperCase(),
      codeEn: setId.toUpperCase(),
      seriesJa: jpInfo?.seriesJa ?? apiSet.series,
      seriesEn: apiSet.series,
      totalCards: apiSet.total,
      releaseDateJa: jpInfo?.releaseDateJa ?? null,
      releaseDateEn: apiSet.releaseDate.replace(/\//g, '-'),
      imageUrl: apiSet.images.logo,
    })
    console.log(`  + Set: ${apiSet.name} (${jpInfo?.nameJa ?? 'no JP mapping'})`)
    stats.setsAdded = 1
  } else {
    // Update existing set with EN data if missing
    const existing = existingSet[0]
    if (!existing.nameEn || !existing.imageUrl) {
      await db
        .update(sets)
        .set({
          nameEn: existing.nameEn ?? apiSet.name,
          codeEn: existing.codeEn ?? setId.toUpperCase(),
          seriesEn: existing.seriesEn ?? apiSet.series,
          releaseDateEn: existing.releaseDateEn ?? apiSet.releaseDate.replace(/\//g, '-'),
          imageUrl: existing.imageUrl ?? apiSet.images.logo,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(sets.id, setId))
      console.log(`  ~ Set updated: ${apiSet.name}`)
    } else {
      console.log(`  = Set exists: ${apiSet.name}`)
    }
  }

  // Fetch all cards for this set (paginated)
  let page = 1
  let totalFetched = 0

  while (true) {
    await sleep(REQUEST_DELAY_MS)
    const url = `${API_BASE}/cards?q=set.id:${setId}&pageSize=${PAGE_SIZE}&page=${page}`
    console.log(`  Fetching cards page ${page}...`)

    const response = await fetchJson<{
      data: ApiCard[]
      totalCount: number
    }>(url)

    for (const apiCard of response.data) {
      const cardId = apiCard.id
      const existing = await db.select().from(cards).where(eq(cards.id, cardId))

      if (existing.length > 0) {
        stats.cardsSkipped++
        continue
      }

      const jaName = lookupJaName(apiCard.name)
      const printedTotal = apiCard.set.total

      await db.insert(cards).values({
        id: cardId,
        setId: setId,
        numberInSet: normalizeNumber(apiCard.number, printedTotal),
        nameJa: jaName ?? apiCard.name, // fallback to EN name if no JP mapping
        nameEn: apiCard.name,
        subtypeJa: null,
        subtypeEn: apiCard.subtypes?.join(', ') ?? null,
        rarity: normalizeRarity(apiCard.rarity),
        typeJa: mapTypeToJa(apiCard.types, apiCard.supertype),
        typeEn: apiCard.types?.[0] ?? apiCard.supertype,
        hp: apiCard.hp ? Number.parseInt(apiCard.hp, 10) : null,
        imageUrlJa: null,
        imageUrlEn: apiCard.images.large,
        artist: apiCard.artist ?? null,
      })
      stats.cardsAdded++
    }

    totalFetched += response.data.length
    if (totalFetched >= response.totalCount) break
    page++
  }

  console.log(`  Done: +${stats.cardsAdded} cards, ${stats.cardsSkipped} skipped`)
  return stats
}

async function main() {
  const db = createDb()
  const args = process.argv.slice(2)
  const targetSets = args.length > 0 ? args : setsToImport

  console.log('=== PokeCardex Card Import ===')
  console.log(`Target sets: ${targetSets.join(', ')}`)

  let totalSets = 0
  let totalCards = 0
  let totalSkipped = 0

  for (const setId of targetSets) {
    try {
      const stats = await importSet(db, setId)
      totalSets += stats.setsAdded
      totalCards += stats.cardsAdded
      totalSkipped += stats.cardsSkipped
    } catch (err) {
      console.error(`  ERROR importing ${setId}:`, err)
    }
  }

  console.log('\n=== Import Complete ===')
  console.log(`Sets added: ${totalSets}`)
  console.log(`Cards added: ${totalCards}`)
  console.log(`Cards skipped (already exist): ${totalSkipped}`)
}

main()
