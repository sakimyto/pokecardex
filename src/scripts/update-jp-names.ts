/**
 * Re-apply JP name mapping to existing cards that are using EN name fallback.
 * Run after updating pokemon-names-ja.ts or the lookupJaName function.
 *
 * Usage: bun run src/scripts/update-jp-names.ts
 */

import { eq, sql } from 'drizzle-orm'
import { pokemonNameEnToJa } from '../data/pokemon-names-ja.ts'
import { createDb } from '../db/index.ts'
import { cards } from '../db/schema.ts'

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

function lookupJaName(enName: string): string | null {
  if (pokemonNameEnToJa[enName]) return pokemonNameEnToJa[enName]

  const suffixes = [' ex', ' EX', ' V', ' VSTAR', ' VMAX', ' GX']
  for (const suffix of suffixes) {
    if (enName.endsWith(suffix)) {
      const base = enName.slice(0, -suffix.length)
      const jaBase = pokemonNameEnToJa[base]
      if (jaBase) return `${jaBase}${suffix.trim()}`
    }
  }

  for (const [prefix, jaPrefix] of Object.entries(trainerNameJa)) {
    if (enName.startsWith(`${prefix} `)) {
      const pokemonName = enName.slice(prefix.length + 1)
      const jaPokemon = pokemonNameEnToJa[pokemonName]
      if (jaPokemon) return `${jaPrefix}${jaPokemon}`
    }
  }

  return null
}

async function main() {
  const db = createDb()

  // Find cards where JP name equals EN name (using fallback)
  const fallbackCards = await db.select().from(cards).where(sql`${cards.nameJa} = ${cards.nameEn}`)

  console.log(`Found ${fallbackCards.length} cards using EN name fallback`)

  let updated = 0
  for (const card of fallbackCards) {
    if (!card.nameEn) continue
    const jaName = lookupJaName(card.nameEn)
    if (jaName) {
      await db.update(cards).set({ nameJa: jaName }).where(eq(cards.id, card.id))
      updated++
    }
  }

  console.log(`Updated ${updated} cards with JP names`)
}

main()
