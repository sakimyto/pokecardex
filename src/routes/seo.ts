import { Hono } from 'hono'
import { cards, newsArticles, sets } from '~/db/schema.ts'
import type { AppEnv } from '~/types.ts'
import { BASE_URL } from '~/views/layout.ts'

const seo = new Hono<AppEnv>()

seo.get('/robots.txt', (c) => {
  const body = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`
  return c.text(body, 200, { 'Content-Type': 'text/plain' })
})

seo.get('/sitemap.xml', async (c) => {
  const db = c.var.db
  const allSets = await db.select({ id: sets.id, updatedAt: sets.updatedAt }).from(sets)
  const allCards = await db.select({ id: cards.id, updatedAt: cards.updatedAt }).from(cards)
  const allNews = await db
    .select({ id: newsArticles.id, publishedAt: newsArticles.publishedAt })
    .from(newsArticles)

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/sets', priority: '0.9', changefreq: 'daily' },
    { loc: '/search', priority: '0.7', changefreq: 'weekly' },
    { loc: '/prices', priority: '0.9', changefreq: 'daily' },
    { loc: '/news', priority: '0.9', changefreq: 'daily' },
  ]

  const urls = staticPages
    .map(
      (p) =>
        `  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    )
    .concat(
      allSets.map(
        (s) =>
          `  <url>
    <loc>${BASE_URL}/sets/${s.id}</loc>
    <lastmod>${s.updatedAt.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
      ),
    )
    .concat(
      allCards.map(
        (card) =>
          `  <url>
    <loc>${BASE_URL}/cards/${card.id}</loc>
    <lastmod>${card.updatedAt.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
      ),
    )
    .concat(
      allNews.map(
        (n) =>
          `  <url>
    <loc>${BASE_URL}/news/${n.id}</loc>
    <lastmod>${n.publishedAt.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
      ),
    )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return c.body(xml, 200, { 'Content-Type': 'application/xml' })
})

export { seo }
