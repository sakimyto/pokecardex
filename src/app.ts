import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { logger } from 'hono/logger'
import { cardsApi } from '~/routes/api/cards.ts'
import { newsApi } from '~/routes/api/news.ts'
import { pricesApi } from '~/routes/api/prices.ts'
import { setsApi } from '~/routes/api/sets.ts'
import { health } from '~/routes/health.ts'
import { pages } from '~/routes/pages.ts'
import { seo } from '~/routes/seo.ts'

const app = new Hono()

app.use(logger())
app.use(compress())

// Cache headers
app.use('*', async (c, next) => {
  await next()
  const ct = c.res.headers.get('Content-Type') ?? ''
  if (ct.includes('text/html')) {
    c.res.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    )
  } else if (ct.includes('application/json')) {
    c.res.headers.set(
      'Cache-Control',
      'public, max-age=30, s-maxage=120, stale-while-revalidate=300',
    )
  } else if (ct.includes('text/xml') || ct.includes('text/plain')) {
    // sitemap.xml, robots.txt
    c.res.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  }
})

// Health check
app.route('/', health)

// SEO (robots.txt, sitemap.xml)
app.route('/', seo)

// API routes
app.route('/api/sets', setsApi)
app.route('/api/cards', cardsApi)
app.route('/api/news', newsApi)
app.route('/api/prices', pricesApi)

// SSR pages
app.route('/', pages)

export { app }
