import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { logger } from 'hono/logger'
import { createDb } from '~/db/index.ts'
import { cardsApi } from '~/routes/api/cards.ts'
import { newsApi } from '~/routes/api/news.ts'
import { pricesApi } from '~/routes/api/prices.ts'
import { setsApi } from '~/routes/api/sets.ts'
import { health } from '~/routes/health.ts'
import { pages } from '~/routes/pages.ts'
import { seo } from '~/routes/seo.ts'
import type { AppDatabase, AppEnv } from '~/types.ts'

export function createApp(dbOverride?: AppDatabase) {
  const app = new Hono<AppEnv>()

  app.use(logger())
  app.use(compress())

  // Inject drizzle db: use override (tests) or D1 binding (production)
  app.use('*', async (c, next) => {
    if (dbOverride) {
      c.set('db', dbOverride)
    } else {
      c.set('db', createDb(c.env.DB))
    }
    await next()
  })

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

  return app
}

export const app = createApp()
