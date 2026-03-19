import { Hono } from 'hono'
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

// Cache headers for SSR pages (short cache, stale-while-revalidate)
app.use('*', async (c, next) => {
  await next()
  if (c.res.headers.get('Content-Type')?.includes('text/html')) {
    c.res.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    )
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
