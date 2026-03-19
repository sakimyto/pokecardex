import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cardsApi } from '~/routes/api/cards.ts'
import { newsApi } from '~/routes/api/news.ts'
import { pricesApi } from '~/routes/api/prices.ts'
import { setsApi } from '~/routes/api/sets.ts'
import { health } from '~/routes/health.ts'
import { pages } from '~/routes/pages.ts'

const app = new Hono()

app.use(logger())

// Health check
app.route('/', health)

// API routes
app.route('/api/sets', setsApi)
app.route('/api/cards', cardsApi)
app.route('/api/news', newsApi)
app.route('/api/prices', pricesApi)

// SSR pages
app.route('/', pages)

export { app }
