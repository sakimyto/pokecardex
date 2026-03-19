import { describe, expect, test } from 'bun:test'
import { app } from '~/app.ts'

describe('Search edge cases', () => {
  test('Japanese name search returns results', async () => {
    const res = await app.request('/search?q=リザードン')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('card(s) found')
    expect(body).toContain('リザードン')
  })

  test('Partial name search works', async () => {
    const res = await app.request('/search?q=char')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('card(s) found')
    expect(body).toContain('Charizard')
  })

  test('Empty search query shows prompt', async () => {
    const res = await app.request('/search?q=')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('Enter a card name or select filters')
  })

  test('Search with no results shows appropriate message', async () => {
    const res = await app.request('/search?q=zzzznonexistent')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('No cards found')
  })

  test('Special characters in search are escaped', async () => {
    const res = await app.request('/search?q=%3Cscript%3E')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).not.toContain('<script>')
  })

  test('Search pagination page 1', async () => {
    const res = await app.request('/search?type=Colorless&page=1')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('card(s) found')
  })

  test('Search pagination preserves filters', async () => {
    const res = await app.request('/search?type=Fire&page=2')
    const body = await res.text()

    expect(res.status).toBe(200)
    // Filter should still be active in the form
    expect(body).toContain('selected')
  })

  test('Invalid page number defaults to 1', async () => {
    const res = await app.request('/search?type=Fire&page=-5')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('card(s) found')
  })

  test('API search with Japanese query', async () => {
    const res = await app.request('/api/cards?q=ピカチュウ')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
  })

  test('API search with setId filter', async () => {
    const res = await app.request('/api/cards?setId=sv3pt5')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
    expect(body.every((c: { setId: string }) => c.setId === 'sv3pt5')).toBe(true)
  })

  test('API card not found returns 404', async () => {
    const res = await app.request('/api/cards/nonexistent-card-id')

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Card not found')
  })
})
