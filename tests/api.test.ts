import { describe, expect, test } from 'bun:test'
import { app } from './helper.ts'

describe('API routes', () => {
  test('GET /api/sets returns array', async () => {
    const res = await app.request('/api/sets')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  test('GET /api/cards returns array', async () => {
    const res = await app.request('/api/cards')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  test('GET /api/news returns array', async () => {
    const res = await app.request('/api/news')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  test('GET /api/prices/arbitrage returns array', async () => {
    const res = await app.request('/api/prices/arbitrage')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })
})

describe('SSR pages', () => {
  test('GET / returns HTML', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(body).toContain('PokeCardex')
  })

  test('GET /sets returns HTML with seed data', async () => {
    const res = await app.request('/sets')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('Card Sets')
    expect(body).toContain('超電ブレイカー')
  })

  test('GET /sets/:id returns set detail with cards', async () => {
    const res = await app.request('/sets/sv7')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('ステラミラクル')
    expect(body).toContain('card-grid')
  })

  test('GET /sets/:id returns 404 for unknown set', async () => {
    const res = await app.request('/sets/nonexistent')

    expect(res.status).toBe(404)
  })

  test('GET /cards/:id returns card detail', async () => {
    const res = await app.request('/cards/sv7-010')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('リザードンex')
    expect(body).toContain('Charizard ex')
    expect(body).toContain('application/ld+json')
  })

  test('GET /cards/:id returns 404 for unknown card', async () => {
    const res = await app.request('/cards/nonexistent')

    expect(res.status).toBe(404)
  })

  test('GET /search returns search page', async () => {
    const res = await app.request('/search')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('Search Cards')
  })

  test('GET /search?q=pikachu returns results', async () => {
    const res = await app.request('/search?q=Pikachu')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('ピカチュウ')
    expect(body).toContain('card(s) found')
  })

  test('GET /search with type filter returns filtered results', async () => {
    const res = await app.request('/search?type=Fire')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('card(s) found')
    expect(body).toContain('type-fire')
  })

  test('GET /search with set filter returns filtered results', async () => {
    const res = await app.request('/search?set=sv3pt5')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('card(s) found')
  })

  test('GET /search with combined filters works', async () => {
    const res = await app.request('/search?type=Fire&rarity=R')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('card(s) found')
  })

  test('GET /search shows filter dropdowns', async () => {
    const res = await app.request('/search')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('All Types')
    expect(body).toContain('All Rarities')
    expect(body).toContain('All Sets')
  })

  test('GET /api/cards?q=pikachu returns search results', async () => {
    const res = await app.request('/api/cards?q=Pikachu')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThanOrEqual(1)
    expect(body.some((c: { nameEn: string }) => c.nameEn.includes('Pikachu'))).toBe(true)
  })

  test('GET /cards/:id shows price comparison for priced cards', async () => {
    const res = await app.request('/cards/sv7-010')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('Price Comparison')
    expect(body).toContain('JP Markets')
    expect(body).toContain('EN Markets')
    expect(body).toContain('mercari')
    expect(body).toContain('Recent Price History')
  })

  test('GET /cards/:id shows arbitrage badge for cards with spread', async () => {
    const res = await app.request('/cards/sv7-010')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('Arbitrage')
    expect(body).toContain('spread')
  })

  test('GET /cards/:id without prices has no price section', async () => {
    const res = await app.request('/cards/sv8-001')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('タマタマ')
    expect(body).not.toContain('Price Comparison')
  })

  test('GET /prices shows arbitrage page', async () => {
    const res = await app.request('/prices')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(body).toContain('Price Tracker')
    expect(body).toContain('Arbitrage')
    expect(body).toContain('Active Opportunities')
  })

  test('GET /prices shows arbitrage alerts with card names', async () => {
    const res = await app.request('/prices')
    const body = await res.text()

    expect(res.status).toBe(200)
    // Should contain at least one card from seed data
    expect(body).toContain('リザードンex')
    expect(body).toContain('mercari')
  })

  test('GET /api/prices/stats/:cardId returns price stats', async () => {
    const res = await app.request('/api/prices/stats/sv7-010')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
    expect(body[0].cardId).toBe('sv7-010')
  })

  test('GET /api/prices/arbitrage returns active alerts', async () => {
    const res = await app.request('/api/prices/arbitrage')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
    expect(body[0].spreadPercent).toBeGreaterThan(0)
  })

  test('GET /news shows news list page', async () => {
    const res = await app.request('/news')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(body).toContain('JP Pokemon TCG News')
    expect(body).toContain('Terastal Origin')
    expect(body).toContain('pokemon-card.com')
  })

  test('GET /news/:id shows article detail', async () => {
    const res = await app.request('/news/1')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('Super Electric Breaker')
    expect(body).toContain('English')
    expect(body).toContain('Japanese (Original)')
    expect(body).toContain('application/ld+json')
  })

  test('GET /news/:id returns 404 for unknown article', async () => {
    const res = await app.request('/news/99999')
    expect(res.status).toBe(404)
  })

  test('GET /api/news returns articles array with seed data', async () => {
    const res = await app.request('/api/news')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
    expect(body[0].titleEn).toBeDefined()
    expect(body[0].bodyEn).toBeDefined()
  })

  test('GET /api/news/:id returns single article', async () => {
    const res = await app.request('/api/news/1')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.sourceName).toBe('pokemon-card.com')
  })
})
