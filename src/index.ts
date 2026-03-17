const server = Bun.serve({
  port: Number(process.env.PORT) || 3000,
  fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
    }

    return Response.json({ message: 'pokecardex' })
  },
})

console.log(`Server running at http://localhost:${server.port}`)
