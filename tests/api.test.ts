import { describe, expect, test } from 'bun:test'
import { app } from '~/app.ts'

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

  test('GET /sets returns HTML', async () => {
    const res = await app.request('/sets')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain('Card Sets')
  })
})
