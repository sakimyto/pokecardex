import { desc, eq, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '~/db/index.ts'
import { cards, newsArticles, sets } from '~/db/schema.ts'
import {
  formatPrice,
  getActiveArbitrageAlerts,
  getCardPriceSummary,
  getRecentPrices,
} from '~/services/prices.ts'
import { BASE_URL, escapeHtml, layout, rarityBadge, typeBadge } from '~/views/layout.ts'

function cardImage(card: {
  imageUrlEn: string | null
  nameJa: string
  nameEn: string | null
}): string {
  if (!card.imageUrlEn) return ''
  return `<img class="card-img" src="${escapeHtml(card.imageUrlEn)}" alt="${escapeHtml(card.nameEn ?? card.nameJa)}" loading="lazy">`
}

function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }
}

const pages = new Hono()

pages.get('/', (c) => {
  const body = layout(
    'Home',
    `
    <h2>JP Pokemon Card Intelligence</h2>
    <p>Track Japanese Pokemon TCG cards, prices, and news &mdash; translated to English.</p>
    <div style="margin-top:2rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
      <div class="set-card">
        <h3>Card Database</h3>
        <p>Every JP set indexed with EN translations, images, and rarity info.</p>
        <a href="/sets">Browse Sets &rarr;</a>
      </div>
      <div class="set-card">
        <h3>Card Search</h3>
        <p>Search cards by Japanese or English name.</p>
        <a href="/search">Search Cards &rarr;</a>
      </div>
      <div class="set-card">
        <h3>Price Tracker</h3>
        <p>Compare JP vs EN prices and find arbitrage opportunities.</p>
        <a href="/prices">View Prices &rarr;</a>
      </div>
      <div class="set-card">
        <h3>News Feed</h3>
        <p>Latest JP Pokemon TCG news, translated to English by AI.</p>
        <a href="/news">Read News &rarr;</a>
      </div>
    </div>
    `,
    {
      title: 'Home',
      description:
        'PokeCardex: Japanese Pokemon TCG card database with EN translations, JP/EN price comparison, and translated news.',
      path: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'PokeCardex',
        description:
          'Japanese Pokemon TCG card database with EN translations, price tracking, and news.',
      },
    },
  )
  return c.html(body)
})

pages.get('/sets', async (c) => {
  const allSets = await db.select().from(sets)
  const setList =
    allSets.length === 0
      ? '<p>No sets indexed yet. Data will appear once scraping begins.</p>'
      : allSets
          .map(
            (s) => `
      <a href="/sets/${escapeHtml(s.id)}" style="text-decoration:none;color:inherit;">
        <div class="set-card" style="cursor:pointer;">
          ${s.imageUrl ? `<img class="set-logo" src="${escapeHtml(s.imageUrl)}" alt="${escapeHtml(s.nameEn ?? s.nameJa)}" loading="lazy">` : ''}
          <h3>${escapeHtml(s.nameJa)}${s.nameEn ? ` / ${escapeHtml(s.nameEn)}` : ''}</h3>
          <p class="meta">${escapeHtml(s.codeJa)} &middot; ${s.totalCards ?? '?'} cards</p>
          ${s.releaseDateJa ? `<p class="meta">JP: ${escapeHtml(s.releaseDateJa)}${s.releaseDateEn ? ` / EN: ${escapeHtml(s.releaseDateEn)}` : ''}</p>` : ''}
        </div>
      </a>
    `,
          )
          .join('')

  const body = layout(
    'Sets',
    `
    <h2>Card Sets</h2>
    <p>Browse Japanese Pokemon TCG sets with English translations.</p>
    <div style="margin-top:1.5rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;">
      ${setList}
    </div>
    `,
    {
      title: 'Card Sets',
      description:
        'Browse all Japanese Pokemon TCG card sets with English translations, release dates, and card counts.',
      path: '/sets',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Pokemon TCG Sets',
        description: 'Complete index of Japanese Pokemon TCG sets',
        numberOfItems: allSets.length,
      },
    },
  )
  return c.html(body)
})

pages.get('/sets/:id', async (c) => {
  const setId = c.req.param('id')
  const setResult = await db.select().from(sets).where(eq(sets.id, setId))
  if (setResult.length === 0) {
    return c.html(
      layout('Not Found', '<h2>Set not found</h2><p><a href="/sets">&larr; Back to sets</a></p>'),
      404,
    )
  }

  const set = setResult[0]
  const setCards = await db.select().from(cards).where(eq(cards.setId, setId))

  const cardGrid =
    setCards.length === 0
      ? '<p>No cards indexed for this set yet.</p>'
      : setCards
          .map(
            (card) => `
        <a href="/cards/${escapeHtml(card.id)}" style="text-decoration:none;color:inherit;">
          <div class="card-item">
            ${cardImage(card)}
            <h4>${escapeHtml(card.nameJa)}</h4>
            ${card.nameEn && card.nameEn !== card.nameJa ? `<p class="meta">${escapeHtml(card.nameEn)}</p>` : ''}
            <p class="meta">
              ${escapeHtml(card.numberInSet)}
              ${rarityBadge(card.rarity)}
              ${typeBadge(card.typeEn)}
            </p>
          </div>
        </a>
      `,
          )
          .join('')

  const setTitle = `${set.nameJa}${set.nameEn ? ` / ${set.nameEn}` : ''}`

  const body = layout(
    setTitle,
    `
    <div class="breadcrumb"><a href="/sets">Sets</a> &rsaquo; ${escapeHtml(setTitle)}</div>
    <h2>${escapeHtml(setTitle)}</h2>
    <table class="detail-table">
      <tr><th>Code</th><td>${escapeHtml(set.codeJa)}${set.codeEn ? ` / ${escapeHtml(set.codeEn)}` : ''}</td></tr>
      <tr><th>Series</th><td>${escapeHtml(set.seriesJa)}${set.seriesEn ? ` / ${escapeHtml(set.seriesEn)}` : ''}</td></tr>
      ${set.totalCards ? `<tr><th>Total Cards</th><td>${set.totalCards}</td></tr>` : ''}
      ${set.releaseDateJa ? `<tr><th>JP Release</th><td>${escapeHtml(set.releaseDateJa)}</td></tr>` : ''}
      ${set.releaseDateEn ? `<tr><th>EN Release</th><td>${escapeHtml(set.releaseDateEn)}</td></tr>` : ''}
    </table>
    <h3 style="margin-top:2rem;">Cards (${setCards.length} indexed)</h3>
    <div class="card-grid">
      ${cardGrid}
    </div>
    `,
    {
      title: setTitle,
      description: `${set.nameJa} (${set.codeJa}) - ${set.totalCards ?? '?'} cards. Japanese Pokemon TCG set with English translations.`,
      path: `/sets/${set.id}`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: setTitle,
          description: `Pokemon TCG set: ${set.nameJa}`,
          numberOfItems: setCards.length,
        },
        breadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Sets', url: '/sets' },
          { name: setTitle, url: `/sets/${set.id}` },
        ]),
      ],
    },
  )
  return c.html(body)
})

pages.get('/cards/:id', async (c) => {
  const cardId = c.req.param('id')
  const cardResult = await db.select().from(cards).where(eq(cards.id, cardId))
  if (cardResult.length === 0) {
    return c.html(
      layout('Not Found', '<h2>Card not found</h2><p><a href="/sets">&larr; Back to sets</a></p>'),
      404,
    )
  }

  const card = cardResult[0]
  const setResult = await db.select().from(sets).where(eq(sets.id, card.setId))
  const set = setResult[0]

  const [priceSummary, recentPrices] = await Promise.all([
    getCardPriceSummary(card.id),
    getRecentPrices(card.id),
  ])

  const cardTitle = `${card.nameJa}${card.nameEn ? ` / ${card.nameEn}` : ''}`
  const setTitle = set ? `${set.nameJa}${set.nameEn ? ` / ${set.nameEn}` : ''}` : card.setId

  const hasPrices = priceSummary.jp.length > 0 || priceSummary.en.length > 0

  const priceSection = !hasPrices
    ? ''
    : `
    <div class="set-card" style="margin-top:1.5rem;">
      <h3>Price Comparison</h3>
      ${
        priceSummary.arbitrage
          ? `<div class="arbitrage-badge" style="margin:1rem 0;padding:0.75rem 1rem;background:${priceSummary.arbitrage.spreadPercent > 50 ? '#dcfce7' : '#fef3c7'};border-radius:8px;font-weight:600;">
              Arbitrage: JP ¥${priceSummary.arbitrage.jpPriceJpy.toLocaleString()} (~$${priceSummary.arbitrage.jpInUsd.toFixed(2)}) vs EN $${(priceSummary.arbitrage.enPriceUsd / 100).toFixed(2)}
              &mdash; <span style="color:${priceSummary.arbitrage.spreadPercent > 50 ? '#16a34a' : '#d97706'};">${priceSummary.arbitrage.spreadPercent > 0 ? '+' : ''}${priceSummary.arbitrage.spreadPercent}% spread</span>
            </div>`
          : ''
      }
      <div class="price-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1rem;">
        <div>
          <h4 style="color:#e11d48;margin-bottom:0.5rem;">🇯🇵 JP Markets</h4>
          ${
            priceSummary.jp.length === 0
              ? '<p class="meta">No JP price data yet</p>'
              : `<table class="detail-table">
              ${priceSummary.jp.map((p) => `<tr><th>${escapeHtml(p.marketplace)}</th><td>${formatPrice(p.avgCents, p.currency)}</td></tr>`).join('')}
            </table>`
          }
        </div>
        <div>
          <h4 style="color:#2563eb;margin-bottom:0.5rem;">🌍 EN Markets</h4>
          ${
            priceSummary.en.length === 0
              ? '<p class="meta">No EN price data yet</p>'
              : `<table class="detail-table">
              ${priceSummary.en.map((p) => `<tr><th>${escapeHtml(p.marketplace)}</th><td>${formatPrice(p.avgCents, p.currency)}</td></tr>`).join('')}
            </table>`
          }
        </div>
      </div>
    </div>
    ${
      recentPrices.length > 0
        ? `<div class="set-card" style="margin-top:1.5rem;">
        <h3>Recent Price History</h3>
        <table class="detail-table" style="margin-top:0.5rem;">
          <thead><tr><th>Date</th><th>Source</th><th>Price</th><th>Condition</th></tr></thead>
          <tbody>
            ${recentPrices
              .map(
                (p) =>
                  `<tr>
                <td class="meta">${new Date(p.scrapedAt).toLocaleDateString()}</td>
                <td>${escapeHtml(p.marketplace)} (${p.region.toUpperCase()})</td>
                <td><strong>${formatPrice(p.priceCents, p.currency)}</strong></td>
                <td class="meta">${p.condition ? escapeHtml(p.condition) : '—'}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>`
        : ''
    }`

  const body = layout(
    cardTitle,
    `
    <div class="breadcrumb">
      <a href="/sets">Sets</a> &rsaquo;
      <a href="/sets/${escapeHtml(card.setId)}">${escapeHtml(typeof setTitle === 'string' ? setTitle : card.setId)}</a> &rsaquo;
      ${escapeHtml(cardTitle)}
    </div>
    <h2>${escapeHtml(cardTitle)}</h2>
    <div class="detail-layout" style="display:grid;grid-template-columns:auto 1fr;gap:2rem;margin-top:1rem;align-items:start;">
      ${card.imageUrlEn ? `<img class="card-detail-img" src="${escapeHtml(card.imageUrlEn)}" alt="${escapeHtml(card.nameEn ?? card.nameJa)}">` : ''}
      <div class="set-card">
        <table class="detail-table">
          <tr><th>Name (JP)</th><td>${escapeHtml(card.nameJa)}</td></tr>
          ${card.nameEn ? `<tr><th>Name (EN)</th><td>${escapeHtml(card.nameEn)}</td></tr>` : ''}
          <tr><th>Set</th><td><a href="/sets/${escapeHtml(card.setId)}">${escapeHtml(typeof setTitle === 'string' ? setTitle : card.setId)}</a></td></tr>
          <tr><th>Number</th><td>${escapeHtml(card.numberInSet)}</td></tr>
          ${card.rarity ? `<tr><th>Rarity</th><td>${rarityBadge(card.rarity)}</td></tr>` : ''}
          ${card.typeEn ? `<tr><th>Type</th><td>${typeBadge(card.typeEn)} ${card.typeJa ? `(${escapeHtml(card.typeJa)})` : ''}</td></tr>` : ''}
          ${card.hp ? `<tr><th>HP</th><td>${card.hp}</td></tr>` : ''}
          ${card.artist ? `<tr><th>Artist</th><td>${escapeHtml(card.artist)}</td></tr>` : ''}
        </table>
      </div>
    </div>
    ${priceSection}
    `,
    {
      title: cardTitle,
      description: `${card.nameJa} (${card.nameEn ?? ''}) - ${card.numberInSet} from ${set?.nameJa ?? card.setId}. Rarity: ${card.rarity ?? 'N/A'}.`,
      path: `/cards/${card.id}`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: cardTitle,
          description: `Pokemon TCG card: ${card.nameJa}`,
          category: 'Trading Card',
          brand: { '@type': 'Brand', name: 'Pokemon TCG' },
        },
        breadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Sets', url: '/sets' },
          {
            name: typeof setTitle === 'string' ? setTitle : card.setId,
            url: `/sets/${card.setId}`,
          },
          { name: cardTitle, url: `/cards/${card.id}` },
        ]),
      ],
    },
  )
  return c.html(body)
})

pages.get('/search', async (c) => {
  const q = c.req.query('q')?.trim() ?? ''

  let results: (typeof cards.$inferSelect)[] = []
  if (q) {
    const pattern = `%${q}%`
    results = await db
      .select()
      .from(cards)
      .where(or(like(cards.nameJa, pattern), like(cards.nameEn, pattern)))
  }

  const resultHtml = q
    ? results.length === 0
      ? `<p>No cards found for "${escapeHtml(q)}".</p>`
      : `<p>${results.length} card(s) found for "${escapeHtml(q)}".</p>
         <div class="card-grid">
           ${results
             .map(
               (card) => `
             <a href="/cards/${escapeHtml(card.id)}" style="text-decoration:none;color:inherit;">
               <div class="card-item">
                 ${cardImage(card)}
                 <h4>${escapeHtml(card.nameJa)}</h4>
                 ${card.nameEn && card.nameEn !== card.nameJa ? `<p class="meta">${escapeHtml(card.nameEn)}</p>` : ''}
                 <p class="meta">
                   ${escapeHtml(card.numberInSet)}
                   ${rarityBadge(card.rarity)}
                   ${typeBadge(card.typeEn)}
                 </p>
               </div>
             </a>
           `,
             )
             .join('')}
         </div>`
    : '<p>Enter a card name in Japanese or English to search.</p>'

  const body = layout(
    'Search Cards',
    `
    <h2>Search Cards</h2>
    <form class="search-form" method="get" action="/search">
      <input type="text" name="q" value="${escapeHtml(q)}" placeholder="Search by name (JP or EN)..." autofocus>
      <button type="submit">Search</button>
    </form>
    ${resultHtml}
    `,
    {
      title: 'Search Cards',
      description: 'Search Japanese Pokemon TCG cards by name in Japanese or English.',
      path: '/search',
    },
  )
  return c.html(body)
})

pages.get('/prices', async (c) => {
  const alerts = await getActiveArbitrageAlerts()

  const alertRows =
    alerts.length === 0
      ? '<p>No arbitrage opportunities detected yet. Check back once price data is collected.</p>'
      : `<table class="detail-table" style="margin-top:1rem;">
          <thead>
            <tr><th>Card</th><th>JP Price</th><th>EN Price</th><th>Spread</th><th></th></tr>
          </thead>
          <tbody>
            ${alerts
              .map(
                ({ alert, card }) => `
              <tr>
                <td>
                  <a href="/cards/${escapeHtml(card.id)}">
                    <strong>${escapeHtml(card.nameJa)}</strong>
                    ${card.nameEn ? `<br><span class="meta">${escapeHtml(card.nameEn)}</span>` : ''}
                  </a>
                </td>
                <td>¥${alert.jpPriceCents.toLocaleString()}<br><span class="meta">${escapeHtml(alert.jpMarketplace)}</span></td>
                <td>$${(alert.enPriceCents / 100).toFixed(2)}<br><span class="meta">${escapeHtml(alert.enMarketplace)}</span></td>
                <td><span style="color:${alert.spreadPercent > 50 ? '#16a34a' : '#d97706'};font-weight:600;">+${alert.spreadPercent.toFixed(1)}%</span></td>
                <td><a href="/cards/${escapeHtml(card.id)}">View &rarr;</a></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>`

  const body = layout(
    'Price Tracker',
    `
    <h2>JP↔EN Price Tracker</h2>
    <p>Arbitrage opportunities between Japanese and English Pokemon TCG markets. Buy low in Japan, sell high internationally.</p>
    <h3 style="margin-top:2rem;">Active Opportunities (${alerts.length})</h3>
    ${alertRows}
    `,
    {
      title: 'Price Tracker',
      description:
        'Compare Japanese and English Pokemon TCG card prices. Find arbitrage opportunities across Mercari, Yahoo Auctions, TCGPlayer, and eBay.',
      path: '/prices',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Pokemon TCG Price Tracker',
        description: 'JP vs EN price comparison for Pokemon TCG cards',
      },
    },
  )
  return c.html(body)
})

pages.get('/news', async (c) => {
  const articles = await db.select().from(newsArticles).orderBy(desc(newsArticles.publishedAt))

  const articleList =
    articles.length === 0
      ? '<p>No news articles yet. Check back soon for the latest JP Pokemon TCG news translated to English.</p>'
      : articles
          .map(
            (a) => `
        <a href="/news/${a.id}" style="text-decoration:none;color:inherit;">
          <div class="set-card" style="margin-bottom:1rem;cursor:pointer;">
            <h3>${escapeHtml(a.titleEn ?? a.titleJa)}</h3>
            <p class="meta" style="margin-bottom:0.5rem;">
              ${escapeHtml(a.titleJa)}
            </p>
            <p class="meta">
              ${new Date(a.publishedAt).toLocaleDateString()} &middot; ${escapeHtml(a.sourceName)}
              ${a.translatedAt ? ' &middot; Translated' : ''}
            </p>
            <p style="margin-top:0.5rem;color:#555;">
              ${escapeHtml((a.bodyEn ?? a.bodyJa).slice(0, 200))}${(a.bodyEn ?? a.bodyJa).length > 200 ? '...' : ''}
            </p>
          </div>
        </a>
      `,
          )
          .join('')

  const body = layout(
    'News',
    `
    <h2>JP Pokemon TCG News</h2>
    <p>Latest Japanese Pokemon TCG news, translated to English by AI.</p>
    <div style="margin-top:1.5rem;">
      ${articleList}
    </div>
    `,
    {
      title: 'News',
      description:
        'Latest Japanese Pokemon TCG news translated to English. Set announcements, tournament results, and more.',
      path: '/news',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Pokemon TCG News',
        description: 'Japanese Pokemon TCG news translated to English',
        numberOfItems: articles.length,
      },
    },
  )
  return c.html(body)
})

pages.get('/news/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (Number.isNaN(id)) {
    return c.html(
      layout(
        'Not Found',
        '<h2>Article not found</h2><p><a href="/news">&larr; Back to news</a></p>',
      ),
      404,
    )
  }

  const result = await db.select().from(newsArticles).where(eq(newsArticles.id, id))
  if (result.length === 0) {
    return c.html(
      layout(
        'Not Found',
        '<h2>Article not found</h2><p><a href="/news">&larr; Back to news</a></p>',
      ),
      404,
    )
  }

  const article = result[0]
  const title = article.titleEn ?? article.titleJa

  const body = layout(
    title,
    `
    <div class="breadcrumb"><a href="/news">News</a> &rsaquo; ${escapeHtml(title)}</div>
    <article>
      <h2>${escapeHtml(title)}</h2>
      <p class="meta" style="margin-bottom:0.5rem;">${escapeHtml(article.titleJa)}</p>
      <p class="meta" style="margin-bottom:1.5rem;">
        ${new Date(article.publishedAt).toLocaleDateString()} &middot; ${escapeHtml(article.sourceName)}
        ${article.translationModel ? ` &middot; Translated by ${escapeHtml(article.translationModel)}` : ''}
      </p>
      <div class="set-card">
        <h3>English</h3>
        <p style="line-height:1.8;margin-top:0.5rem;">${escapeHtml(article.bodyEn ?? 'Translation pending...')}</p>
      </div>
      <div class="set-card" style="margin-top:1rem;">
        <h3>Japanese (Original)</h3>
        <p style="line-height:1.8;margin-top:0.5rem;">${escapeHtml(article.bodyJa)}</p>
      </div>
    </article>
    `,
    {
      title,
      description: (article.bodyEn ?? article.bodyJa).slice(0, 160),
      path: `/news/${article.id}`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: title,
          datePublished: article.publishedAt,
          publisher: { '@type': 'Organization', name: article.sourceName },
        },
        breadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'News', url: '/news' },
          { name: title, url: `/news/${article.id}` },
        ]),
      ],
    },
  )
  return c.html(body)
})

export { pages }
