import { afterAll, describe, expect, test } from 'bun:test'

const PORT = 9876

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
    }

    return Response.json({ message: 'pokecardex' })
  },
})

afterAll(() => {
  server.stop()
})

describe('health check', () => {
  test('GET /health returns ok', async () => {
    const res = await fetch(`http://localhost:${PORT}/health`)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeDefined()
  })

  test('GET / returns app name', async () => {
    const res = await fetch(`http://localhost:${PORT}/`)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.message).toBe('pokecardex')
  })
})
