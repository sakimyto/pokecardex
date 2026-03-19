import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// Pokemon card sets (e.g. "Scarlet & Violet", "151")
// Each set has both JP and EN identifiers since JP sets release first
export const sets = sqliteTable(
  'sets',
  {
    id: text('id').primaryKey(), // slug: "sv-scarlet-violet"
    nameJa: text('name_ja').notNull(),
    nameEn: text('name_en'),
    codeJa: text('code_ja').notNull(), // JP set code: "SV1"
    codeEn: text('code_en'), // EN set code (null if not yet released)
    seriesJa: text('series_ja').notNull(), // e.g. "スカーレット＆バイオレット"
    seriesEn: text('series_en'),
    totalCards: integer('total_cards'),
    releaseDateJa: text('release_date_ja'), // ISO date
    releaseDateEn: text('release_date_en'),
    imageUrl: text('image_url'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [uniqueIndex('sets_code_ja_idx').on(table.codeJa)],
)

// Individual Pokemon cards
// Cards are the core entity — every card has JP data, EN data may lag
export const cards = sqliteTable(
  'cards',
  {
    id: text('id').primaryKey(), // slug: "sv1-001"
    setId: text('set_id')
      .notNull()
      .references(() => sets.id),
    numberInSet: text('number_in_set').notNull(), // "001/078"
    nameJa: text('name_ja').notNull(),
    nameEn: text('name_en'),
    subtypeJa: text('subtype_ja'), // e.g. "たねポケモン"
    subtypeEn: text('subtype_en'),
    rarity: text('rarity'), // "C", "U", "R", "RR", "SR", "SAR", "UR", "AR"
    typeJa: text('type_ja'), // Pokemon type: "炎", "水"
    typeEn: text('type_en'),
    hp: integer('hp'),
    imageUrlJa: text('image_url_ja'),
    imageUrlEn: text('image_url_en'),
    artist: text('artist'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [uniqueIndex('cards_set_number_idx').on(table.setId, table.numberInSet)],
)

// Price records from various marketplaces
// Append-only: each row is a price snapshot at a point in time
export const prices = sqliteTable('prices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: text('card_id')
    .notNull()
    .references(() => cards.id),
  marketplace: text('marketplace').notNull(), // "mercari", "yahoo_auctions", "tcgplayer", "ebay"
  region: text('region').notNull(), // "jp" or "en"
  priceCents: integer('price_cents').notNull(), // price in smallest currency unit
  currency: text('currency').notNull(), // "JPY" or "USD"
  condition: text('condition'), // "mint", "near_mint", "played", etc.
  listingUrl: text('listing_url'),
  scrapedAt: text('scraped_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// Aggregated price statistics per card
// Updated periodically from the prices table
export const priceStats = sqliteTable(
  'price_stats',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id),
    marketplace: text('marketplace').notNull(),
    region: text('region').notNull(),
    currency: text('currency').notNull(),
    avgPriceCents: integer('avg_price_cents'),
    minPriceCents: integer('min_price_cents'),
    maxPriceCents: integer('max_price_cents'),
    medianPriceCents: integer('median_price_cents'),
    sampleCount: integer('sample_count').notNull().default(0),
    periodStart: text('period_start').notNull(), // start of aggregation window
    periodEnd: text('period_end').notNull(),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex('price_stats_card_market_period_idx').on(
      table.cardId,
      table.marketplace,
      table.region,
      table.periodStart,
    ),
  ],
)

// Translated news articles from JP Pokemon TCG sources
export const newsArticles = sqliteTable('news_articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceUrl: text('source_url').notNull().unique(),
  sourceName: text('source_name').notNull(), // "pokemon.co.jp", "pokeca-pokemon.jp"
  titleJa: text('title_ja').notNull(),
  titleEn: text('title_en'),
  bodyJa: text('body_ja').notNull(),
  bodyEn: text('body_en'),
  thumbnailUrl: text('thumbnail_url'),
  publishedAt: text('published_at').notNull(),
  translatedAt: text('translated_at'),
  translationModel: text('translation_model'), // which LLM did the translation
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// Arbitrage opportunities — computed from price comparisons
export const arbitrageAlerts = sqliteTable('arbitrage_alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: text('card_id')
    .notNull()
    .references(() => cards.id),
  jpPriceCents: integer('jp_price_cents').notNull(),
  enPriceCents: integer('en_price_cents').notNull(),
  jpCurrency: text('jp_currency').notNull().default('JPY'),
  enCurrency: text('en_currency').notNull().default('USD'),
  spreadPercent: real('spread_percent').notNull(), // (en - jp) / jp * 100
  jpMarketplace: text('jp_marketplace').notNull(),
  enMarketplace: text('en_marketplace').notNull(),
  detectedAt: text('detected_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  expiresAt: text('expires_at'), // alerts become stale
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
})
