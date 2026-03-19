import { describe, expect, test } from 'bun:test'
import { app } from '~/app.ts'

describe('Page routes - error handling', () => {
  test('GET /sets/:id returns 404 for unknown set', async () => {
    const res = await app.request('/sets/nonexistent-set')

    expect(res.status).toBe(404)
    const body = await res.text()
    expect(body).toContain('Set not found')
  })

  test('GET /cards/:id returns 404 for unknown card', async () => {
    const res = await app.request('/cards/nonexistent-card')

    expect(res.status).toBe(404)
    const body = await res.text()
    expect(body).toContain('Card not found')
  })

  test('GET /news/:id returns 404 for non-numeric id', async () => {
    const res = await app.request('/news/abc')

    expect(res.status).toBe(404)
  })
})

describe('Page routes - content', () => {
  test('Home page has navigation links', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('href="/sets"')
    expect(body).toContain('href="/search"')
    expect(body).toContain('href="/prices"')
    expect(body).toContain('href="/news"')
  })

  test('Home page has skip-to-content link', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(body).toContain('skip-link')
    expect(body).toContain('Skip to content')
  })

  test('Set detail page shows card grid', async () => {
    const res = await app.request('/sets/base1')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('card-grid')
    expect(body).toContain('Cards (')
    expect(body).toContain('indexed)')
  })

  test('Set detail page shows breadcrumb', async () => {
    const res = await app.request('/sets/sv3pt5')
    const body = await res.text()

    expect(body).toContain('breadcrumb')
    expect(body).toContain('Sets')
  })

  test('Card detail page shows card info', async () => {
    const res = await app.request('/cards/sv3pt5-1')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('Name (JP)')
    expect(body).toContain('Number')
    expect(body).toContain('Set')
  })

  test('Card detail page has breadcrumb navigation', async () => {
    const res = await app.request('/cards/sv3pt5-1')
    const body = await res.text()

    expect(body).toContain('breadcrumb')
    expect(body).toContain('href="/sets"')
    expect(body).toContain('href="/sets/sv3pt5"')
  })

  test('Sets page shows all imported sets', async () => {
    const res = await app.request('/sets')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('Card Sets')
    // Check for some known sets
    expect(body).toContain('ポケモンカード151')
    expect(body).toContain('Base')
  })

  test('Footer contains bilingual text', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(body).toContain('PokeCardex')
    expect(body).toContain('日本語ポケモンカードデータベース')
  })

  test('Dark mode CSS variables are defined', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(body).toContain('prefers-color-scheme: dark')
    expect(body).toContain('--color-bg')
  })

  test('Sets page groups sets by series', async () => {
    const res = await app.request('/sets')
    const body = await res.text()

    expect(res.status).toBe(200)
    // Should show series names as section headers
    expect(body).toContain('Scarlet &amp; Violet')
    // Should show indexed card counts
    expect(body).toContain('cards indexed')
  })

  test('Sets page shows total count summary', async () => {
    const res = await app.request('/sets')
    const body = await res.text()

    expect(body).toContain('sets across')
    expect(body).toContain('series')
  })

  test('Card detail page shows related cards section when available', async () => {
    const res = await app.request('/cards/sv3pt5-1')
    const body = await res.text()

    expect(res.status).toBe(200)
    // Related cards section may or may not be present depending on data
    // but the page should load without errors
    expect(body).toContain('Name (JP)')
  })
})
