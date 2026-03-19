import { eq, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '~/db/index.ts'
import { cards, sets } from '~/db/schema.ts'
import { escapeHtml, layout, rarityBadge, typeBadge } from '~/views/layout.ts'

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
          <h3>${escapeHtml(s.nameJa)}${s.nameEn ? ` / ${escapeHtml(s.nameEn)}` : ''}</h3>
          <p class="meta">Code: ${escapeHtml(s.codeJa)}${s.codeEn ? ` / ${escapeHtml(s.codeEn)}` : ''}</p>
          ${s.totalCards ? `<p class="meta">${s.totalCards} cards</p>` : ''}
          ${s.releaseDateJa ? `<p class="meta">JP Release: ${escapeHtml(s.releaseDateJa)}</p>` : ''}
          <p class="meta">${escapeHtml(s.seriesJa)}</p>
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
            <h4>${escapeHtml(card.nameJa)}</h4>
            ${card.nameEn ? `<p class="meta">${escapeHtml(card.nameEn)}</p>` : ''}
            <p class="meta">
              ${escapeHtml(card.numberInSet)}
              ${rarityBadge(card.rarity)}
              ${typeBadge(card.typeEn)}
            </p>
            ${card.hp ? `<p class="meta">HP ${card.hp}</p>` : ''}
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
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: setTitle,
        description: `Pokemon TCG set: ${set.nameJa}`,
        numberOfItems: setCards.length,
      },
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

  const cardTitle = `${card.nameJa}${card.nameEn ? ` / ${card.nameEn}` : ''}`
  const setTitle = set ? `${set.nameJa}${set.nameEn ? ` / ${set.nameEn}` : ''}` : card.setId

  const body = layout(
    cardTitle,
    `
    <div class="breadcrumb">
      <a href="/sets">Sets</a> &rsaquo;
      <a href="/sets/${escapeHtml(card.setId)}">${escapeHtml(typeof setTitle === 'string' ? setTitle : card.setId)}</a> &rsaquo;
      ${escapeHtml(cardTitle)}
    </div>
    <h2>${escapeHtml(cardTitle)}</h2>
    <div style="display:grid;grid-template-columns:1fr;gap:2rem;margin-top:1rem;">
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
    `,
    {
      title: cardTitle,
      description: `${card.nameJa} (${card.nameEn ?? ''}) - ${card.numberInSet} from ${set?.nameJa ?? card.setId}. Rarity: ${card.rarity ?? 'N/A'}.`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: cardTitle,
        description: `Pokemon TCG card: ${card.nameJa}`,
        category: 'Trading Card',
        brand: { '@type': 'Brand', name: 'Pokemon TCG' },
      },
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
                 <h4>${escapeHtml(card.nameJa)}</h4>
                 ${card.nameEn ? `<p class="meta">${escapeHtml(card.nameEn)}</p>` : ''}
                 <p class="meta">
                   ${escapeHtml(card.numberInSet)}
                   ${rarityBadge(card.rarity)}
                   ${typeBadge(card.typeEn)}
                 </p>
                 ${card.hp ? `<p class="meta">HP ${card.hp}</p>` : ''}
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
    },
  )
  return c.html(body)
})

export { pages }
