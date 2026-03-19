import { describe, expect, test } from 'bun:test'
import { app } from '~/app.ts'

describe('health check', () => {
  test('GET /health returns ok', async () => {
    const res = await app.request('/health')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeDefined()
  })
})
